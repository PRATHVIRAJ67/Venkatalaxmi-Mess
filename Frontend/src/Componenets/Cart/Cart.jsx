import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import UserFormModal from '../form/ResponsiveForm';
import { supabase } from "../utils/supabaseClient";

const CartPage = () => {
  console.log("CartPage component rendering");
  
  const navigate = useNavigate();
  // Initialize with an empty array but don't rely on useState's initial value for data persistence
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  const [orderId, setOrderId] = useState(null);
  const [userData, setUserData] = useState(null); // Store form data to use after payment success
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState(null);
  
  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection();
    
    // Try to load saved user data if available
    try {
      const savedUserData = localStorage.getItem('user');
      if (savedUserData) {
        const parsedData = JSON.parse(savedUserData);
        setUserData(parsedData);
        console.log("Loaded saved user data on mount:", parsedData);
      }
    } catch (error) {
      console.error("Error loading saved user data:", error);
    }
  }, []);

  // Function to test Supabase connection
  const testSupabaseConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      const { data, error } = await supabase.from("users").select("*").limit(1);
      
      if (error) {
        console.error("Supabase connection test failed:", error);
        setSupabaseConnectionStatus('failed');
      } else {
        console.log("Supabase connection successful:", data);
        setSupabaseConnectionStatus('success');
      }
    } catch (err) {
      console.error("Unexpected error testing Supabase connection:", err);
      setSupabaseConnectionStatus('error');
    }
  };
  
  // Load cart data immediately - synchronously - at the top level
  let initialCart = [];
  try {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      initialCart = JSON.parse(storedCart);
      if (!Array.isArray(initialCart)) {
        initialCart = [];
      }
    }
  } catch (e) {
    console.error("Error loading initial cart:", e);
  }
  
  // Use useEffect to set the state after the component mounts
  useEffect(() => {
    console.log("Setting initial cart:", initialCart);
    if (initialCart.length > 0) {
      setCart(initialCart);
      
      // Calculate initial total
      const subtotal = initialCart.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
      }, 0);
      
      const total = subtotal + deliveryFee;
      setTotalAmount(total);
    }
  }, []);
  
  // Update localStorage and recalculate totals whenever cart changes
  useEffect(() => {
    console.log("Cart changed - saving to localStorage:", cart);
    
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
    
    // Calculate totals
    const subtotal = cart.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    
    const discountAmount = isPromoApplied ? subtotal * (discount / 100) : 0;
    const total = subtotal - discountAmount + (deliveryOption === 'delivery' ? deliveryFee : 0);
    
    setTotalAmount(total);
  }, [cart, discount, isPromoApplied, deliveryOption, deliveryFee]);

  // Modified to store form data and proceed to payment without saving to Supabase yet
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      console.log("Form submitted from modal with data:", formData);
      
      // Store the form data in state AND localStorage with fresh data
      setUserData(formData);
      localStorage.setItem('user', JSON.stringify(formData));
      
      // Delay closing the form slightly to ensure data is set
      setTimeout(() => {
        setFormVisible(false);
        // Pass the formData directly to createRazorpayOrder to use the latest data
        createRazorpayOrder(formData);
      }, 100);
      
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, action) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const itemIndex = updatedCart.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return updatedCart;
      
      if (action === 'add') {
        updatedCart[itemIndex] = {
          ...updatedCart[itemIndex],
          quantity: updatedCart[itemIndex].quantity + 1
        };
      } else if (action === 'subtract') {
        if (updatedCart[itemIndex].quantity > 1) {
          updatedCart[itemIndex] = {
            ...updatedCart[itemIndex],
            quantity: updatedCart[itemIndex].quantity - 1
          };
        } else {
          updatedCart.splice(itemIndex, 1);
        }
      }
      
      return updatedCart;
    });
  };
  
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
 
  const applyPromoCode = () => {
    const promoCodes = {
      'WELCOME10': 50,
      'SPECIAL25': 25,
      'FREESHIP': 100  
    };
    
    if (promoCodes[promoCode]) {
      setDiscount(promoCodes[promoCode]);
      setIsPromoApplied(true);
      
      if (promoCode === 'FREESHIP') {
        setDeliveryFee(0);
      }
    } else {
      alert('Invalid promo code');
    }
  };
  
  const handleContinueShopping = () => {
    navigate('/order');
  };
  
  
