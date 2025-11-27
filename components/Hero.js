'use client';
import { useState, useEffect } from 'react';

export default function HeroSlider() {
  const heroSliderData = [
    {
      image: '/slide1.jpg',
      content: {
        title: 'Latest Trends',
        description: 'Explore fashion from top designers worldwide',
        tag: 'NEW IN'
      }
    },
    {
      image: '/slide2.jpg',
      content: {
        title: 'Designer Spotlight',
        description: 'Featured collections from renowned fashion houses',
        tag: 'FEATURED'
      }
    },
    {
      image: '/slide3.jpg',
      content: {
        title: 'Fashion Forward',
        description: 'Runway inspired looks for every occasion',
        tag: 'TRENDING'
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
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === heroSliderData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? heroSliderData.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-[600px] bg-white overflow-hidden">
      {/* Background Shape */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-black to-transparent"></div>

      <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
          
          {/* Left Content */}
          <div className="space-y-6 z-10">
            <div 
              key={`tag-${currentIndex}`}
              className="animate-fadeIn"
            >
              <span className="inline-block px-4 py-2 bg-primary-500 text-white text-sm font-bold uppercase tracking-wider">
                {currentSlide?.content?.tag}
              </span>
            </div>

            <div 
              key={`title-${currentIndex}`}
              className="animate-fadeIn"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-heading leading-tight">
                {currentSlide?.content?.title}
              </h1>
            </div>

            <div 
              key={`desc-${currentIndex}`}
              className="animate-fadeIn"
            >
              <p className="text-xl md:text-2xl text-description">
                {currentSlide?.content?.description}
              </p>
            </div>

  
          </div>

          {/* Right Image */}
          <div className="relative h-full flex items-center justify-center">
            <div
              key={`image-${currentIndex}`}
              className="relative animate-fadeIn w-full max-w-lg"
            >
              <div className="aspect-square">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Arrows */}


      {/* Dots */}
      <div className="absolute hidden bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {heroSliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              currentIndex === index
                ? 'w-12 h-3 bg-black'
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}