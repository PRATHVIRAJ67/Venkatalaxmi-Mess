import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Gallery.css';

const galleryImages = [
  'gallery-1.jpg',
  'gallery-2.jpg',
  'gallery-3.jpg',
  'gallery-4.jpg',
  'gallery-5.jpg',
  'gallery-6.jpg',
  'gallery-7.jpg',
  'gallery-8.jpg',
];

const Gallery = () => {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <section id="gallery" className="gallery section light-background">
      
      <div className="container section-title" data-aos="fade-up">
        <h2>Gallery</h2>
        <p>
          <span>Check</span>{' '}
          <span className="description-title">Our Gallery</span>
        </p>
      </div>

      
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          speed={600}
          autoplay={{ delay: 5000 }}
          slidesPerView="auto"
          centeredSlides={true}
          pagination={{ clickable: true }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 0,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
          }}
          className="gallery-swiper"
        >
          {galleryImages.map((img, idx) => (
          <SwiperSlide key={idx} className="swiper-slide align-items-center">
            <div className="gallery-image-wrapper">
              <img
                src={`/img/gallery/${img}`}
                className="img-fluid"
                alt={`Gallery ${idx + 1}`}
                draggable="false"
              />
            </div>
          </SwiperSlide>
        ))}

        </Swiper>
        <div className="swiper-pagination" />
      </div>
    </section>
  );
};

export default Gallery;
