export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  rating: number;
  reviews: number;
  colors: ColorOption[];
  sizes: string[];
  stock: number;
  badges?: string[]; // e.g. ["New"], ["Sale"], ["Best Seller"]
  has3D?: boolean;
  modelType?: 'bag' | 'glasses' | 'dress' | 'default';
  isActive?: boolean;
}

export interface CartItem {
  id: string; // Unique identifier combining product.id + selectedColor.name + selectedSize
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
  selectedSize: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'cod' | 'transfer' | 'card';
  branch: string; // e.g. 'Chi nhánh Quận 1', 'Chi nhánh Thảo Điền'
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
}

// User RBAC Extensions
export type UserRole = 'customer' | 'employee' | 'manager' | 'director' | 'accountant' | 'cskh' | 'cashier' | 'stocker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string; // e.g. 'Chi nhánh Quận 1', 'Chi nhánh Thảo Điền'
  avatar?: string;
  salary?: number; // Basic monthly salary in VND
  totalSpent?: number; // Lifetime spent in VND
  phone?: string; // Contact phone number
  commissionRate?: number; // Custom sales commission rate (e.g. 0.03 for 3%)
}

export interface AttendanceLog {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  branch: string;
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:MM:SS
  timeOut?: string; // HH:MM:SS
}

export interface LeaveRequest {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  branch: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  managerComment?: string;
  createdAt: string;
}

export interface SalaryRequest {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  branch: string;
  currentSalary: number;
  proposedSalary: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  directorComment?: string;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  branch: string;
  reportDate: string; // YYYY-MM-DD
  title: string;
  content: string;
  status: 'unread' | 'read';
  readAt?: string;
  createdAt: string;
}

export type CustomerTier = 'standard' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TierBenefit {
  tier: CustomerTier;
  name: string;
  minSpend: number;
  discountPercent: number;
  description: string;
  benefits: string[];
}

export const TIER_BENEFITS: Record<CustomerTier, TierBenefit> = {
  standard: {
    tier: 'standard',
    name: 'Standard',
    minSpend: 0,
    discountPercent: 0,
    description: 'Thành viên mới đăng ký',
    benefits: ['Tích luỹ điểm thưởng chi tiêu', 'Nhận voucher quà tặng dịp Sinh nhật', 'Được hỗ trợ tư vấn 24/7']
  },
  silver: {
    tier: 'silver',
    name: 'Bạc (Silver)',
    minSpend: 5000000,
    discountPercent: 5,
    description: 'Chi tiêu tích lũy từ 5.000.000 ₫',
    benefits: ['Giảm trực tiếp 5% cho tất cả hóa đơn mua hàng', 'Đổi trả hàng miễn phí trong vòng 7 ngày', 'Nhận quà/voucher sinh nhật trị giá 200.000 ₫']
  },
  gold: {
    tier: 'gold',
    name: 'Vàng (Gold)',
    minSpend: 15000000,
    discountPercent: 10,
    description: 'Chi tiêu tích lũy từ 15.000.000 ₫',
    benefits: ['Giảm trực tiếp 10% cho tất cả hóa đơn mua hàng', 'Miễn phí vận chuyển (Freeship) cho mọi đơn hàng', 'Đổi trả hàng miễn phí trong 15 ngày', 'Voucher sinh nhật 500.000 ₫ + quà tặng hiện vật đặc biệt']
  },
  platinum: {
    tier: 'platinum',
    name: 'Bạch Kim (Platinum)',
    minSpend: 30000000,
    discountPercent: 15,
    description: 'Chi tiêu tích lũy từ 30.000.000 ₫',
    benefits: ['Giảm trực tiếp 15% cho tất cả hóa đơn mua hàng', 'Miễn phí vận chuyển (Freeship) cho mọi đơn hàng', 'Đổi trả hàng miễn phí trong 30 ngày', 'Quà sinh nhật cao cấp được thiết kế riêng', 'Phòng chờ VIP tại các cửa hàng của NOVYN WEAR', 'Ưu tiên trải nghiệm trước các BST giới hạn']
  },
  diamond: {
    tier: 'diamond',
    name: 'Kim Cương (Diamond)',
    minSpend: 60000000,
    discountPercent: 20,
    description: 'Chi tiêu tích lũy từ 60.000.000 ₫',
    benefits: ['Giảm trực tiếp 20% cho tất cả hóa đơn mua hàng', 'Miễn phí vận chuyển (Freeship) cho mọi đơn hàng', 'Đổi trả không giới hạn thời gian', 'Dịch vụ Stylist riêng tư vấn tại gia', 'Quà tặng VIP độc quyền và thiệp chúc tay từ Founder', 'Lời mời danh dự tham gia các Fashion Show hàng năm']
  }
};

