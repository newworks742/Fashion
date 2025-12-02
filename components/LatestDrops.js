'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LatestDrops() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/featured');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products:', res.status);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (producturl) => {
    router.push(`/men/${producturl}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-bold tracking-wide">LOADING...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
            LATEST DROPS
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-black"></div>
            <p className="text-base md:text-lg font-bold tracking-wide">
              UP TO 40% OFF
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {products.map((product, idx) => (
            <div
              key={product.id || idx}
              className="group cursor-pointer"
              onClick={() => handleClick(product.producturl)}
            >
              {/* Image Container */}
              <div className="relative aspect-square mb-3 overflow-hidden bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider">
                  -{product.discount}%
                </div>

                {/* Quick Shop Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="bg-white text-black px-6 py-3 font-bold text-sm tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    QUICK VIEW
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-gray-600 font-medium tracking-wide uppercase">
                  {product.subcategory || product.type || 'Collection'}
                </p>
                <h3 className="text-sm md:text-base font-bold tracking-tight leading-tight line-clamp-2 group-hover:underline">
                  {product.product_name}
                </h3>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-base md:text-lg font-black">
                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 md:mt-20 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12 bg-black text-white">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black mb-2">
              DISCOVER MORE STYLES
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              Explore our full collection of premium products
            </p>
          </div>
          <button
            onClick={() => router.push('/men')}
            className="bg-white text-black px-8 py-4 font-bold text-sm tracking-widest hover:bg-gray-200 transition-colors duration-300 whitespace-nowrap"
          >
            SHOP ALL
          </button>
        </div>
      </div>
    </section>
  );
}