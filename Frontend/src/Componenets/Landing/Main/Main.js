import React, { useEffect } from 'react';
import './Main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Main = () => {
  // Function to handle video lightbox
  const handleVideoPlay = (e) => {
    e.preventDefault();
    // You would typically initialize a lightbox library here
    // For example: GLightbox().open({ ... })
    console.log("Video play requested");
  };

  // Initialize AOS animation library if it's being used
  useEffect(() => {
    // If you're using AOS library, initialize it here
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }, []);

  return (
    <main className="main">
      {/* Hero Section */}
      <section id="hero" className="hero section">
        <div className="container">
          <div className="row gy-4 justify-content-center justify-content-lg-between align-items-center">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center hero-content">
              <h1 className="animate-element" data-aos="fade-up">
                Enjoy Your Healthy<br />Delicious Food
              </h1>
              <p className="animate-element" data-aos="fade-up" data-aos-delay="100">
                We are a team of talented chefs creating memorable dining experiences with the freshest ingredients
              </p>
              <div className="hero-buttons animate-element" data-aos="fade-up" data-aos-delay="200">
                <a href="#menu" className="btn-get-started">Book Now</a>
                <a 
                
                >
                  {/* <i className="bi bi-play-circle"></i>
                  <span>Watch Video</span> */}
                </a>
              </div>
            </div>
            <div className="col-lg-5 order-1 order-lg-2 hero-img" data-aos="zoom-out">
              <div className="img-container">
                <img 
                  src="/img/hero-img.png" 
                  className="img-fluid animated" 
                  alt="Delicious Food" 
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;