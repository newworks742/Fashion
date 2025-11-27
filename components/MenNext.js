'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingCart, Heart, ArrowLeft, Package, Truck, Shield } from 'lucide-react';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (params.producturl) {
      fetchProduct();
    }
  }, [params.producturl]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/men/${params.producturl}`);

      if (!res.ok) {
        throw new Error('Failed to fetch product');
      }

      const json = await res.json();

      if (json.error) {
        setError(json.error);
        setProduct(null);
      } else {
        setProduct(json.product);
        // Set default selections
        if (json.product.sizes) {
          const sizesArray = json.product.sizes.split(',').map(s => s.trim());
          setSelectedSize(sizesArray[0] || '');
        }
        if (json.product.colors) {
          const colorsArray = json.product.colors.split(',').map(c => c.trim());
          setSelectedColor(colorsArray[0] || '');
        }
      }
    } catch (err) {
      setError(err.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
          >
            <ArrowLeft size={20} />
            Back to products
          </button>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'Product not found'}</p>
            <button
              onClick={() => router.push('/men')}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Go to Men's Collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sizesArray = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
  const colorsArray = product.colors ? product.colors.split(',').map(c => c.trim()) : [];
  const discountPercent = product.discount ? parseInt(product.discount.replace('%', '')) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft size={20} />
          Back to products
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-purple-200 to-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">{product.subcategory} • {product.type}</p>
                <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded">
                    <span className="font-semibold">{product.rating}</span>
                    <Star size={16} fill="white" />
                  </div>
                  <span className="text-gray-600">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold">₹{product.discounted_price}</span>
                  {discountPercent > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">₹{product.price}</span>
                      <span className="text-xl text-green-600 font-semibold">{product.discount} off</span>
                    </>
                  )}
                </div>
              </div>

              {/* Color Selection */}
              {colorsArray.length > 0 && (
                <div>
                  <p className="font-semibold mb-3">Select Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colorsArray.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizesArray.length > 0 && (
                <div>
                  <p className="font-semibold mb-3">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizesArray.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:border-black hover:bg-gray-50">
                  <Heart size={20} />
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck size={20} />
                  <span>Free delivery on orders over ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Package size={20} />
                  <span>Easy 30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield size={20} />
                  <span>100% authentic products</span>
                </div>
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Product Description</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}