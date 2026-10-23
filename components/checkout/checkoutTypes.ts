export interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export type CheckoutStep = 'info' | 'shipping' | 'payment';
