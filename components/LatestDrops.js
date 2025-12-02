'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function LatestDrops() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/featured');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data); // Debug log
      
      // Handle different response structures
      let productsData = data.products || data.data || data;
      
      if (!Array.isArray(productsData)) {
        throw new Error('Invalid data format received');
      }

      // Process images if they're in Buffer format (like women's component)
      productsData = productsData.map(product => {
        // Handle Buffer format images
        if (product.image && product.image.data && Array.isArray(product.image.data)) {
          const base64 = btoa(
            product.image.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          return { ...product, image: base64 };
        }
        return product;
      });

      setProducts(productsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (producturl) => {
    if (producturl) {
      router.push(`/men/${producturl}`);
    }
  };

  // Helper function to get image source
  const getImageSrc = (product) => {
    // Check for direct URL
    if (product.image_url) {
      return product.image_url;
    }
    // Check for base64 image
    if (product.image && product.image_mime) {
      return `data:${product.image_mime};base64,${product.image}`;
    }
    // Fallback
    return null;
  };

  // Helper function to calculate price
  const getDiscountedPrice = (product) => {
    if (product.discounted_price) {
      return parseFloat(product.discounted_price);
    }
    if (product.price && product.discount) {
      const discount = parseFloat(product.discount) || 0;
      return (parseFloat(product.price) * (1 - discount / 100));
    }
    return parseFloat(product.price) || 0;
  };

  const getOriginalPrice = (product) => {
    return parseFloat(product.price) || 0;
  };

  const getDiscount = (product) => {
    if (product.discount) {
      // Remove % if it exists and parse
      const discountStr = product.discount.toString().replace('%', '');
      return parseFloat(discountStr) || 0;
    }
    return 0;
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-600 font-bold text-lg mb-2">Error Loading Products</h3>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No products available</p>
      </div>
    );
  }

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
          {products.map((product, idx) => {
            const imageSrc = getImageSrc(product);
            const discountedPrice = getDiscountedPrice(product);
            const originalPrice = getOriginalPrice(product);
            const discount = getDiscount(product);

            return (
              <div
                key={product.id || idx}
                className="group cursor-pointer"
                onClick={() => handleClick(product.producturl)}
              >
                {/* Image Container */}
                <div className="relative aspect-square mb-3 overflow-hidden bg-gray-100">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.product_name || 'Product'}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback for missing images */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                    style={{ display: imageSrc ? 'none' : 'flex' }}
                  >
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-xs md:text-sm font-bold tracking-wider">
                      -{discount}%
                    </div>
                  )}

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
                    {product.product_name || 'Product'}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base md:text-lg font-black">
                      ₹{discountedPrice.toFixed(2)}
                    </span>
                    {discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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