'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingCart, Heart, ArrowLeft, Package, Truck, Shield, Check } from 'lucide-react';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to products</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 text-lg font-semibold mb-4">{error || 'Product not found'}</p>
            <button
              onClick={() => router.push('/men')}
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
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

  let productDetails = null;
  if (product.details) {
    try {
      productDetails = typeof product.details === 'string' 
        ? JSON.parse(product.details) 
        : product.details;
    } catch (e) {
      console.error('Failed to parse product details:', e);
    }
  } else if (product.color || product.style || product.material || product.dimension || product.manufacturer || product.origin_country || product.care_instructions) {
    productDetails = {
      color: product.color,
      style: product.style,
      material: product.material,
      dimension: product.dimension,
      manufacturer: product.manufacturer,
      origin_country: product.origin_country,
      care_instructions: product.care_instructions
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Product Image */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <span className="text-gray-400 text-lg font-medium">Product Image</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              <span>{product.subcategory}</span>
              <span className="mx-2">•</span>
              <span>{product.type}</span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {product.product_name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold shadow-md">
                  <span>{product.rating}</span>
                  <Star size={14} fill="white" />
                </div>
                <span className="text-gray-600 text-sm">({product.reviews.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-xl  font-bold text-gray-900">₹{product.discounted_price}</span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-base text-gray-500 line-through">₹{product.price}</span>
                    <span className=" text-green-600 px- py-  rounded-lg font-bold text-base">
                      {product.discount} OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-green-700 text-sm mt-2 font-medium">
                You save ₹{product.price - product.discounted_price}
              </p>
            </div>

            {/* Color Selection */}
            {colorsArray.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <p className="font-bold text-gray-900 mb-4">Select Color</p>
                <div className="flex flex-wrap gap-3">
                  {colorsArray.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-2 py-1 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        selectedColor === color
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <p className="font-bold text-gray-900 mb-4">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {sizesArray.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-2 py-1 rounded-lg font-medium transition-all transform hover:scale-105 min-w-[60px] ${
                        selectedSize === size
                          ? 'bg-black text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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
              <button className="flex bg-black text-white py-4 px-4 rounded-xl font-bold text-lg hover:bg-gray-800 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                <ShoppingCart size={22} />
                Add to Cart
              </button>
            
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Truck size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders over ₹500</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Package size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Shield size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">100% Authentic</p>
                    <p className="text-sm text-gray-600">Genuine products only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            {productDetails && Object.keys(productDetails).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Product Details</h3>
                <div className="space-y-3.5">
                  {Object.entries(productDetails).map(([key, value]) => {
                    if (!value) return null;
                    
                    const formattedKey = key
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                    
                    return (
                      <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600 font-medium">{formattedKey}</span>
                        <span className="text-gray-900 font-semibold text-right ml-4">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}