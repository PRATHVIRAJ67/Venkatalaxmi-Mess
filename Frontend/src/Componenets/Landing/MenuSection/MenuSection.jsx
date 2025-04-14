import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuSection.css';

const MenuSection = () => {
  const [activeTab, setActiveTab] = useState('menu-starters');
  const navigate = useNavigate();

  
  const menuCategories = [
    { id: 'menu-starters', title: 'Starters', icon: 'bi-egg-fried' },
    { id: 'menu-breakfast', title: 'Breakfast', icon: 'bi-cup-hot' },
    { id: 'menu-lunch', title: 'Lunch', icon: 'bi-cup-straw' },
    { id: 'menu-dinner', title: 'Dinner', icon: 'bi-palette' }
  ];

  const menuItems = {
    'menu-starters': [
      { name: "Bruschetta", description: "Toasted bread with fresh tomatoes, garlic, basil, and olive oil", price: "₹100", img: "menu-item-1.png" },
      { name: "Fried Calamari", description: "Lightly breaded squid served with marinara sauce", price: "₹200", img: "menu-item-2.png" },
      { name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze", price: "₹300", img: "menu-item-3.png" },
      { name: "Stuffed Mushrooms", description: "Mushroom caps filled with seasoned breadcrumbs and cheese", price: "₹400", img: "menu-item-4.png" },
      { name: "Shrimp Cocktail", description: "Chilled jumbo shrimp with zesty cocktail sauce", price: "₹500", img: "menu-item-5.png" },
      { name: "Spinach Artichoke Dip", description: "Creamy dip with spinach, artichokes, and melted cheese", price: "₹600", img: "menu-item-6.png" },
    ],
    'menu-breakfast': [
      { name: "Eggs Benedict", description: "Poached eggs on English muffin with hollandaise sauce", price: "₹900", img: "menu-item-5.png" },
      { name: "Belgian Waffles", description: "Fluffy waffles topped with fresh berries and maple syrup", price: "₹700", img: "menu-item-6.png" },
      { name: "Avocado Toast", description: "Whole grain toast with smashed avocado, eggs, and red pepper flakes", price: "₹800", img: "menu-item-1.png" },
      { name: "Classic Omelette", description: "Three-egg omelette with cheese, ham, and seasonal vegetables", price: "₹1000", img: "menu-item-2.png" },
      { name: "Pancake Stack", description: "Buttermilk pancakes with butter and pure maple syrup", price: "₹600", img: "menu-item-3.png" },
      { name: "Breakfast Burrito", description: "Scrambled eggs, sausage, peppers, and cheese in a flour tortilla", price: "₹1100", img: "menu-item-4.png" },
    ],
    'menu-lunch': [
      { name: "Chicken Caesar Wrap", description: "Grilled chicken, romaine, parmesan in a flour tortilla", price: "₹1100", img: "menu-item-3.png" },
      { name: "Turkey Club Sandwich", description: "Triple-decker with turkey, bacon, lettuce, and tomato", price: "₹1200", img: "menu-item-4.png" },
      { name: "Mushroom Risotto", description: "Arborio rice slowly cooked with wild mushrooms and parmesan", price: "₹1300", img: "menu-item-5.png" },
      { name: "Greek Salad", description: "Tomatoes, cucumber, olives, feta, and red onion with oregano", price: "₹1000", img: "menu-item-6.png" },
      { name: "Fish Tacos", description: "Grilled fish, cabbage slaw, and chipotle aioli in corn tortillas", price: "₹1400", img: "menu-item-1.png" },
      { name: "Veggie Burger", description: "House-made plant-based patty with all the fixings", price: "₹1200", img: "menu-item-2.png" },
    ],
    'menu-dinner': [
      { name: "Filet Mignon", description: "8oz tenderloin with mashed potatoes and seasonal vegetables", price: "₹3000", img: "menu-item-2.png" },
      { name: "Grilled Salmon", description: "Wild-caught salmon with lemon butter sauce and asparagus", price: "₹2200", img: "menu-item-1.png" },
      { name: "Chicken Parmesan", description: "Breaded chicken breast topped with marinara and mozzarella", price: "₹1700", img: "menu-item-6.png" },
      { name: "Eggplant Lasagna", description: "Layers of eggplant, ricotta, mozzarella, and tomato sauce", price: "₹1500", img: "menu-item-5.png" },
      { name: "Shrimp Scampi", description: "Jumbo shrimp in garlic butter sauce over linguine", price: "₹2000", img: "menu-item-4.png" },
      { name: "Prime Rib", description: "Slow-roasted prime rib with au jus and horseradish cream", price: "₹2700", img: "menu-item-3.png" },
    ],
  };

  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

 
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.refresh();
    }
  }, [activeTab]);

 
  const handleCardClick = () => {
    navigate('/order');
  };

  return (
    <section id="menu" className="menu-section">
      
      <div class="container section-title" data-aos="fade-up">
        <h2>Our Menu</h2>
        <p><span>Check Our</span> <span class="description-title">Yummy Menu</span></p>
      </div>

      <div className="container">
       
        <div className="menu-tcabs-wrapper" data-aos="fade-up" data-aos-delay="100">
          <ul className="menu-tabs">
            {menuCategories.map((category) => (
              <li key={category.id} className="menu-tab-item">
                <button 
                  className={`menu-tab-button ${activeTab === category.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(category.id)}
                >
                  <i className={`bi ${category.icon}`}></i>
                  <h4>{category.title}</h4>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu Content */}
        <div className="menu-content" data-aos="fade-up" data-aos-delay="200">
          {menuCategories.map((category) => (
            <div 
              key={category.id}
              className={`menu-tab-content ${activeTab === category.id ? 'active' : ''}`}
              id={category.id}
            >
              <div className="menu-header">
                <p>Our Selection</p>
                <h3>{category.title}</h3>
              </div>

              <div className="menu-items-grid">
                {menuItems[category.id].map((item, index) => (
                  <div className="menu-item" key={index} onClick={handleCardClick}>
                    <div className="menu-item-img-container">
                      <img
                        src={`/img/menu/${item.img}`}
                        className="menu-img"
                        alt={item.name}
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div className="menu-item-overlay">
                        <button className="view-button">
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </div>
                    <div className="menu-item-info">
                      <h4>{item.name}</h4>
                      <p className="ingredients">{item.description}</p>
                      <p className="price">{item.price}</p>
                      
                    </div>
                    <button className="buy-now-button" onClick={handleCardClick}>
                        Buy Now
                      </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;