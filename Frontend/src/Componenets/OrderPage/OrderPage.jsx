import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderPage.css';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - replace with your actual URL and anon key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const OrderPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu-breakfast');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState('');
  const [menuItemsFromDB, setMenuItemsFromDB] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const cartRef = useRef(null);
  const [position, setPosition] = useState({ top: 80, left: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Fetch menu items from Supabase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*');
          
        if (error) {
          console.error('Error fetching menu items:', error);
          return;
        }
        
        if (data) {
          // Process the fetched data to handle the days field (stored as JSONB)
          const processedData = data.map(item => ({
            ...item,
            days: Array.isArray(item.days) ? item.days : JSON.parse(item.days || '[]')
          }));
          
          setMenuItemsFromDB(processedData);
        }
      } catch (error) {
        console.error('Error processing menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
    
    // Optional: Set up a subscription to listen for changes
    const subscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'menu_items' 
      }, payload => {
        console.log('Database change detected:', payload);
        // Refresh data when changes are detected
        fetchMenuItems();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Set responsive initial position once cartRef is available
    const setInitialPosition = () => {
      if (cartRef.current) {
        const isMobile = window.innerWidth <= 768;
        const cartWidth = cartRef.current.offsetWidth;
        const cartHeight = cartRef.current.offsetHeight;

        const defaultLeft = isMobile
          ? window.innerWidth - cartWidth - 20
          : window.innerWidth - cartWidth - 40;

        const defaultTop = 80;

        setPosition({
          top: Math.min(defaultTop, window.innerHeight - cartHeight),
          left: Math.min(defaultLeft, window.innerWidth - cartWidth),
        });
      }
    };

    setInitialPosition();
    window.addEventListener('resize', setInitialPosition);

    return () => {
      window.removeEventListener('resize', setInitialPosition);
    };
  }, []);

  const handleDragStart = (e) => {
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    setDragging(true);
    setOffset({
      x: clientX - cartRef.current.getBoundingClientRect().left,
      y: clientY - cartRef.current.getBoundingClientRect().top,
    });
  };

  const handleDragMove = (e) => {
    if (!dragging) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const newLeft = clientX - offset.x;
    const newTop = clientY - offset.y;

    setPosition({
      top: Math.min(Math.max(newTop, 0), window.innerHeight - cartRef.current.offsetHeight),
      left: Math.min(Math.max(newLeft, 0), window.innerWidth - cartRef.current.offsetWidth),
    });
  };

  const handleDragEnd = () => setDragging(false);

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragging, offset]);

  useEffect(() => {
    // Get the current day of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    setCurrentDayOfWeek(days[now.getDay()]);
    
    // Update day of week every day at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;
    
    const dayTimer = setTimeout(() => {
      const newDay = new Date();
      setCurrentDayOfWeek(days[newDay.getDay()]);
    }, timeUntilMidnight);
    
    return () => clearTimeout(dayTimer);
  }, [currentDayOfWeek]);

  const menuCategories = [
    { id: 'menu-starters', title: 'Starters', icon: 'bi-egg-fried' },
    { id: 'menu-breakfast', title: 'Breakfast', icon: 'bi-cup-hot' },
    { id: 'menu-lunch', title: 'Lunch', icon: 'bi-cup-straw' },
    { id: 'menu-dinner', title: 'Dinner', icon: 'bi-palette' }
  ];

  // Define day-specific menu items - now merges DB items with hardcoded items
  const getDaySpecificMenuItems = () => {
    // Base menu items that will be filtered by day
    const allMenuItems = {
      'menu-starters': [
        { id: 1, name: "Bruschetta", description: "Toasted bread with fresh tomatoes, garlic, basil, and olive oil", price: 100, img: "menu-item-1.png", days: ['Wednesday', 'Thursday'] },
        { id: 2, name: "Fried Calamari", description: "Lightly breaded squid served with marinara sauce", price: 200, img: "menu-item-2.png", days: ['Tuesday', 'Friday'] },
        { id: 3, name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze", price: 300, img: "menu-item-3.png", days: ['Wednesday', 'Saturday'] },
        { id: 4, name: "Stuffed Mushrooms", description: "Mushroom caps filled with seasoned breadcrumbs and cheese", price: 400, img: "menu-item-4.png", days: ['Sunday'] },
      ],
      'menu-breakfast': [
        { id: 7, name: "IceCream", description: "Poached eggs on English muffin with hollandaise sauce", price: 900, img: "menu-item-5.png", days: ['Tuesday', 'Thursday'] },
        { id: 8, name: "Belgian Waffles", description: "Fluffy waffles topped with fresh berries and maple syrup", price: 700, img: "menu-item-6.png", days: ['Tuesday', 'Friday'] },
        { id: 9, name: "Avocado Toast", description: "Whole grain toast with smashed avocado, eggs, and red pepper flakes", price: 800, img: "menu-item-1.png", days: ['Wednesday', 'Saturday'] },
        { id: 10, name: "Pancake Stack", description: "Buttermilk pancakes with butter and pure maple syrup", price: 600, img: "menu-item-3.png", days: ['Tuesday','Sunday'] },
      ],
      'menu-lunch': [
        { id: 14, name: "Turkey Club Sandwich", description: "Triple-decker with turkey, bacon, lettuce, and tomato", price: 1200, img: "menu-item-4.png", days: ['Tuesday', 'Friday'] },
        { id: 15, name: "Panner Manchuri", description: "Arborio rice slowly cooked with wild mushrooms and parmesan", price: 10, img: "menu-item-1.png", days: ['Monday', 'Sunday'] },
        { id: 16, name: "Idli Vada", description: "Tomatoes, cucumber, olives, feta, and red onion with oregano", price: 35, img: "idlivada.png", days: ['Sunday'] },
      ],
      'menu-dinner': [
        { id: 13, name: "Veg-Noodles", description: "Veg Noodle, romaine, parmesan in a flour tortilla", price: 10, img: "menu-item-3.png", days: ['Wednesday', 'Sunday'] },
        { id: 19, name: "Filet Mignon", description: "8oz tenderloin with mashed potatoes and seasonal vegetables", price: 3000, img: "menu-item-2.png", days: ['Wednesday', 'Thursday'] },
        { id: 20, name: "Grilled Salmon", description: "Wild-caught salmon with lemon butter sauce and asparagus", price: 2200, img: "menu-item-1.png", days: ['Wednesday', 'Friday'] },
        { id: 21, name: "Rice Bowl", description: "Breaded chicken breast topped with marinara and mozzarella", price: 1700, img: "menu-item-6.png", days: ['Tuesday', 'Saturday'] },
        { id: 22, name: "Prime Rib", description: "Slow-roasted prime rib with au jus and horseradish cream", price: 2700, img: "menu-item-3.png", days: ['Tuesday'] },
      ],
    };

    // Merge DB items with hardcoded items
    menuItemsFromDB.forEach(dbItem => {
      // Determine which category to add this to
      const category = dbItem.category;  // This should match your schema: menu-breakfast, menu-lunch, etc.
      
      if (allMenuItems[category]) {
        // Check if this item already exists in our hardcoded items (by id)
        const existingItemIndex = allMenuItems[category].findIndex(item => item.id === dbItem.id);
        
        if (existingItemIndex !== -1) {
          // Update existing item
          allMenuItems[category][existingItemIndex] = {
            ...dbItem,
            // Make sure days is an array
            days: Array.isArray(dbItem.days) ? dbItem.days : JSON.parse(dbItem.days || '[]')
          };
        } else {
          // Add new item
          allMenuItems[category].push({
            ...dbItem,
            // Make sure days is an array
            days: Array.isArray(dbItem.days) ? dbItem.days : JSON.parse(dbItem.days || '[]')
          });
        }
      }
    });

    // Filter the menu items based on the current day
    const filteredMenuItems = {};
    Object.keys(allMenuItems).forEach(category => {
      filteredMenuItems[category] = allMenuItems[category].filter(item => 
        item.days && item.days.includes(currentDayOfWeek)
      );
    });

    return filteredMenuItems;
  };

  // Function to check available categories based on current time
  const updateAvailableCategories = () => {
    const currentHour = new Date().getHours();
    let available = [];
    
    // Morning (5am-11am): Only Breakfast is available
    if (currentHour >= 5 && currentHour < 11) {
      available = ['menu-breakfast'];
    } 
    // Afternoon (11am-5pm): Only Lunch is available
    else if (currentHour >= 11 && currentHour < 17) {
      available = ['menu-lunch'];
    } 
    // Evening/Night (5pm-5am): Only Dinner is available
    else {
      available = ['menu-dinner'];
    }
    
    setAvailableCategories(available);
    
    // If the current active tab is not available, switch to an available one
    if (!available.includes(activeTab)) {
      setActiveTab(available[0]);
    }
  };

  // Initialize available categories and set up an interval to update them
  useEffect(() => {
    updateAvailableCategories();
    
    // Update available categories every minute
    const intervalId = setInterval(updateAvailableCategories, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
      
      const total = JSON.parse(storedCart).reduce((acc, item) => {
        return acc + (item.price * item.quantity);
      }, 0);
      setTotalAmount(total);
    }
    
    // Set initial active tab based on available categories
    if (availableCategories.length > 0 && !availableCategories.includes(activeTab)) {
      setActiveTab(availableCategories[0]);
    }
  }, [availableCategories]);

  const handleTabChange = (tabId) => {
    if (availableCategories.includes(tabId)) {
      setActiveTab(tabId);
      window.scrollTo({
        top: document.getElementById('menu-tabs').offsetTop - 100,
        behavior: 'smooth'
      });
    } else {
      // Show a message that this category is not available now
      const notification = document.getElementById('cart-notification');
      if (notification) {
        notification.innerHTML = `<i class="bi bi-x-circle"></i> This menu is not available now`;
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
      }
    }
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleQuantityChange = (itemId, action) => {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const updatedCart = [...cart];
      
      if (action === 'add') {
        updatedCart[itemIndex].quantity += 1;
      } else if (action === 'subtract' && updatedCart[itemIndex].quantity > 1) {
        updatedCart[itemIndex].quantity -= 1;
      } else if (action === 'subtract' && updatedCart[itemIndex].quantity === 1) {
        updatedCart.splice(itemIndex, 1);
      }
      
      updateCart(updatedCart);
    }
  };

  const addToCart = (item) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updateCart(updatedCart);
    } else {
      updateCart([...cart, { ...item, quantity: 1 }]);
    }
    
    const notification = document.getElementById('cart-notification');
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  };

  useEffect(() => {
    const total = cart.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    setTotalAmount(total);
  }, [cart]);

  const handleCheckout = () => {
    navigate('/cart');
    setCartOpen(false);
  };

  // Get current time for display
  const getCurrentTimeInfo = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    
    let timeMessage = '';
    if (hours >= 5 && hours < 11) {
      timeMessage = 'Breakfast time';
    } else if (hours >= 11 && hours < 17) {
      timeMessage = 'Lunch time';
    } else {
      timeMessage = 'Dinner time';
    }
    
    return { time: formattedTime, message: timeMessage };
  };

  const timeInfo = getCurrentTimeInfo();
  const daySpecificMenu = getDaySpecificMenuItems();

  return (
    <div className="order-page">
      <div id="cart-notification" className="cart-notification">
        <i className="bi bi-check-circle"></i> Item added to cart
      </div>
    
      <div className="cart-section"
        ref={cartRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          position: 'fixed',
          cursor: 'grab',
        }}>
        <div className="cart-toggle" onClick={() => setCartOpen(!cartOpen)}>
          <img src="/img/shopping-cart.png" alt="Cart" className="cart-icon" />
          {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </div>
        <Link to="/cart" className="view-cart-link">
          <i className="bi bi-bag"></i> View Cart
        </Link>
      </div>
      
      <div className="container">
        <div className="order-header">
          <button className="new-back-button" onClick={handleBackToMenu}>
            <i className="bi bi-arrow-left"></i> Back 
          </button>
          <h1>Order Your Food</h1>
          <p>Current time: {timeInfo.time} - {timeInfo.message}</p>
          <p>Today's {currentDayOfWeek} Special Menu</p>
        </div>
        
        <div className="menu-tabs-wrapper" id="menu-tabs" data-aos="fade-up" data-aos-delay="100">
          <ul className="menu-tabs">
            {menuCategories.map((category) => {
              const isAvailable = availableCategories.includes(category.id);
              return (
                <li key={category.id} className="menu-tab-item">
                  <button 
                    className={`menu-tab-button ${activeTab === category.id ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                    onClick={() => handleTabChange(category.id)}
                    disabled={!isAvailable}
                  >
                    <i className={`bi ${category.icon}`}></i>
                    <h4>{category.title}</h4>
                    {!isAvailable && (
                      <span className="lock-icon">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="menu-content" data-aos="fade-up" data-aos-delay="200">
          {isLoading ? (
            <div className="loading-spinner">
              <p>Loading menu items...</p>
              {/* Add your spinner component here if you have one */}
            </div>
          ) : (
            menuCategories.map((category) => (
              <div 
                key={category.id}
                className={`menu-tab-content ${activeTab === category.id ? 'active' : ''}`}
                id={category.id}
              >
                <div className="menu-header">
                  <p>Our {currentDayOfWeek} Selection</p>
                  <h3>{category.title}</h3>
                  {!availableCategories.includes(category.id) && (
                    <div className="menu-unavailable-message">
                      <i className="bi bi-clock"></i> This menu is not available at this time
                    </div>
                  )}
                </div>
                
                {availableCategories.includes(category.id) ? (
                  <div className="order-items-grid">
                    {daySpecificMenu[category.id] && daySpecificMenu[category.id].length > 0 ? (
                      daySpecificMenu[category.id].map((item) => {
                        const cartItem = cart.find(cartItem => cartItem.id === item.id);
                        const quantity = cartItem ? cartItem.quantity : 0;
                        
                        return (
                          <div className="order-item" key={item.id}>
                            <div className="order-item-img-container">
                            <img
  src={item.img.startsWith('http') ? item.img : `/img/menu/${item.img}`}
  className="order-img"
  alt={item.name}
/>
                              <div className="order-item-overlay">
                                {/* <button className="view-details-button">
                                  <i className="bi bi-eye"></i>
                                </button> */}
                              </div>
                            </div>
                            <div className="order-item-info">
                              <h4>{item.name}</h4>
                              <p className="ingredients">{item.description}</p>
                              <p className="price">₹{item.price}</p>
                              
                              <div className="order-actions">
                                {quantity > 0 ? (
                                  <div className="quantity-selector">
                                    <button
                                      onClick={() => handleQuantityChange(item.id, 'subtract')}
                                      className="quantity-btn"
                                    >
                                      <AiOutlineMinus style={{ color: 'black' }} />
                                    </button>
                                    <span className="quantity">{quantity}</span>
                                    <button
                                      onClick={() => handleQuantityChange(item.id, 'add')}
                                      className="quantity-btn"
                                    >
                                      <AiOutlinePlus style={{ color: 'black' }} />
                                    </button>
                                  </div>
                                ) : (
                                  <button className="add-to-cart-button" onClick={() => addToCart(item)}>
                                    <i className="bi bi-cart-plus"></i> Add to Cart
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-items-message">
                        <p>No special menu items available for {currentDayOfWeek} in this category.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="locked-menu-content">
                    <div className="locked-menu-message">
                      <i className="bi bi-lock-fill"></i>
                      <h3>This menu is currently unavailable</h3>
                      <p>Please check back during the appropriate hours:</p>
                      <ul>
                        <li><strong>Breakfast:</strong> 5:00 AM - 11:00 AM</li>
                        <li><strong>Lunch:</strong> 11:00 AM - 5:00 PM</li>
                        <li><strong>Dinner:</strong> 5:00 PM - 5:00 AM</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