export const getCustomerTier = (totalSpent: number = 0): CustomerTier => {
  if (totalSpent >= 60000000) return 'diamond';
  if (totalSpent >= 30000000) return 'platinum';
  if (totalSpent >= 15000000) return 'gold';
  if (totalSpent >= 5000000) return 'silver';
  return 'standard';
};

export interface PayrollRecord {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  branch?: string;
  salary: number; // Mức lương cơ bản tại thời điểm thanh toán
  month: string; // Định dạng YYYY-MM (Ví dụ: '2026-05')
  paymentDate?: string; // Ngày giờ thanh toán thực tế (YYYY-MM-DD HH:MM:SS)
  status: 'paid' | 'pending';
}

export const calculatePIT = (grossSalary: number): number => {
  const allowance = 11000000; // Giảm trừ bản thân: 11,000,000 VND
  if (grossSalary <= allowance) return 0;
  const taxableIncome = grossSalary - allowance;
  
  // Progressive tax calculation Vietnam CIT / PIT rules
  if (taxableIncome <= 5000000) {
    return taxableIncome * 0.05;
  } else if (taxableIncome <= 10000000) {
    return 5000000 * 0.05 + (taxableIncome - 5000000) * 0.10;
  } else {
    return 5000000 * 0.05 + 5000000 * 0.10 + (taxableIncome - 10000000) * 0.15;
  }
};

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: 'marketing' | 'operations' | 'equipment' | 'other';
  date: string; // YYYY-MM-DD
}

export interface RestockRecord {
  id: string;
  productId: string;
  productName: string;
  branch: string;
  amount: number;
  cost: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  size?: string;
  color?: string;
}

export interface ShiftRequest {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  branch: string; // Chi nhánh làm việc tại thời điểm đăng ký ca
  date: string; // YYYY-MM-DD
  shiftType: 'morning' | 'afternoon' | 'evening'; // Ca Sáng, Ca Chiều, Ca Tối
  status: 'pending' | 'approved' | 'rejected';
  managerComment?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  recipientType: 'all' | 'accountant' | 'branch_q1' | 'branch_td';
  createdAt: string;
  senderName: string;
}

export interface ShiftSwapRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromShiftId: string;
  fromShiftDate: string;
  fromShiftType: 'morning' | 'afternoon' | 'evening';
  toUserId: string;
  toUserName: string;
  toShiftId: string;
  toShiftDate: string;
  toShiftType: 'morning' | 'afternoon' | 'evening';
  branch: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TaxRecord {
  id: string;
  period: string; // YYYY-MM
  revenue: number;
  cogs: number;
  expenses: number;
  salaries: number;
  restockCost: number;
  ebt: number;
  citRate: number;
  citAmount: number;
  pitAmount: number;
  netProfit: number;
  settledAt: string;
  accountantName: string;
}

// Digital Workspace (Intranet Upgrades)
export interface OfficeReservation {
  id: string;
  userId: string;
  userName: string;
  type: 'desk' | 'room_a' | 'room_b';
  resourceId: string; // e.g. 'desk-1', 'desk-2', 'room-a', 'room-b'
  date: string; // YYYY-MM-DD
  slot: 'morning' | 'afternoon' | 'full';
  createdAt: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  createdAt: string;
}

export interface WorkspacePost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  hearts: number;
  likedBy: string[]; // userIds
  heartedBy: string[]; // userIds
  comments: {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
  type: 'general' | 'birthday' | 'announcement';
  createdAt: string;
}

export interface WikiDoc {
  id: string;
  title: string;
  category: 'hr' | 'operations' | 'benefits';
  content: string;
  lastUpdated: string;
}

export interface CRMClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  points: number;
  tier: 'Regular' | 'Gold' | 'Platinum' | 'VVIP';
  createdAt: string;
}

export interface CSKHTicket {
  id: string;
  customerName: string;
  category: 'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ';
  description: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: string;
}

export interface InventoryTransfer {
  id: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  status: 'shipping' | 'received';
  createdAt: string;
}

export interface DamagedGood {
  id: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  branch: string;
  quantity: number;
  issue: string; // rách, bẩn, mất tag, v.v.
  createdAt: string;
}

export interface CashReconciliation {
  id: string;
  date: string;
  branch: string;
  cashierName: string;
  expectedCash: number;
  actualCash: number;
  discrepancy: number;
  notes?: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'cskh';
  text: string;
  timestamp: string;
  senderName: string;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'waiting' | 'active' | 'closed';
  cskhName?: string;
  createdAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
}

