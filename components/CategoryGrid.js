'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PumaHomepage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 11,
    minutes: 53,
    seconds: 54
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'FOR HIM', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop' },
    { name: 'FOR HER', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=300&fit=crop' }
  ];

  const cyberProducts = [
    { name: 'MEN', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop' },
    { name: 'WOMEN', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop' }
  ];

  const shoeCategories = [
    { name: 'SPORTSTYLE', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=300&h=200&fit=crop' },
    { name: 'RUNNING', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop' },
    { name: 'TRAINING', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=200&fit=crop' }
  ];

  const dealProducts = [
    {
      name: "Swift Pulse Men's Training Shoes",
      price: 6499,
      discountedPrice: 4549,
      discount: '30% OFF',
      tag: 'HOT DEAL',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
    },
    {
      name: "Flyer Runner Engineered Knit...",
      price: 5999,
      discountedPrice: 4199,
      discount: '30% OFF',
      tag: 'HOT DEAL',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop'
    },
    {
      name: "Cali Dream Women's...",
      price: 7999,
      discountedPrice: 5599,
      discount: '30% OFF',
      tag: 'HOT DEAL',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop'
    }
  ];

  const winterCategories = [
    { name: 'SNEAKERS', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=400&fit=crop' },
    { name: 'PUMA X NBA', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=400&fit=crop' },
    { name: 'WINTERWEAR', image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=300&h=400&fit=crop' },
    { name: 'RUNNING', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop' },
    { name: 'ATHLEISURE', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop' },
    { name: 'MOTORSPORT', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=400&fit=crop' }
  ];

  const trendingProducts = [
    {
      name: "Bishop Rider Suede Sneakers Unisex",
      price: 6999,
      discountedPrice: 4199,
      discount: '40% OFF',
      tag: 'NEW',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop'
    },
    {
      name: "Civic Keepster Supasoft+",
      price: 4999,
      discountedPrice: 3499,
      discount: '30% OFF',
      tag: 'HOT DEAL',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop'
    },
    {
      name: "Rider FV Unisex...",
      price: 6499,
      discountedPrice: 4549,
      discount: '30% OFF',
      tag: 'HOT DEAL',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Countdown Timer Banner */}
      <div className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">EXTRA 30% OFF</h2>
            <h3 className="text-xl mb-4">ON EVERYTHING*</h3>
            <p className="text-sm mb-4">AUTO APPLIED AT CHECKOUT</p>
            <div className="flex justify-center gap-4 text-center">
              <div>
                <div className="bg-white text-black text-2xl font-bold px-4 py-2 rounded">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">DAYS</div>
              </div>
              <div>
                <div className="bg-white text-black text-2xl font-bold px-4 py-2 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">HOURS</div>
              </div>
              <div>
                <div className="bg-white text-black text-2xl font-bold px-4 py-2 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">MINUTES</div>
              </div>
              <div>
                <div className="bg-white text-black text-2xl font-bold px-4 py-2 rounded">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1">SECONDS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, idx) => (
            <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-lg">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-pink-100 relative">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white text-2xl font-bold bg-black px-4 py-2 inline-block">
                    {category.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cyber Monday Section */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">GO WILD THIS CYBER MONDAY</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {cyberProducts.map((product, idx) => (
              <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-lg">
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-900 to-pink-900 relative">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold">
                      {idx === 0 ? 'NEW DROP' : 'EXTRA 30% OFF'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-3xl font-bold">{product.name}</h3>
                    <p className="text-white text-lg mt-2">
                      {idx === 0 ? 'EXTRA 30% OFF' : 'SELECT ITEMS'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shoe Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">WHEN THE GREATS DROP THEIR GUARD</h2>
        <div className="grid grid-cols-3 gap-4">
          {shoeCategories.map((category, idx) => (
            <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-lg">
              <div className="aspect-[3/2] bg-gradient-to-br from-blue-100 to-green-100 relative">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-black text-xl font-bold bg-white px-3 py-1 inline-block">
                    {category.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Drops Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">LATEST DROPS, NOW AT FLAT 30% OFF</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {cyberProducts.map((product, idx) => (
              <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-lg">
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-200 to-yellow-100 relative">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-3xl font-bold bg-black px-4 py-2 inline-block">
                      {product.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cyber Monday Steals */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">CYBER MONDAY STEALS</h2>
          <p className="text-xl">GET EXTRA 30% + 10% OFF</p>
          <div className="flex justify-center gap-3 mt-4 text-2xl font-bold">
            <div className="bg-black text-white px-4 py-2 rounded">{String(timeLeft.hours).padStart(2, '0')}</div>
            <span>:</span>
            <div className="bg-black text-white px-4 py-2 rounded">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <span>:</span>
            <div className="bg-black text-white px-4 py-2 rounded">{String(timeLeft.seconds).padStart(2, '0')}</div>
          </div>
          <p className="text-sm text-gray-600 mt-2">AUTO APPLIED AT CHECKOUT</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dealProducts.map((product, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative">
                <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-xs font-bold z-10">
                  {product.tag}
                </span>
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold">₹{product.discountedPrice}</span>
                  <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                </div>
                <span className="text-xs text-red-600 font-semibold">{product.discount}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Winter Collection */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">ENTER YOUR WINTER ARC WITH EXTRA 30% OFF</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {winterCategories.map((category, idx) => (
            <div key={idx} className="relative group cursor-pointer overflow-hidden rounded-lg">
              <div className="aspect-[3/4] bg-gradient-to-br from-blue-200 to-purple-200 relative">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold bg-black px-3 py-2 inline-block">
                    {category.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Twin Banner */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative group cursor-pointer overflow-hidden rounded-lg">
          <div className="aspect-[21/9] bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">TWIN YOUR WIN</h2>
              <p className="text-xl mb-6">BUY 1 GET 1 AT 50% OFF, ONLY ON THE APP</p>
              <button className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-100 transition-colors">
                SHOP NOW
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Now */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">TRENDING NOW</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {trendingProducts.map((product, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="relative">
                <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-xs font-bold z-10">
                  {product.tag}
                </span>
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform"></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold">₹{product.discountedPrice}</span>
                  <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                </div>
                <span className="text-xs text-red-600 font-semibold">{product.discount}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Footer Sections */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-lg">SUPPORT</h3>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">ABOUT</h3>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">STAY UP TO DATE</h3>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">EXPLORE</h3>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm">🇮🇳 INDIA</span>
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 bg-white px-2 py-1 rounded" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 bg-white px-2 py-1 rounded" />
            </div>
            <p className="text-center text-xs text-gray-400">© PUMA India Ltd, 2024. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}