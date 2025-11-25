'use client';
import { useState, useEffect } from 'react';

export default function HeroSlider() {
  const heroSliderData = [
    {
      image: '/slide1.jpg',
      content: {
        title: 'New Collection 2024',
        description: 'Discover the latest trends in fashion'
      }
    },
    {
      image: '/slide2.jpg',
      content: {
        title: 'Summer Essentials',
        description: 'Fresh styles for the season'
      }
    },
    {
      image: '/slide3.jpg',
      content: {
        title: 'Limited Edition',
        description: 'Exclusive pieces just for you'
      }
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = heroSliderData[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === heroSliderData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 seconds autoplay

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[600px]">
      {/* Background Video */}
     
      {/* Overlay */}
      <div className="absolute inset-0 bg-black z-10"></div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Text Content */}
            <div className="text-white md:ml-10 text-center lg:text-left z-30 relative">
              <div 
                key={`title-${currentIndex}`}
                className="animate-zoomIn"
              >
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-relaxed">
                  {currentSlide?.content?.title}
                </h1>
              </div>

              <div 
                key={`desc-${currentIndex}`}
                className="animate-zoomIn"
              >
                <h2 className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mt-2 md:mt-2">
                  {currentSlide?.content?.description}
                </h2>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative flex items-center justify-center z-30">
              <div
                key={`image-${currentIndex}`}
                className="relative animate-zoomIn w-full max-w-[250px] sm:max-w-[300px] md:max-w-[500px] mx-auto"
              >
                <div className="relative rounded-xl overflow-hidden">
                  <div className="h-[200px] sm:h-[280px] md:h-[400px] lg:h-[500px] flex items-center justify-center p-4">
                    <img
                      src={currentSlide.image}
                      alt={`Slide ${currentIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-30 bg-black/30 backdrop-blur-sm rounded-full px-3 sm:px-5 py-2 sm:py-2.5">
        {heroSliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index
                ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white'
                : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-zoomIn {
          animation: zoomIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}