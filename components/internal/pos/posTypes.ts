export interface CartItem {
  id: string;
  product: any;
  size: string;
  color: string;
  quantity: number;
  price: number;
  sku: string;
}

export interface CartTab {
  id: string;
  name: string;
  items: CartItem[];
  customerPhone: string;
  selectedCustomer: any | null;
  paymentMethod: 'cash' | 'transfer' | 'wallet';
  promoCode: string;
  cashTendered: number;
  createdAt: number;
}

export interface MultiCartPOSProps {
  currentUser: any;
  productsList: any[];
  branchStock: Record<string, Record<string, number>>;
  crmClients?: any[];
  setCrmClients?: any;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSwitchToTransferTab?: () => void;
  restockBranchProduct?: (productId: string, branchName: string, quantity: number) => void;
  posHistory: any[];
  setPosHistory?: any;
}
