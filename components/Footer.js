'use client';
import { useState } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">
                STAY IN THE LOOP
              </h3>
              <p className="text-gray-400 text-sm md:text-base">
                Get exclusive access to new drops, sales, and style tips
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white border border-gray-700"
                />
              </div>
              <button 
                onClick={handleSubscribe}
                className="bg-white text-black px-6 py-3 font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 whitespace-nowrap transform hover:scale-105"
              >
                {subscribed ? '✓ SUBSCRIBED' : 'SUBSCRIBE'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black mb-4 tracking-tight">FASHIO</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Premium fashion for the modern lifestyle. Quality craftsmanship meets contemporary design.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition cursor-pointer">
                <Phone size={16} />
                <span>+91 1800 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition cursor-pointer">
                <Mail size={16} />
                <span>support@fashio.in</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400 hover:text-white transition cursor-pointer">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>123 Fashion Street, Mumbai, Maharashtra 400001</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold mb-4 text-lg uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Men's Collection</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Women's Collection</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Kids' Wear</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Accessories</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Sale</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4 text-lg uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Contact Us</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">FAQs</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Shipping Info</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Returns & Exchanges</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Track Order</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-lg uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">About Us</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Careers</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Sustainability</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Press</li>
              <li className="hover:text-white cursor-pointer transition hover:translate-x-1 transform duration-200">Store Locator</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Social & Location */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Social Links */}
            <div className="flex gap-3">
              <button className="h-10 w-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 cursor-pointer">
                <Facebook size={18} />
              </button>
              <button className="h-10 w-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 cursor-pointer">
                <Instagram size={18} />
              </button>
              <button className="h-10 w-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 cursor-pointer">
                <Twitter size={18} />
              </button>
              <button className="h-10 w-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110 cursor-pointer">
                <Youtube size={18} />
              </button>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-xl">🇮🇳</span>
              <span>India</span>
              <span className="text-gray-600">|</span>
              <span>English</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-8">
            <p className="text-xs text-gray-500 mb-3 text-center">SECURE PAYMENTS</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="h-10 px-4 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="font-bold text-blue-600 text-sm">VISA</span>
              </div>
              <div className="h-10 px-4 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="font-bold text-red-600 text-sm">MASTERCARD</span>
              </div>
              <div className="h-10 px-4 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="font-bold text-green-600 text-sm">UPI</span>
              </div>
              <div className="h-10 px-4 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="font-bold text-orange-600 text-sm">RUPAY</span>
              </div>
              <div className="h-10 px-4 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="font-bold text-purple-600 text-sm">PAYTM</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © 2024 Fashio India. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <button className="hover:text-white transition cursor-pointer">Privacy Policy</button>
              <button className="hover:text-white transition cursor-pointer">Terms of Service</button>
              <button className="hover:text-white transition cursor-pointer">Cookie Policy</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}