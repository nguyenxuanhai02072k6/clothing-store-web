import { Order, CustomerInfo, CartItem } from '../../types';
import {
  getOrdersAction,
  createOrderAction,
  updateOrderStatusAction
} from '../actions/orderActions';

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    return await getOrdersAction();
  },

  createOrder: async (
    customerInfo: CustomerInfo,
    items: CartItem[],
    subtotal: number,
    discount: number,
    shipping: number,
    total: number,
    paymentMethod: 'cod' | 'transfer' | 'card',
    branch: string,
    status: 'pending' | 'shipping' | 'completed' | 'cancelled' = 'pending',
    currentCustomerId?: string
  ): Promise<string> => {
    // Map CartItem back to orderItemInputSchema format for secure calculation
    const itemsInput = items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      colorName: item.selectedColor.name,
      colorHex: item.selectedColor.hex,
      size: item.selectedSize
    }));

    const result = await createOrderAction({
      customerInfo,
      items: itemsInput,
      paymentMethod,
      branchName: branch,
      currentCustomerId
    });

    if (result.success && result.orderId) {
      return result.orderId;
    } else {
      throw new Error(result.message || 'Lỗi đặt đơn hàng từ server');
    }
  },

  updateOrderStatus: async (
    orderId: string,
    status: 'pending' | 'shipping' | 'completed' | 'cancelled',
    performedById?: string,
    performedByName?: string
  ): Promise<void> => {
    await updateOrderStatusAction(orderId, status, performedById, performedByName);
  }
};
