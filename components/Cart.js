'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Minus, Plus, Package, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/app/providers';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get refreshCartCount from context
  const { refreshCartCount } = useCart();

  // Store pending updates to be sent to the server
  const updateTimeouts = useRef({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchCartItems();
    }
  }, [status, router]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cartfetch');

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        const processedItems = data.items.map(item => {
          if (item.image && typeof item.image === 'object' && item.image.type === 'Buffer' && Array.isArray(item.image.data)) {
            const base64 = btoa(
              item.image.data.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
            );

            const mimeType = item.image_mime || 'image/jpeg';
            const dataUri = mimeType.startsWith('data:') ? mimeType : `data:${mimeType}`;

            return {
              ...item,
              image: base64,
              image_mime: dataUri
            };
          }
          return item;
        });

        setCartItems(processedItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced update function - waits 1 second after user stops interacting
  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;

    // Update UI immediately for responsiveness
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, qty: newQty } : item
      )
    );

    // Clear existing timeout for this item
    if (updateTimeouts.current[itemId]) {
      clearTimeout(updateTimeouts.current[itemId]);
    }

    // Set new timeout to update server after 1 second
    updateTimeouts.current[itemId] = setTimeout(async () => {
      try {
        const response = await fetch(`/api/cartfetch/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty: newQty })
        });

        if (!response.ok) {
          // If update fails, revert the UI change
          console.error('Failed to update quantity');
          fetchCartItems(); // Refresh from server
        }
      } catch (err) {
        console.error('Error updating quantity:', err);
        fetchCartItems(); // Refresh from server on error
      } finally {
        delete updateTimeouts.current[itemId];
      }
    }, 1000); // Wait 1 second after last interaction
  };

  const removeItem = async (itemId) => {
    // Show loading state by removing item immediately
    setCartItems(prev => prev.filter(item => item.id !== itemId));

    try {
      const response = await fetch(`/api/cartfetch/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // If delete fails, refresh to show correct state
        console.error('Failed to remove item');
        fetchCartItems();
      } else {
        // Update navbar cart count immediately after successful deletion
        refreshCartCount();
      }
    } catch (err) {
      console.error('Error removing item:', err);
      fetchCartItems(); // Refresh from server on error
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
          <p className="text-xl text-gray-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-gray-800" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-600 mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-gray-600 text-xl mb-2">Your cart is empty</p>
            <p className="text-gray-500 text-sm mb-8">Add some items to get started!</p>
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all transform hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                      {item.image && item.image_mime ? (
                        <img
                          src={`${item?.image_mime};base64,${item?.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-orange-100 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {item.category && (
                              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                                {item.category}
                              </span>
                            )}
                            {item.size && (
                              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.qty - 1)}
                            className="p-2 hover:bg-gray-200 rounded-l-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            disabled={item.qty <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-6 py-2 text-sm font-medium min-w-[3rem] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{(item.price * item.qty).toLocaleString()}
                          </p>
                          {item.qty > 1 && (
                            <p className="text-xs text-gray-500">₹{item.price.toLocaleString()} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="text-gray-500 text-xs">At checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-8 pb-6 border-b border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{calculateTotal()}</span>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-black text-white py-4 rounded-lg text-sm font-semibold tracking-wide hover:bg-gray-800 transition-all transform hover:scale-[1.02] mb-3 shadow-lg"
                >
                  PROCEED TO CHECKOUT
                </button>

                <button
                  onClick={() => router.push('/products')}
                  className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-lg text-sm font-semibold tracking-wide hover:bg-gray-50 transition-all"
                >
                  CONTINUE SHOPPING
                </button>

                {/* Benefits */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Free shipping on orders over ₹5,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Secure checkout with encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}