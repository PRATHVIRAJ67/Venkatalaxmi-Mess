const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Fallback to localhost for development
  credentials: true
}));


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// create New order
app.post('/api/create-order', async (req, res) => {
  try {
   
    const { amount, currency = 'INR', items, deliveryOption, deliveryFee, discount, promoCode } = req.body;
    
    if (!amount || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }
    
    console.log('Creating order with amount:', amount);
    
    
    const calculatedAmount = calculateOrderAmount(items, deliveryOption, deliveryFee, discount);
    const calculatedAmountInPaise = calculatedAmount * 100;
    
    console.log('Calculated amount:', calculatedAmount, 'In paise:', calculatedAmountInPaise);
    
    
    if (Math.abs(amount - calculatedAmountInPaise) > 100) {
      return res.status(400).json({ 
        error: 'Amount verification failed',
        provided: amount,
        calculated: calculatedAmountInPaise
      });
    }

   
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount), 
      currency,
      receipt: `order_rcpt_${Date.now()}`,
      notes: {
        deliveryOption,
        promoCode: promoCode || 'none',
        itemCount: items.length
      }
    });
    
    console.log('Razorpay order created:', razorpayOrder.id);
    
    
    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
   
    const { orderId, paymentId, signature } = req.body;
    
    console.log('Verifying payment:', {
      orderId,
      paymentId,
      signature: signature ? signature.substring(0, 10) + '...' : 'missing' // Log partial signature for security
    });
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing payment verification details' });
    }
    
    
    const text = orderId + '|' + paymentId;
    
    console.log('String for signature generation:', text);
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    console.log('Generated signature:', generatedSignature.substring(0, 10) + '...');
    console.log('Signatures match:', generatedSignature === signature);
    
    // Compare signatures
    if (generatedSignature !== signature) {
      
      console.warn('Invalid payment signature detected:', {
        orderId,
        paymentId,
        providedSignatureStart: signature.substring(0, 10),
        generatedSignatureStart: generatedSignature.substring(0, 10)
      });
      
      return res.status(400).json({ error: 'Invalid signature', verified: false });
    }
    
    
    console.log('Payment verified successfully for order:', orderId);
    
  
    res.status(200).json({
      success: true,
      verified: true,
      orderId: orderId,
      message: 'Payment verified successfully'
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment', verified: false, details: error.message });
  }
});


function calculateOrderAmount(items, deliveryOption, deliveryFee, discount) {
  
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
 
  const discountAmount = discount ? subtotal * (discount / 100) : 0;
  
  const deliveryAmount = deliveryOption === 'delivery' ? deliveryFee : 0;
  
  
  const total = subtotal - discountAmount + deliveryAmount;
  
  return total;
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});