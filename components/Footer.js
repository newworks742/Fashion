
// ==================== Footer.jsx ====================
'use client';

export function Footer() {
  return (
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
            <div className="h-6 bg-white px-3 py-1 rounded text-xs text-black font-bold flex items-center">VISA</div>
            <div className="h-6 bg-white px-3 py-1 rounded text-xs text-black font-bold flex items-center">MASTERCARD</div>
            <div className="h-6 bg-white px-3 py-1 rounded text-xs text-black font-bold flex items-center">UPI</div>
          </div>
          <p className="text-center text-xs text-gray-400">© PUMA India Ltd, 2024. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}