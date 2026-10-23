import { z } from 'zod';

export const STAFF_ROLES = ['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker'];

// Zod schemas for validation
export const customerInfoSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  notes: z.string().optional()
});

export const orderItemInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  colorName: z.string(),
  colorHex: z.string(),
  size: z.string(),
  reservationId: z.string().optional()
});

export const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  items: z.array(orderItemInputSchema).nonempty("Giỏ hàng trống"),
  paymentMethod: z.enum(['cod', 'transfer', 'vnpay', 'card']),
  branchName: z.string(),
  voucherCode: z.string().optional(),
  sessionId: z.string().optional(),
  shippingOptionId: z.enum(['instant_2h', 'express_standard', 'economy']).optional(),
  provinceName: z.string().optional(),
  districtName: z.string().optional(),
  wardName: z.string().optional(),
  shippingFee: z.number().optional(),
  currentCustomerId: z.string().optional()
});

export function mapOrder(dbOrder: any) {
  const items = (dbOrder.items || []).map((item: any) => {
    let productImages: string[] = [];
    try {
      productImages = JSON.parse(item.variant.product.images);
    } catch {
      productImages = [item.variant.product.images];
    }
    
    return {
      id: item.id,
      quantity: item.quantity,
      selectedColor: {
        name: item.colorName,
        hex: item.colorHex
      },
      selectedSize: item.size,
      product: {
        id: item.variant.productId,
        name: item.productName,
        slug: item.variant.product.slug,
        category: item.variant.product.category,
        price: item.price,
        description: item.variant.product.description,
        images: productImages,
        rating: item.variant.product.rating,
        reviews: item.variant.product.reviews,
        colors: [],
        sizes: [],
        stock: 0
      }
    };
  });

  return {
    id: dbOrder.id,
    customerInfo: {
      fullName: dbOrder.customerName,
      phone: dbOrder.customerPhone,
      email: dbOrder.customerEmail,
      address: dbOrder.customerAddress,
      notes: dbOrder.customerNotes || undefined
    },
    items,
    subtotal: dbOrder.subtotal,
    discount: dbOrder.discount,
    shipping: dbOrder.shipping,
    total: dbOrder.total,
    paymentMethod: dbOrder.paymentMethod as 'cod' | 'transfer' | 'card' | 'vnpay',
    branch: dbOrder.branchName,
    status: dbOrder.status as 'pending' | 'shipping' | 'completed' | 'cancelled',
    createdAt: dbOrder.createdAt.toISOString().replace('T', ' ').substring(0, 19)
  };
}
