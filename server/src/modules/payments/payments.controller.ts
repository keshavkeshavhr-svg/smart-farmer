import { Response, NextFunction } from 'express';
import { prisma } from '../../services/prisma';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

// ─── UPI Payment Configuration ───────────────────────────────────────────────
// Replace these with your actual UPI details
const UPI_CONFIG = {
  merchantName: 'Smart Farmer Marketplace',
  upiId: process.env.UPI_ID || 'smartfarmer@ybl',
  gstin: process.env.GSTIN || '29AABCU9603R1ZM',
};

/**
 * Generate a UPI deep link / intent URL.
 * Works with GPay, PhonePe, Paytm, BHIM, and any UPI app.
 */
function generateUpiLink(amount: number, txnId: string, note: string): string {
  const params = new URLSearchParams({
    pa: UPI_CONFIG.upiId,
    pn: UPI_CONFIG.merchantName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
    tr: txnId,
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Generate a UPI QR code data URL (uses a public QR API).
 * In production, use a library like `qrcode` for server-side generation.
 */
function generateQrCodeUrl(upiLink: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
}

// ─── Create UPI Payment Order ────────────────────────────────────────────────
export async function createUpiPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { amount, orderId } = req.body;
    if (!amount || amount <= 0) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid amount');

    const txnId = `SF${Date.now()}`;
    const note = orderId ? `Order ${orderId.substring(0, 8)}` : 'Smart Farmer Purchase';
    const upiLink = generateUpiLink(amount, txnId, note);
    const qrCodeUrl = generateQrCodeUrl(upiLink);

    // Update order with transaction reference
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpayOrderId: txnId }, // Reusing the field as txnId
      });
    }

    res.json({
      txnId,
      amount,
      currency: 'INR',
      upiLink,
      qrCodeUrl,
      upiId: UPI_CONFIG.upiId,
      merchantName: UPI_CONFIG.merchantName,
      gstin: UPI_CONFIG.gstin,
      supportedApps: [
        { name: 'Google Pay', icon: 'gpay', deepLink: upiLink.replace('upi://', 'tez://upi/') },
        { name: 'PhonePe', icon: 'phonepe', deepLink: upiLink.replace('upi://', 'phonepe://') },
        { name: 'Paytm', icon: 'paytm', deepLink: upiLink.replace('upi://', 'paytmmp://') },
        { name: 'BHIM UPI', icon: 'bhim', deepLink: upiLink },
      ],
    });
  } catch (err) {
    next(err);
  }
}

// ─── Confirm UPI Payment (manual / webhook) ──────────────────────────────────
export async function confirmUpiPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { txnId, upiTxnId } = req.body;
    if (!txnId) throw new AppError(400, 'VALIDATION_ERROR', 'Transaction ID required');

    const order = await prisma.order.findFirst({ where: { razorpayOrderId: txnId } });
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found for this transaction');

    // In production, verify with bank / UPI gateway webhook
    // For this prototype, we trust the client confirmation
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        razorpayPaymentId: upiTxnId || `upi_${Date.now()}`,
        razorpaySignature: 'upi_verified',
      },
    });

    res.json({ verified: true, message: 'UPI payment confirmed successfully', orderId: order.id });
  } catch (err) {
    next(err);
  }
}

// ─── Get GSTIN Info ──────────────────────────────────────────────────────────
export async function getGstinInfo(_req: AuthRequest, res: Response) {
  res.json({
    gstin: UPI_CONFIG.gstin,
    merchantName: UPI_CONFIG.merchantName,
    upiId: UPI_CONFIG.upiId,
  });
}
