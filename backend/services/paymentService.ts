import crypto from 'crypto';

export interface PaymentGatewayConfig {
  merchantId: string;
  hashSecret: string;
  gatewayUrl: string;
}

const DEFAULT_SECRET = process.env.PAYMENT_HASH_SECRET || 'novyn-fashion-payment-secure-hash-secret-2026';
const GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const MERCHANT_ID = process.env.PAYMENT_MERCHANT_ID || 'NOVYN001';

/**
 * Computes an HMAC-SHA512 hash over sorted query parameters (Standard for VNPAY/MoMo/Banking gateways)
 */
export function computeHmacSha512(data: string, secret: string = DEFAULT_SECRET): string {
  return crypto.createHmac('sha512', secret).update(Buffer.from(data, 'utf-8')).digest('hex');
}

/**
 * Formats parameters alphabetically and creates the signing string
 */
export function buildQueryDataString(params: Record<string, string | number>): string {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`)
    .join('&');
}

/**
 * Creates an authorized payment gateway URL with HMAC-SHA512 signature
 */
export function createPaymentGatewayUrl(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr?: string;
  returnUrl?: string;
}): string {
  const queryParams: Record<string, string | number> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: MERCHANT_ID,
    vnp_Amount: Math.round(params.amount * 100), // In VND * 100 per gateway standards
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'fashion',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
    vnp_IpAddr: params.ipAddr || '127.0.0.1',
    vnp_CreateDate: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
  };

  const signData = buildQueryDataString(queryParams);
  const secureHash = computeHmacSha512(signData, DEFAULT_SECRET);

  return `${GATEWAY_URL}?${signData}&vnp_SecureHash=${secureHash}`;
}

/**
 * Verifies webhook/IPN signature using timing-safe comparison to prevent timing attacks
 */
export function verifyPaymentSignature(
  params: Record<string, string> | string,
  receivedHash: string,
  secret: string = DEFAULT_SECRET
): boolean {
  let signData = '';
  if (typeof params === 'string') {
    signData = params;
  } else {
    // Strip secureHash and secureHashType from verification data
    const dataToVerify: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType' && value !== '') {
        dataToVerify[key] = value;
      }
    }
    signData = buildQueryDataString(dataToVerify);
  }

  const computedHash = computeHmacSha512(signData, secret);

  try {
    const computedBuffer = Buffer.from(computedHash, 'hex');
    const receivedBuffer = Buffer.from(receivedHash, 'hex');
    if (computedBuffer.length !== receivedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}
