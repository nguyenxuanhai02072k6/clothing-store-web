import { useState, useEffect, useRef } from 'react';
import type { UserRole } from '@/types';
import { getActiveNode, DEFAULT_PER_ROLE } from '@/components/internal/nav/nav-registry';

interface NavigationHookProps {
  currentUser: any;
}

// 6 node quản trị (slice 1) đọc thanh sub-tab + landing từ registry. alias
// gia đình tài chính (finance-profit, 3 pill p-l/recon/costs) KỲ GIỮ legacy —
// không chạy qua NAV_ALIAS trong getSubTabs vì sẽ nuốt mất thanh 3-pill
// (alias-routing của vùng ngoài slice 1 được AppSidebar xử lý).
const REGISTRY_SUBTAB_NODES = new Set([
  'staff-schedule',
  'attendance',
  'products-database',
  'announcements',
  'audit-logs',
  'settings',
]);

export function useInternalNavigationState({ currentUser }: NavigationHookProps) {
  // Active Tab & Subtabs
  const [activeTab, setActiveTab] = useState('overview');
  const [salesOrdersSubTab, setSalesOrdersSubTab] = useState('pos');
  const [productsInventorySubTab, setProductsInventorySubTab] = useState('list');
  const [staffScheduleSubTab, setStaffScheduleSubTab] = useState('shifts');
  const [attendanceSubTab, setAttendanceSubTab] = useState('clock');
  const [financeProfitSubTab, setFinanceProfitSubTab] = useState('p-l');
  const [promotionsSubTab, setPromotionsSubTab] = useState('coupons');
  const [settingsRolesSubTab, setSettingsRolesSubTab] = useState('brand');
  const [customersSubTab, setCustomersSubTab] = useState('list');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent branch selection
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('novyn_selected_branch') || 'all';
    }
    return 'all';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('novyn_selected_branch', selectedBranch);
    }
  }, [selectedBranch]);

  // Smart initial workspace routing based on role
  const hasInitializedRoleTab = useRef(false);
  useEffect(() => {
    if (!currentUser?.role || hasInitializedRoleTab.current) return;
    hasInitializedRoleTab.current = true;
    if (activeTab !== 'overview') return;
    const role = currentUser.role as UserRole;
    // Slice 2: MỌI vai landing đọc từ registry (DEFAULT_PER_ROLE). Sub-tab
    // mặc định (matrix/pos/costs) lấy từ node.defaultSubTab — khớp legacy
    // setProductsInventorySubTab / setSalesOrdersSubTab / setFinanceProfitSubTab.
    const landing = DEFAULT_PER_ROLE[role];
    if (landing) {
      setActiveTab(landing);
      const sub = getActiveNode(landing)?.defaultSubTab;
      if (sub === 'matrix') setProductsInventorySubTab('matrix');
      if (sub === 'pos') setSalesOrdersSubTab('pos');
    }
  }, [currentUser?.role, activeTab]);

  // Reset default subtabs on role switch
  useEffect(() => {
    if (currentUser) {
      if (['director', 'manager', 'employee', 'cashier'].includes(currentUser.role)) {
        setSalesOrdersSubTab('pos');
      } else {
        setSalesOrdersSubTab('list');
      }
      setProductsInventorySubTab('list');
      setStaffScheduleSubTab('shifts');
      if (['director', 'accountant'].includes(currentUser.role)) {
        setFinanceProfitSubTab('p-l');
      } else if (currentUser.role === 'manager') {
        setFinanceProfitSubTab('costs');
      } else {
        setFinanceProfitSubTab('recon');
      }
      setPromotionsSubTab('coupons');
      setSettingsRolesSubTab('brand');
    }
  }, [currentUser]);

  const setCurrentSubTab = (id: string) => {
    if (activeTab === 'sales-orders') setSalesOrdersSubTab(id);
    else if (
      activeTab === 'products-inventory' ||
      activeTab === 'stocker-inventory' ||
      activeTab === 'stocker-transfer' ||
      activeTab === 'damaged-goods' ||
      activeTab === 'restock' ||
      activeTab === 'products-database'
    ) {
      setProductsInventorySubTab(id);
      if (id === 'matrix') setActiveTab('stocker-inventory');
      else if (id === 'transfer') setActiveTab('stocker-transfer');
      else if (id === 'damaged') setActiveTab('damaged-goods');
      else if (id === 'restock') setActiveTab('restock');
      else if (id === 'list') setActiveTab('products-database');
    } else if (activeTab === 'staff-schedule') setStaffScheduleSubTab(id);
    else if (activeTab === 'attendance') setAttendanceSubTab(id);
    else if (activeTab === 'finance-profit') setFinanceProfitSubTab(id);
    else if (activeTab === 'promotions') setPromotionsSubTab(id);
    else if (
      activeTab === 'settings-roles' ||
      activeTab === 'settings' ||
      activeTab === 'announcements' ||
      activeTab === 'audit-logs'
    ) {
      setSettingsRolesSubTab(id);
      if (id === 'announcements') setActiveTab('announcements');
      else if (id === 'brand') setActiveTab('settings');
      else if (id === 'channels') setActiveTab('settings-roles');
      else if (id === 'audit-logs') setActiveTab('audit-logs');
    } else if (activeTab === 'customers') setCustomersSubTab(id);
  };

  const getSubTabs = () => {
    const role = currentUser?.role as UserRole | undefined;
    // Slice 1: vùng quản trị (director/manager/accountant) đọc thanh sub-tab cho
    // 6 node quản trị từ registry (node.subTabs ∩ visibleFor). Thanh này được đối
    // chiếu 1-1 với switch legacy khi viết registry (Task 2); các node tách gia
    // đình (announcements/audit-logs/settings) chuyển từ thanh 4-pill cũ sang
    // thanh riêng theo node — đúng thiết kế "giảm loạn". Vai ngoài vùng
    // (floor staff, POS/CSKH/KHO) giữ switch legacy để thanh pill byte-identical.
    if (
      role &&
      ['director', 'manager', 'accountant'].includes(role) &&
      REGISTRY_SUBTAB_NODES.has(activeTab)
    ) {
      const node = getActiveNode(activeTab);
      if (node) {
        return node.subTabs
          .filter((s) => s.visibleFor.includes(role))
          .map((s) => ({ id: s.id, name: s.name }));
      }
    }
    switch (activeTab) {
      case 'sales-orders': {
        const tabs = [];
        if (['director', 'manager', 'employee', 'cashier'].includes(currentUser?.role)) {
          tabs.push({ id: 'pos', name: 'Quầy bán hàng POS' });
        }
        tabs.push({ id: 'list', name: 'Danh sách đơn hàng' });
        if (['director', 'manager', 'cskh', 'employee', 'cashier'].includes(currentUser?.role)) {
          tabs.push({ id: 'returns', name: 'Đổi trả & Khiếu nại' });
        }
        if (currentUser?.role === 'cskh') {
          tabs.push({ id: 'chat', name: 'Chat Trực tiếp' });
        }
        return tabs;
      }
      case 'products-inventory':
      case 'stocker-inventory':
      case 'stocker-transfer':
      case 'damaged-goods':
      case 'restock':
      case 'products-database': {
        const tabs = [
          { id: 'matrix', name: 'Tồn kho chi nhánh' },
          { id: 'transfer', name: 'Điều chuyển kho' },
          { id: 'damaged', name: 'Biên bản hàng lỗi' },
        ];
        if (['director', 'accountant', 'manager', 'stocker'].includes(currentUser?.role)) {
          tabs.push({ id: 'restock', name: 'Phiếu nhập hàng (Restock)' });
        }
        tabs.push({ id: 'list', name: 'Danh mục & Bảng giá' });
        return tabs;
      }
      case 'attendance': {
        if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
          return [
            { id: 'approval', name: 'Duyệt phép & Nhật ký chấm công' },
            { id: 'shifts', name: 'Lịch ca toàn chi nhánh' },
            { id: 'clock', name: 'Trạm chấm công cá nhân' },
          ];
        }
        return [
          { id: 'clock', name: 'Chấm công & Ca trực' },
          { id: 'requests', name: 'Đơn từ nghỉ phép' },
        ];
      }
      case 'staff-schedule': {
        const tabs = [{ id: 'shifts', name: 'Lịch ca làm việc' }];
        if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'approval', name: 'Xếp lịch & Duyệt phép' });
          tabs.push({ id: 'staff', name: 'Nhân sự & Tạo tài khoản' });
        }
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'payroll', name: 'Lương & Hoa hồng' });
        }
        if (['employee', 'cashier', 'stocker', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'requests', name: 'Đơn từ yêu cầu' });
        }
        return tabs;
      }
      case 'finance-profit': {
        const tabs = [];
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'p-l', name: 'Báo cáo P&L & Thuế' });
        }
        if (['director', 'accountant', 'cashier'].includes(currentUser?.role)) {
          tabs.push({ id: 'recon', name: 'Đối soát két tiền' });
        }
        if (['director', 'accountant', 'manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'costs', name: 'Chi phí vận hành' });
        }
        return tabs;
      }
      case 'promotions': {
        const tabs = [{ id: 'coupons', name: 'Mã giảm giá' }];
        if (['director', 'accountant', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'ai-marketing', name: 'Chiến dịch & Trợ lý AI' });
        }
        return tabs;
      }
      case 'settings-roles':
      case 'settings':
      case 'announcements':
      case 'audit-logs': {
        const tabs = [];
        if (['director', 'manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'announcements', name: 'Thông báo & Chỉ đạo' });
        }
        tabs.push({ id: 'brand', name: 'Cấu hình chi nhánh' });
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'channels', name: 'Đồng bộ đa kênh' });
        }
        if (['director'].includes(currentUser?.role)) {
          tabs.push({ id: 'audit-logs', name: 'Nhật ký hoạt động' });
        }
        return tabs;
      }
      case 'customers': {
        const tabs = [
          { id: 'list', name: 'Danh sách khách' },
          { id: 'vip', name: 'Thành viên VIP' },
        ];
        if (['director', 'manager', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'reviews', name: 'Phản hồi đánh giá' });
        }
        return tabs;
      }
      default:
        return [];
    }
  };

  const handleSidebarChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'pos-sales') {
      setSalesOrdersSubTab('pos');
    } else if (tabId === 'sales-orders-list') {
      setSalesOrdersSubTab('list');
    } else if (tabId === 'returns-exchange') {
      setSalesOrdersSubTab('returns');
    } else if (tabId === 'cskh-hub') {
      setSalesOrdersSubTab('chat');
    } else if (tabId === 'customers-list') {
      setCustomersSubTab('list');
    } else if (tabId === 'customers-vip') {
      setCustomersSubTab('vip');
    } else if (tabId === 'reviews') {
      setCustomersSubTab('reviews');
    } else if (tabId === 'products-database') {
      setProductsInventorySubTab('list');
    } else if (tabId === 'stocker-inventory') {
      setProductsInventorySubTab('matrix');
    } else if (tabId === 'restock') {
      setProductsInventorySubTab('restock');
    } else if (tabId === 'stocker-transfer') {
      setProductsInventorySubTab('transfer');
    } else if (tabId === 'damaged-goods') {
      setProductsInventorySubTab('damaged');
    } else if (tabId === 'finance-costs' || tabId === 'costs') {
      setFinanceProfitSubTab('costs');
    } else if (tabId === 'finance-payroll' || tabId === 'staff') {
      setStaffScheduleSubTab('payroll');
    } else if (tabId === 'finance-recon' || tabId === 'recon') {
      setFinanceProfitSubTab('recon');
    } else if (tabId === 'finance-p-l' || tabId === 'finance-profit') {
      setFinanceProfitSubTab('p-l');
    } else if (tabId === 'staff-schedule' || tabId === 'shifts') {
      setStaffScheduleSubTab('shifts');
    } else if (tabId === 'attendance') {
      if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
        setAttendanceSubTab('approval');
        setStaffScheduleSubTab('approval');
      } else {
        setAttendanceSubTab('clock');
        setStaffScheduleSubTab('shifts');
      }
    } else if (tabId === 'announcements') {
      setSettingsRolesSubTab('announcements');
    } else if (tabId === 'audit-logs') {
      setSettingsRolesSubTab('audit-logs');
    } else if (tabId === 'settings') {
      setSettingsRolesSubTab('brand');
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'create-order') {
      setActiveTab('pos-sales');
    } else if (action === 'add-product') {
      setActiveTab('products-database');
    } else if (action === 'add-staff') {
      setActiveTab('staff-schedule');
      setStaffScheduleSubTab('staff');
    } else if (action === 'restock') {
      setActiveTab('restock');
    } else if (action === 'add-expense') {
      setActiveTab('finance-costs');
    } else if (action === 'add-customer') {
      setActiveTab('customers-list');
    }
  };

  // Sub-tab hiện tại (dẫn xuất từ activeTab + 8 sub-tab state). page.tsx (Task 6)
  // dùng giá trị này để highlight pill; giữ công thức đúng như page.tsx cũ.
  const currentSubTab =
    activeTab === 'sales-orders'
      ? salesOrdersSubTab
      : activeTab === 'products-inventory' ||
        activeTab === 'stocker-inventory' ||
        activeTab === 'stocker-transfer' ||
        activeTab === 'damaged-goods' ||
        activeTab === 'restock' ||
        activeTab === 'products-database'
      ? activeTab === 'stocker-inventory'
        ? 'matrix'
        : activeTab === 'stocker-transfer'
        ? 'transfer'
        : activeTab === 'damaged-goods'
        ? 'damaged'
        : activeTab === 'restock'
        ? 'restock'
        : activeTab === 'products-database'
        ? 'list'
        : productsInventorySubTab
      : activeTab === 'staff-schedule'
      ? staffScheduleSubTab
      : activeTab === 'attendance'
      ? attendanceSubTab
      : activeTab === 'finance-profit'
      ? financeProfitSubTab
      : activeTab === 'promotions'
      ? promotionsSubTab
      : activeTab === 'settings-roles' ||
        activeTab === 'settings' ||
        activeTab === 'announcements' ||
        activeTab === 'audit-logs'
      ? activeTab === 'announcements'
        ? 'announcements'
        : activeTab === 'audit-logs'
        ? 'audit-logs'
        : activeTab === 'settings'
        ? 'brand'
        : settingsRolesSubTab
      : activeTab === 'customers'
      ? customersSubTab
      : '';

  return {
    activeTab,
    setActiveTab,
    currentSubTab,
    salesOrdersSubTab,
    setSalesOrdersSubTab,
    productsInventorySubTab,
    setProductsInventorySubTab,
    staffScheduleSubTab,
    setStaffScheduleSubTab,
    attendanceSubTab,
    setAttendanceSubTab,
    financeProfitSubTab,
    setFinanceProfitSubTab,
    promotionsSubTab,
    setPromotionsSubTab,
    settingsRolesSubTab,
    setSettingsRolesSubTab,
    customersSubTab,
    setCustomersSubTab,
    setCurrentSubTab,
    getSubTabs,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    selectedBranch,
    setSelectedBranch,
    handleSidebarChange,
    handleQuickAction,
  };
}