const clearCart = () => {
  setCart([]);
  localStorage.removeItem('cart');
};

  // Modified to accept direct formData parameter
  const createRazorpayOrder = async (formDataParam) => {
    try {
      setLoading(true);
      
      // Use the passed formData parameter first, then fall back to state, then localStorage
      const userDataToUse = formDataParam || userData || (() => {
        try {
          const storedUser = localStorage.getItem('user');
          return storedUser ? JSON.parse(storedUser) : null;
        } catch (err) {
          console.error("Error retrieving user data:", err);
          return null;
        }
      })();
      
      // If we still don't have user data, show the form again
      if (!userDataToUse) {
        alert("Unable to process order: missing user details");
        setLoading(false);
        setFormVisible(true);
        return;
      }
      
      // Always update state with the data we're using to ensure consistency
      setUserData(userDataToUse);
      
      // Prepare order data
      const orderData = {
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        deliveryOption,
        deliveryFee,
        discount: isPromoApplied ? discount : 0,
        promoCode: isPromoApplied ? promoCode : null
      };
      
      // Call backend API to create order
      const response = await fetch('https://food-delivery-backend-c90g.onrender.com/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include' // Includes cookies in the request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const data = await response.json();
      setOrderId(data.orderId);
      
      // Initialize Razorpay payment with the active userData
      initializeRazorpayPayment(data.orderId, data.amount, data.currency, data.keyId, userDataToUse);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Something went wrong. Please try again: ' + error.message);
      setLoading(false);
    }
  };

  // Updated to accept userData parameter directly
  const initializeRazorpayPayment = (orderId, amount, currency, keyId, userDataParam) => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        openRazorpayCheckout(orderId, amount, currency, keyId, userDataParam);
      };
    } else {
      openRazorpayCheckout(orderId, amount, currency, keyId, userDataParam);
    }
  };

  // Updated to use passed userData parameter
  const openRazorpayCheckout = (orderId, amount, currency, keyId, userDataParam) => {
    // Use passed userData, fallback to state, then localStorage
    const user = userDataParam || userData || JSON.parse(localStorage.getItem('user')) || {};
    
    console.log('Opening Razorpay checkout with order ID:', orderId);
    console.log('Using user data for Razorpay:', user);
    
    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: 'Venkatalakmi Mess',
      description: 'Food Order Payment',
      image: '/your-logo.png',
      order_id: orderId,
      handler: function(response) {
        console.log('Payment successful, response:', response);
        // Pass the current user data to payment verification to ensure consistency
        verifyPayment(response, user);
      },
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || ''
      },
      notes: {
        deliveryOption: deliveryOption,
        address: user.address || ''
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: function() {
          console.log('Checkout form closed');
          setLoading(false);
        }
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
    // Event handlers
    razorpay.on('payment.failed', function(response) {
      alert(`Payment failed: ${response.error.description}`);
      console.error('Payment failed:', response.error);
      setLoading(false);
    });
  };

  // Updated to accept userDataParam directly to ensure using current data
  const verifyPayment = async (paymentResponse, userDataParam) => {
    try {
      setLoading(true);
      
      console.log('Verifying payment with response:', paymentResponse);
      
      // Use the passed userData parameter, then state, then localStorage
      let userDataToUse = userDataParam || userData;
      if (!userDataToUse) {
        console.log("No user data passed, checking localStorage...");
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            userDataToUse = JSON.parse(storedUser);
            console.log("Loaded user data from localStorage:", userDataToUse);
          }
        } catch (err) {
          console.error("Error reading user data from localStorage:", err);
        }
      }
      
      if (!userDataToUse) {
        throw new Error("No user data available for order processing");
      }
      
      // Send payment details to backend for verification
      const response = await fetch('https://food-delivery-backend-c90g.onrender.com/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentResponse.razorpay_order_id,
          paymentId: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Verification response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }
      
      if (data.verified) {
        // Payment is successful - save user data WITH order details to Supabase
        if (userDataToUse) {
          try {
            // Add order details directly to the user data object
            const enhancedUserData = {
              ...userDataToUse,
              order_items: JSON.stringify(cart), // Convert array to string to avoid issues
              order_total: totalAmount,
              order_id: data.orderId || paymentResponse.razorpay_order_id,
              payment_id: paymentResponse.razorpay_payment_id,
              delivery_option: deliveryOption,
              delivery_fee: deliveryOption === 'delivery' ? deliveryFee : 0,
              discount: isPromoApplied ? discount : 0,
              promo_code: isPromoApplied ? promoCode : null,
              order_date: new Date().toISOString(),
            };
            
            console.log("About to save to Supabase:", enhancedUserData);
            
            // Insert user data with order details
            const { data: insertedData, error } = await supabase
              .from("users")
              .insert([enhancedUserData])
              .select();
            
            if (error) {
              console.error("Error saving user and order details to Supabase:", error);
              alert("Your order was processed, but we had trouble saving your details: " + error.message);
              // Still proceed with order success because payment was successful
            } else {
              console.log("User and order details successfully saved to Supabase:", insertedData);
            }
          } catch (supabaseError) {
            console.error("Unexpected error with Supabase:", supabaseError);
            alert("Order successful but there was an error saving your details.");
          }
        } else {
          console.warn("No user data available to save to Supabase");
          alert("Order processed successfully but user details are missing.");
        }
        
        // Save the cart items copy before clearing the cart
        const cartItemsCopy = [...cart];
        
        // Clear user data from localStorage and state after successful order
        localStorage.removeItem('user');
        setUserData(null);
        
        // Clear the actual cart
        clearCart();
        
        // Navigate to success page with cart items included in the state
        navigate('/ordersucess', { 
          state: { 
            orderId: data.orderId || paymentResponse.razorpay_order_id,
            amount: totalAmount,
            paymentId: paymentResponse.razorpay_payment_id,
            items: cartItemsCopy,
            deliveryOption: deliveryOption,
            deliveryFee: deliveryOption === 'delivery' ? deliveryFee : 0
          }
        });
      } else {
        // Payment verification failed
        alert('Payment verification failed. Please contact support.');
      }
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    if (supabaseConnectionStatus === 'failed') {
      alert('Warning: There might be issues with our database connection. Your order can be processed but data storage might be affected.');
    }
    
    // Clear any existing form data to ensure fresh form submission
    // Remove this if you want to pre-fill the form with previous data
    // setUserData(null);
    // localStorage.removeItem('user');
    
    // Show the form to collect user details
    setFormVisible(true);
  };
  
  return (
    <div className="cart-page" key={renderKey}>
      <div className="container">
        <div className="cart-header">
          <button className="back-button" onClick={handleContinueShopping}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <h1>Your Cart</h1>
          <p className='review'>Please Review and modify your selected items before checkout</p>
        </div>
        
        {cart.length === 0 ? (
          <div className="empty-cart-message">
            <i className="bi bi-cart-x"></i>
            <h3>Your cart is empty</h3>
            <p>Add some delicious items to get started</p>
            <button className="browse-menu-button" onClick={handleContinueShopping}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              <div className="cart-items-header">
                <div className="item-col">Item</div>
                <div className="price-col">Price</div>
                <div className="quantity-col">Quantity</div>
                <div className="subtotal-col">Subtotal</div>
                <div className="action-col"></div>
              </div>
              
              {cart.map(item => (
                <div className="cart-item-row" key={item.id}>
                  <div className="item-col">
                    <div className="item-info">
                    <img 
  src={item.img && item.img.startsWith('http') ? item.img : `/img/menu/${item.img}`} 
  alt={item.name} 
  className="item-image"
/>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-description">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="price-col">₹{item.price}</div>
                  
                  <div className="quantity-col">
                    <div className="quantity-selector">
                      <button onClick={() => handleQuantityChange(item.id, 'subtract')}>
                        <AiOutlineMinus />
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => handleQuantityChange(item.id, 'add')}>
                        <AiOutlinePlus />
                      </button>
                    </div>
                  </div>
                  
                  <div className="subtotal-col">₹{item.price * item.quantity}</div>
                  
                  <div className="action-col">
                    <button className="remove-item-button" onClick={() => removeFromCart(item.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="cart-actions">
                <button className="clear-cart-button" onClick={clearCart}>
                  <i className="bi bi-x-circle"></i> Clear Cart
                </button>
              </div>
            </div>
            
            <div className="cart-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
              </div>
              
              {isPromoApplied && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-₹{(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * (discount / 100)).toFixed(2)}</span>
                </div>
              )}
              
              <div className="delivery-options">
                <h4>Delivery Options</h4>
                <div className="delivery-option">
                  <input 
                    type="radio" 
                    id="delivery" 
                    name="delivery-option" 
                    value="delivery" 
                    checked={deliveryOption === 'delivery'} 
                    onChange={() => setDeliveryOption('delivery')}
                  />
                  <label htmlFor="delivery">Home Delivery (₹{deliveryFee})</label>
                </div>
                <div className="delivery-option">
                  <input 
                    type="radio" 
                    id="pickup" 
                    name="delivery-option" 
                    value="pickup" 
                    checked={deliveryOption === 'pickup'} 
                    onChange={() => setDeliveryOption('pickup')}
                  />
                  <label htmlFor="pickup">Self Pickup (Free)</label>
                </div>
              </div>
              
              <div className="promo-code-section">
                <h4>Promo Code</h4>
                <div className="promo-input">
                  <input 
                    type="text" 
                    placeholder="Enter promo code" 
                    value={promoCode} 
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={isPromoApplied}
                  />
                  {isPromoApplied ? (
                    <button 
                      className="promo-button applied" 
                      onClick={() => {setIsPromoApplied(false); setDiscount(0); setPromoCode(''); setDeliveryFee(40);}}
                    >
                      Remove
                    </button>
                  ) : (
                    <button className="promo-button" onClick={applyPromoCode}>Apply</button>
                  )}
                </div>
                {isPromoApplied && (
                  <div className="promo-applied-message">
                    <i className="bi bi-check-circle"></i> {discount}% discount applied
                  </div>
                )}
              </div>
              
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              <button
                className="checkout-button"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
                {!loading && <i className="bi bi-arrow-right"></i>}
              </button>
              <UserFormModal
                isOpen={formVisible}
                onClose={() => setFormVisible(false)}
                onSubmit={handleFormSubmit}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;