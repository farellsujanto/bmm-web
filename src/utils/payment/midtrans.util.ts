/**
 * Midtrans Payment Gateway Utility
 * Handles payment token creation, transaction status checks, and webhooks
 */

interface TransactionData {
  status_code: string;
  transaction_id: string;
  gross_amount: string;
  currency: string;
  order_id: string;
  payment_type: string;
  signature_key: string;
  transaction_status: string;
  fraud_status: string;
  status_message: string;
  merchant_id: string;
  va_numbers?: VaNumber[];
  payment_amounts?: any[];
  transaction_time: string;
  settlement_time?: string;
  expiry_time: string;
}

interface VaNumber {
  bank: string;
  va_number: string;
}

interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

interface MidtransCustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface MidtransItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface CreateSnapTokenParams {
  orderId: string;
  amount: number;
  customerDetails?: MidtransCustomerDetails;
  itemDetails?: MidtransItemDetail[];
}

/**
 * Get Midtrans API URL based on environment
 */
function getMidtransApiUrl(): string {
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'production';
  return isProduction 
    ? 'https://api.midtrans.com/v2' 
    : 'https://api.sandbox.midtrans.com/v2';
}

/**
 * Get Midtrans Snap URL based on environment
 */
function getMidtransSnapUrl(): string {
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'production';
  return isProduction 
    ? 'https://app.midtrans.com/snap/v1/transactions' 
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
}

/**
 * Get Midtrans Snap JS URL based on environment
 */
export function getMidtransSnapJsUrl(): string {
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'production';
  return isProduction 
    ? 'https://app.midtrans.com/snap/snap.js' 
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

/**
 * Get Midtrans authorization header
 */
function getAuthorizationHeader(): string {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured');
  }
  return `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;
}

/**
 * Create Midtrans Snap payment token
 * @param params - Payment parameters including order ID, amount, customer details, and items
 * @returns Snap token and redirect URL
 */
export async function createSnapToken(params: CreateSnapTokenParams): Promise<MidtransSnapResponse> {
  const { orderId, amount, customerDetails, itemDetails } = params;

  const snapUrl = getMidtransSnapUrl();
  
  const requestBody: any = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.ceil(amount), // Midtrans requires integer
    },
    credit_card: {
      secure: true,
    },
  };

  // Add customer details if provided
  if (customerDetails) {
    requestBody.customer_details = customerDetails;
  }

  // Add item details if provided
  if (itemDetails && itemDetails.length > 0) {
    requestBody.item_details = itemDetails;
  }

  const response = await fetch(snapUrl, {
    method: 'POST',
    headers: {
      'Authorization': getAuthorizationHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_messages?.[0] || `Midtrans API error: ${response.status}`);
  }

  const jsonResponse = await response.json();
  return jsonResponse as MidtransSnapResponse;
}

/**
 * Check transaction status from Midtrans
 * @param orderId - Order ID to check
 * @returns Transaction data from Midtrans
 */
export async function checkTransactionStatus(orderId: string): Promise<TransactionData | null> {
  if (!orderId) {
    return null;
  }

  const midtransUrl = `${getMidtransApiUrl()}/${orderId}/status`;

  const response = await fetch(midtransUrl, {
    method: 'GET',
    headers: {
      'Authorization': getAuthorizationHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Transaction not found
    }
    throw new Error(`Failed to check transaction status: ${response.status}`);
  }

  const jsonResponse = await response.json();
  return jsonResponse as TransactionData;
}

/**
 * Verify Midtrans notification signature
 * @param orderId - Order ID
 * @param statusCode - Status code from notification
 * @param grossAmount - Gross amount from notification
 * @param signatureKey - Signature key from notification
 * @returns True if signature is valid
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured');
  }

  const crypto = require('crypto');
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return hash === signatureKey;
}

/**
 * Map Midtrans transaction status to order status
 * @param transactionStatus - Midtrans transaction status
 * @param fraudStatus - Midtrans fraud status
 * @returns Order status string
 */
export function mapMidtransStatusToOrderStatus(
  transactionStatus: string,
  fraudStatus?: string
): 'PENDING_PAYMENT' | 'PROCESSING' | 'CANCELLED' | 'REFUNDED' {
  // Pending status
  if (transactionStatus === 'pending') {
    return 'PENDING_PAYMENT';
  }

  // Success status
  if (transactionStatus === 'capture') {
    if (fraudStatus === 'accept') {
      return 'PROCESSING';
    }
    return 'PENDING_PAYMENT'; // Wait for fraud check
  }

  if (transactionStatus === 'settlement') {
    return 'PROCESSING';
  }

  // Failed/Cancelled status
  if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
    return 'CANCELLED';
  }

  // Refund status
  if (transactionStatus === 'refund') {
    return 'REFUNDED';
  }

  // Default to pending
  return 'PENDING_PAYMENT';
}

/**
 * Map Midtrans payment type to PaymentMethod enum
 * @param paymentType - Midtrans payment type
 * @returns PaymentMethod enum value
 */
export function mapMidtransPaymentType(
  paymentType: string
): 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'E_WALLET' | 'QRIS' | 'VIRTUAL_ACCOUNT' | 'OTHER' {
  const paymentTypeLower = paymentType.toLowerCase();

  if (paymentTypeLower === 'credit_card') {
    return 'CREDIT_CARD';
  }
  if (paymentTypeLower === 'bank_transfer') {
    return 'BANK_TRANSFER';
  }
  if (paymentTypeLower.includes('va') || paymentTypeLower.includes('virtual_account')) {
    return 'VIRTUAL_ACCOUNT';
  }
  if (paymentTypeLower === 'qris') {
    return 'QRIS';
  }
  if (paymentTypeLower.includes('gopay') || paymentTypeLower.includes('shopeepay') || paymentTypeLower.includes('wallet')) {
    return 'E_WALLET';
  }

  return 'OTHER';
}

/**
 * Get Midtrans client key for frontend
 * @returns Midtrans client key
 */
export function getMidtransClientKey(): string {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  if (!clientKey) {
    throw new Error('MIDTRANS_CLIENT_KEY is not configured');
  }
  return clientKey;
}
