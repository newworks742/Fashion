'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function TrendingProducts() {
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
        setProducts(data.products?.slice(5, 8) || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (productUrl) => {
    router.push(`/men/${productUrl}`);
  };

  if (loading) return <div className="py-12"></div>;
  if (products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">TRENDING NOW</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {products.map((product, idx) => (
          <div 
            key={product.id || idx} 
            className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => handleClick(product.product_url || product.id)}
          >
            <div className="relative">
              <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-xs font-bold z-10">
                {idx === 0 ? 'NEW' : 'HOT DEAL'}
              </span>
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.product_name}</h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold">₹{product.discounted_price}</span>
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
  );
}
