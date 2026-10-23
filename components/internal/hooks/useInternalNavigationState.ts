import { useState, useEffect, useRef } from 'react';

interface NavigationHookProps {
  currentUser: any;
}

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
    if (activeTab === 'overview') {
      if (['cashier', 'employee'].includes(currentUser.role)) {
        setActiveTab('pos-sales');
        setSalesOrdersSubTab('pos');
      } else if (currentUser.role === 'cskh') {
        setActiveTab('cskh-hub');
      } else if (currentUser.role === 'stocker') {
        setActiveTab('stocker-inventory');
        setProductsInventorySubTab('matrix');
      } else if (currentUser.role === 'accountant') {
        setActiveTab('finance-costs');
        setFinanceProfitSubTab('costs');
      }
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

  return {
    activeTab,
    setActiveTab,
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
