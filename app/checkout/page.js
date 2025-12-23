'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, CreditCard, Truck, ChevronRight, Trash2, Plus, Minus } from 'lucide-react';

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [activeStep, setActiveStep] = useState(2);
    const [showAddressForm, setShowAddressForm] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        pincode: '',
        flatNo: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        type: 'home',
        paymentMethod: 'cod',
        isDefault: false
    });

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        fetchUserSession();
        fetchCartItems();
        fetchAddresses();
    }, []);

    const fetchUserSession = async () => {
        try {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
                const session = await res.json();
                if (session?.user?.id) {
                    setUserId(session.user.id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch session:', err);
        }
    };

    const fetchCartItems = async () => {
        try {
            const res = await fetch('/api/cartfetch');
            if (res.ok) {
                const data = await res.json();
                
                // Convert image buffer to base64 if needed
                const processedItems = data.items.map(item => {
                    if (item.image && item.image.data && Array.isArray(item.image.data)) {
                        const base64 = btoa(
                            item.image.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        return { ...item, image: base64 };
                    }
                    return item;
                });
                
                setCartItems(processedItems);
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/checkout');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
                if (data.addresses && data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0].id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        }
    };

    const updateQuantity = async (cartId, change) => {
        const item = cartItems.find(i => i.id === cartId);
        const newQty = Math.max(1, item.qty + change);
        
        try {
            const res = await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId, qty: newQty })
            });
            
            if (res.ok) {
                setCartItems(items =>
                    items.map(item =>
                        item.id === cartId ? { ...item, qty: newQty } : item
                    )
                );
            }
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const removeItem = async (cartId) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId })
            });
            
            if (res.ok) {
                setCartItems(items => items.filter(item => item.id !== cartId));
            }
        } catch (err) {
            console.error('Failed to remove item:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveAddress = async () => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                await fetchAddresses();
                setShowAddressForm(false);
                setFormData({
                    fullName: '',
                    mobile: '',
                    pincode: '',
                    address: '',
                    locality: '',
                    city: '',
                    state: '',
                    addressType: 'home',
                    paymentMethod: formData.paymentMethod
                });
            }
        } catch (err) {
            console.error('Failed to save address:', err);
        }
    };

    // const placeOrder = async () => {
    //     if (!selectedAddress) {
    //         alert('Please select a delivery address');
    //         return;
    //     }

    //     try {
    //         const res = await fetch('/api/order', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 address_id: selectedAddress,
    //                 userId : userId,
    //                 payment_method: formData.paymentMethod,
    //                 items: cartItems
    //             })
    //         });
            
    //         if (res.ok) {
    //             alert('Order placed successfully!');
    //             window.location.href = '/orders';
    //         } else {
    //             alert('Failed to place order');
    //         }
    //     } catch (err) {
    //         console.error('Failed to place order:', err);
    //         alert('Error placing order');
    //     }
    // };
