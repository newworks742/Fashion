'use client';

export function TwinBanner() {
  return (
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
  );
}