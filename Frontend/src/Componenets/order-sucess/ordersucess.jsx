import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OrderSuccess.css";
import { jsPDF } from "jspdf";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState(50);
  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    amount: 0,
    paymentId: "",
    items: [],
    deliveryOption: "delivery", // Default to delivery
    deliveryFee: 40 // Default delivery fee
  });

  useEffect(() => {
    console.log("Location state:", location.state);
    
    // Get order details from location state
    if (location.state) {
      setOrderDetails({
        orderId: location.state.orderId || "N/A",
        amount: location.state.amount || 0,
        paymentId: location.state.paymentId || "N/A",
        items: location.state.items || [],
        deliveryOption: location.state.deliveryOption || "delivery",
        deliveryFee: location.state.deliveryFee !== undefined ? location.state.deliveryFee : 40
      });
    } else {
      // Fallback if navigated directly to this page
      console.warn("No location state found");
    }
    
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    if (seconds === 0) {
      // Clear localStorage and navigate
      clearDataAndRedirect();
    }

    // Add event listener for browser back button
    window.addEventListener('popstate', handleBackButton);

    return () => {
      clearInterval(timer);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [seconds, navigate, location.state]);

  // Handle browser back button
  const handleBackButton = () => {
    clearLocalStorage();
  };

  // Clear localStorage function
  const clearLocalStorage = () => {
    // Clear cart items
    localStorage.removeItem('cartItems');
    // Clear any other order-related data
    localStorage.removeItem('deliveryOption');
    localStorage.removeItem('userAddress');
    localStorage.removeItem('paymentInfo');
    
    // Add any other localStorage items you want to clear
    console.log("All order data cleared from localStorage");
  };

  // Clear data and redirect to home
  const clearDataAndRedirect = () => {
    clearLocalStorage();
    navigate("/", { replace: true });
  };

  const generateReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Venkatalakshmi Mess", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Order Receipt", pageWidth / 2, 30, { align: "center" });
    
    // Add order details
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderDetails.orderId}`, 20, 45);
    doc.text(`Payment ID: ${orderDetails.paymentId}`, 20, 52);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 59);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 66);
    doc.text(`Delivery Option: ${orderDetails.deliveryOption === 'delivery' ? 'Home Delivery' : 'Self Pickup'}`, 20, 73);
    
    // Create a simple table manually
    let startY = 83;
    const lineHeight = 7;
    
    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text("Item", 20, startY);
    doc.text("Qty", 100, startY);
    doc.text("Price", 120, startY);
    doc.text("Subtotal", 160, startY);
    
    startY += lineHeight;
    doc.line(20, startY, 190, startY); // Draw a line below headers
    startY += 5;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    // If we have items, display them
    if (orderDetails.items && orderDetails.items.length > 0) {
      orderDetails.items.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;
        
        // Truncate item name if too long
        const displayName = item.name.length > 40 ? item.name.substring(0, 37) + "..." : item.name;
        
        doc.text(displayName, 20, startY);
        doc.text(item.quantity.toString(), 100, startY);
        // Fixed - removed ₹ symbol from inline text
        doc.text(`${item.price}`, 120, startY);
        doc.text(`${itemSubtotal}`, 160, startY);
        
        startY += lineHeight;
      });
    } else {
      // If no items, show a message
      doc.text("No items found in order", 20, startY);
      startY += lineHeight;
    }
    
    // Draw a line above summary
    startY += 3;
    doc.line(120, startY, 190, startY);
    startY += lineHeight;
    
    // Add subtotal amount
    doc.setFont('helvetica', 'normal');
    doc.text("Subtotal:", 120, startY);
    // Fixed - removed ₹ symbol from inline text
    doc.text(`${subtotal.toFixed(2)}`, 160, startY);
    startY += lineHeight;
    
    // Add delivery fee if applicable
    if (orderDetails.deliveryOption === 'delivery' && orderDetails.deliveryFee > 0) {
      doc.text("Delivery Fee:", 120, startY);
      // Fixed - removed ₹ symbol from inline text
      doc.text(`${orderDetails.deliveryFee.toFixed(2)}`, 160, startY);
      startY += lineHeight;
    }
    
    // Draw a line above total
    doc.line(120, startY, 190, startY);
    startY += lineHeight;
    
    // Add total amount
    doc.setFont('helvetica', 'bold');
    doc.text("Total Amount:", 120, startY);
    
    // Calculate total based on items and delivery fee if applicable
    const total = subtotal + (orderDetails.deliveryOption === 'delivery' ? orderDetails.deliveryFee : 0);
    // Fixed - removed ₹ symbol from inline text
    doc.text(`${total.toFixed(2)}`, 160, startY);
    
    // Add footer
    startY += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for your order! We appreciate your business.", pageWidth / 2, startY, { align: "center" });
    doc.text("For any queries, please contact us at support@venkatalakshmimess.com", pageWidth / 2, startY + 5, { align: "center" });
    
    return doc;
  };

  const handleDownloadReceipt = () => {
    const doc = generateReceipt();
    doc.save(`receipt-${orderDetails.orderId}.pdf`);
  };

  // Calculate the total including delivery fee if applicable
  const calculateTotal = () => {
    const subtotal = orderDetails.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return subtotal + (orderDetails.deliveryOption === 'delivery' ? orderDetails.deliveryFee : 0);
  };

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-icon">✓</div>
        <h1 className="order-success-title">Thank You for Your Order!</h1>
        <p className="order-success-message">
          Your order was placed successfully. We appreciate your trust in us!
        </p>
        
        <div className="order-details">
          <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
          <p><strong>Delivery Option:</strong> {orderDetails.deliveryOption === 'delivery' ? 'Home Delivery' : 'Self Pickup'}</p>
          
          {orderDetails.deliveryOption === 'delivery' && (
            <p><strong>Delivery Fee:</strong> ₹{orderDetails.deliveryFee.toFixed(2)}</p>
          )}
          
          <p><strong>Amount Paid:</strong> ₹{calculateTotal().toFixed(2)}</p>
        </div>

        <button onClick={handleDownloadReceipt} className="order-success-download-btn">
          📄 Download Receipt
        </button>

        <p className="order-success-countdown">
          Redirecting to main menu in <span className="order-success-seconds">{seconds}</span> seconds...
        </p>

        <button onClick={clearDataAndRedirect} className="order-success-home-btn">
          🏠 Go to Home
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;