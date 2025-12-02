'use client';
import { useState, useEffect } from 'react';

export function CountdownBanner() {
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

  return (
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
  );
}