const placeOrder = async () => {
    if (!selectedAddress) {
        alert('Please select a delivery address');
        return;
    }

    const orderItems = cartItems.map(item => ({
        product_id: item.product_id || item.id,   
        name: item.name || item.product_name,
        category: item.category,
        price: item.discounted_price || item.cart_price || item.price,
        qty: item.qty,
        size :item.size,
        color :item.color,

    }));

    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address_id: selectedAddress,
                payment_method: formData.paymentMethod,
                items: orderItems
            })
        });

        if (res.ok) {
            alert('Order placed successfully!');
            window.location.href = '/orders';
        } else {
            const err = await res.json();
            console.error(err);
            alert('Failed to place order');
        }
    } catch (err) {
        console.error('Failed to place order:', err);
        alert('Error placing order');
    }
};

    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.discounted_price || item.cart_price || item.price || 0;
        return sum + (price * item.qty);
    }, 0);
    
    const originalTotal = cartItems.reduce((sum, item) => {
        const price = item.price || item.cart_price || 0;
        return sum + (price * item.qty);
    }, 0);
    
    const discount = originalTotal - subtotal;
    const deliveryCharges = subtotal > 500 ? 0 : 40;
    const total = subtotal + deliveryCharges;

    const steps = [
        { number: 1, title: 'Cart', icon: ShoppingBag },
        { number: 2, title: 'Address', icon: MapPin },
        { number: 3, title: 'Payment', icon: CreditCard }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
                </div>
            </div>

            {/* Steps Indicator */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex items-center">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full
                                        ${activeStep >= step.number ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}
                                    `}>
                                        {activeStep > step.number ? (
                                            <span className="text-sm sm:text-base">✓</span>
                                        ) : (
                                            <step.icon size={16} className="sm:w-5 sm:h-5" />
                                        )}
                                    </div>
                                    <span className={`ml-2 text-xs sm:text-sm font-medium hidden sm:block ${activeStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${activeStep > step.number ? 'bg-black' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Step 2: Delivery Address */}
                        {activeStep === 2 && (
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                    <MapPin size={24} />
                                    Delivery Address
                                </h2>

                                {/* Saved Addresses */}
                                <div className="space-y-3 mb-4">
                                    {addresses.map(addr => (
                                        <label
                                            key={addr.address_id}
                                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                                selectedAddress === addr.address_id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="selectedAddress"
                                                    checked={selectedAddress === addr.address_id}
                                                    onChange={() => setSelectedAddress(addr.address_id)}
                                                    className="mt-1 w-4 h-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{addr.fullName}</span>
                                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{addr.type}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{addr.flatNo}, {addr.area} </p>
                                                     <p className="text-sm text-gray-700">{addr.landmark}</p>
                                                    <p className="text-sm text-gray-700">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                    <p className="text-sm text-gray-600 mt-1">Mobile: {addr.mobile}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>



                                <button
                                    onClick={() => setActiveStep(3)}
                                    disabled={!selectedAddress}
                                    className="w-full mt-4 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Continue to Payment
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {activeStep === 3 && (
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                    <CreditCard size={24} />
                                    Payment Method
                                </h2>

                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleInputChange}
                                            className="mt-1 w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold flex items-center gap-2">
                                                <Truck size={20} />
                                                Cash on Delivery
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Pay when you receive the product</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="online"
                                            checked={formData.paymentMethod === 'online'}
                                            onChange={handleInputChange}
                                            className="mt-1 w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold flex items-center gap-2">
                                                <CreditCard size={20} />
                                                Online Payment
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Credit/Debit Card, UPI, Net Banking</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setActiveStep(2)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Back to Address
                                    </button>
                                    <button
                                        onClick={placeOrder}
                                        className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-black-700 transition-colors"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-24">
                            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                            
                            {/* Cart Items Preview */}
                            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-2 text-sm border-b pb-2">
                                        {item.image && item.image_mime && (
                                            <img
                                                src={`data:${item.image_mime};base64,${item.image}`}
                                                alt={item.name || item.product_name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.name || item.product_name}</p>
                                            <p className="text-xs text-gray-600">Qty: {item.qty} | Size: {item.size}</p>
                                            <p className="font-semibold">₹{item.discounted_price || item.cart_price || item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-4 border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                                    <span className="font-semibold">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-semibold text-black-600">-₹{discount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Charges</span>
                                    <span className="font-semibold">
                                        {deliveryCharges === 0 ? (
                                            <span className="text-black-600">FREE</span>
                                        ) : (
                                            `₹${deliveryCharges}`
                                        )}
                                    </span>
                                </div>
                                {deliveryCharges > 0 && (
                                    <p className="text-xs text-gray-500">
                                        Add ₹{500 - subtotal} more to get FREE delivery
                                    </p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold">Total Amount</span>
                                    <span className="text-2xl font-bold">₹{total}</span>
                                </div>
                                <p className="text-xs text-black-600 font-medium">
                                    You will save ₹{discount} on this order
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}