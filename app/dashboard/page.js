"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, Edit, Plus, Trash2, Loader2, X, Check } from 'lucide-react';
import { countries, phoneNumberPatterns } from '@/lib/constants';

export default function FashionDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    fullName: '',
    mobile: '',
    flatNo: '',
    area: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    isDefault: false
  });

  // Country search states
  const [countrySearchTerm, setCountrySearchTerm] = useState('India');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [phoneError, setPhoneError] = useState('');

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch user data
  const fetchUserData = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const userId = session.user.id;

      // Profile
      const profileRes = await fetch(`/api/register?type=profile&userId=${userId}`);
      const profileData = await profileRes.json();
      if (profileRes.ok) setProfileForm({
        name: profileData.first_name || '',
        email: profileData.email || '',
        phone: profileData.phone || ''
      });

      // Addresses
      const addressRes = await fetch(`/api/register?type=addresses&userId=${userId}`);
      const addressData = await addressRes.json();
      setAddresses(Array.isArray(addressData) ? addressData : []);

      // Orders
      const ordersRes = await fetch(`/api/register?type=orders&userId=${userId}`);
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) fetchUserData();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  // ---------- PROFILE SUBMIT ----------
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, name: profileForm.name, phone: profileForm.phone }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        alert('Profile updated successfully!');
        setProfileForm({ name: data.user.first_name, email: data.user.email, phone: data.user.phone });
        setShowProfileModal(false);
        fetchUserData();
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  // ---------- ADDRESS SUBMIT ----------
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!editingAddress && addresses.length >= 2) {
      alert('Maximum 2 addresses allowed. Delete one first.');
      return;
    }
    try {
      const action = editingAddress ? 'edit' : 'add';
      const body = { action, userId: session.user.id, ...addressForm, ...(editingAddress?{ originalAddress: editingAddress } : {}) };
      if (editingAddress?.id) body.addressId = editingAddress.id;

      const res = await fetch('/api/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        alert(editingAddress ? 'Address updated!' : 'Address added!');
        closeAddressModal();
        fetchUserData();
      } else alert(data.error || 'Failed to save address');
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  const deleteAddress = async (index) => {
  if (!confirm('Delete this address?')) return;  // Confirmation popup
  try {
    const res = await fetch('/api/register', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', userId: session.user.id, index, addressData: addresses[index] }),
    });
    if (res.ok) fetchUserData();  // Refresh addresses
    else alert('Failed to delete address');
  } catch (err) { console.error(err); alert('Failed to delete address'); }
};


  const setDefaultAddress = async (addressId) => {
    try {
      const res = await fetch('/api/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'default', userId: session.user.id, addressId }),
      });
      if (res.ok) fetchUserData();
      else alert('Failed to set default address');
    } catch (err) { console.error(err); }
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    const addressCountry = address.country || 'India';
    setAddressForm({
      type: address.type || 'Home',
      fullName: address.full_name || address.fullName || '',
      mobile: address.mobile || '',
      flatNo: address.flat_no || address.flatNo || '',
      area: address.area || '',
      landmark: address.landmark || '',
      pincode: address.pincode || address.zip || '',
      city: address.city || '',
      state: address.state || '',
      country: addressCountry,
      isDefault: address.is_default || false
    });
    setCountrySearchTerm(addressCountry);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({ type: 'Home', fullName: '', mobile: '', flatNo: '', area: '', landmark: '', pincode: '', city: '', state: '', country: 'India', isDefault: false });
    setCountrySearchTerm('India');
    setPhoneError('');
  };

  const filterCountries = (term) => {
    const t = term.toLowerCase();
    const starts = countries.filter((c) => c.name.toLowerCase().startsWith(t));
    const contains = countries.filter(
      (c) => !c.name.toLowerCase().startsWith(t) && c.name.toLowerCase().includes(t)
    );
    const combined = [...starts, ...contains];
    const codeMatches = countries.filter((c) => c.code.replace('+', '').includes(t.replace('+', '')));
    codeMatches.forEach((c) => {
      if (!combined.some((x) => x.name === c.name)) combined.push(c);
    });
    setFilteredCountries(combined);
  };

  const selectCountry = (c) => {
    setAddressForm({...addressForm, country: c.name, mobile: ''});
    setCountrySearchTerm(c.name);
    setShowCountryDropdown(false);
    setPhoneError('');
  };

  const handleCountryInput = (value) => {
    setCountrySearchTerm(value);
    setAddressForm({...addressForm, country: value});
    filterCountries(value);
    setShowCountryDropdown(true);
  };

  const validatePhone = (value, selectedCountry) => {
    if (!value) {
      setPhoneError('Required');
      return false;
    }
    
    const regex = phoneNumberPatterns[selectedCountry] || /^[0-9]+$/;
    
    if (!regex.test(value)) {
      setPhoneError(`Invalid phone for ${selectedCountry}`);
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'orders', icon: Package, label: 'Orders' },
            { id: 'addresses', icon: MapPin, label: 'Addresses' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Profile Information</h3>
                <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800">
                  <Edit size={16} /> Edit
                </button>
              </div>
              <div className="space-y-6 border border-gray-200 p-6">
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500 uppercase">Name</dt>
                  <dd className="text-base col-span-2">{profileForm.name || 'Not provided'}</dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500 uppercase">Email</dt>
                  <dd className="text-base col-span-2">{profileForm.email}</dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="text-sm font-medium text-gray-500 uppercase">Phone</dt>
                  <dd className="text-base col-span-2">{profileForm.phone || 'Not provided'}</dd>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Order History</h3>
              {orders.length === 0 ? (
                <div className="text-center py-16 border border-gray-200">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-2">No orders yet</p>
                  <p className="text-sm text-gray-400">Your order history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-200 p-6 hover:border-black">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="font-bold text-black">ORDER #{order.ordernumber || order.id}</h4>
                            <span className={`px-3 py-1 text-xs font-medium uppercase ${order.status === 'Delivered' ? 'bg-black text-white' : order.status === 'Shipped' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Date: {new Date(order.orderdate || order.created_at).toLocaleDateString()}</p>
                            <p>Total: ${parseFloat(order.totalamount || order.total || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {order.items && (
                        <div className="border-t border-gray-100 pt-4 mt-4">
                          <p className="text-sm text-gray-500 mb-2 uppercase">Items</p>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-black">{item.name}</span>
                                <span className="text-gray-600">Qty: {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">Saved Addresses</h3>
                <button 
                  onClick={() => {
                    if (addresses.length >= 2) {
                      alert('Maximum 2 addresses allowed. Delete one first.');
                      return;
                    }
                    setShowAddressModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
                  disabled={addresses.length >= 2}
                >
                  <Plus size={16} /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-16 border border-gray-200">
                  <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-2">No saved addresses</p>
                  <p className="text-sm text-gray-400">Add an address for faster checkout</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                 {addresses.map((address, index) => (
  <div key={`address-${index}`} className="border border-gray-200 p-6 relative hover:border-black transition-colors">
    {address.is_default && (
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-black text-white text-xs font-medium uppercase tracking-wide flex items-center gap-1">
          <Check size={12} /> Default
        </span>
      </div>
    )}
    <div className="mb-4">
      <h4 className="font-bold text-black uppercase tracking-wide text-sm mb-3">{address.type}</h4>
      <div className="space-y-1 text-sm text-gray-600">
        <p className="font-medium text-black">{address.fullName}</p>
        {address.mobile && <p>{address.mobile}</p>}
        <p>{address.flatNo}</p>
        <p>{address.area}</p>
        {address.landmark && <p className="text-gray-500">Landmark: {address.landmark}</p>}
        <p>{address.city}, {address.state} - {address.pincode}</p>
        <p>{address.country || 'India'}</p>
      </div>
    </div>
    <div className="flex gap-2 pt-4 border-t border-gray-100">
      {/* {!address.is_default && (
        // <button onClick={() => setDefaultAddress(index)} className="flex-1 py-2 text-xs font-medium uppercase tracking-wide border border-gray-300 hover:border-black">
        //   Set Default
        // </button>
      )} */}
      <button onClick={() => openEditAddress(address)} className="flex-1 py-2 text-xs font-medium uppercase tracking-wide border border-gray-300 hover:border-black">
        Edit
      </button>
      <button onClick={() => deleteAddress(index)} className="flex-1 py-2 text-xs font-medium uppercase tracking-wide border border-gray-300 hover:border-red-600 hover:text-red-600">
        Delete
      </button>
    </div>
  </div>
))}

                </div>
              )}
              {addresses.length > 0 && addresses.length < 2 && (
                <p className="text-sm text-gray-500 mt-4">You can add {2 - addresses.length} more address{2 - addresses.length > 1 ? 'es' : ''}.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- Profile Modal ----------------- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-black">Edit Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Full Name</label>
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Email</label>
                <input type="email" value={profileForm.email} disabled className="w-full px-4 py-3 border border-gray-300 bg-gray-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Phone Number</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 px-6 py-3 border border-gray-300 hover:border-black uppercase font-medium text-sm">Cancel</button>
                <button onClick={handleProfileSubmit} className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 uppercase font-medium text-sm">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Address Modal ----------------- */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-black">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={closeAddressModal} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 relative country-dropdown-container">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Country *</label>
                  <input
                    type="text"
                    value={countrySearchTerm}
                    onChange={(e) => handleCountryInput(e.target.value)}
                    onFocus={() => {
                      filterCountries(countrySearchTerm);
                      setShowCountryDropdown(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black focus:outline-none"
                    placeholder="Search country"
                  />
                  {showCountryDropdown && (
                    <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 z-20 max-h-48 overflow-auto shadow-lg">
                      {filteredCountries.length === 0 && (
                        <li className="px-3 py-2 text-gray-500">No countries found</li>
                      )}
                      {filteredCountries.map((c) => (
                        <li
                          key={c.name}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectCountry(c);
                          }}
                        >
                          {c.name}
                          <span className="text-xs text-gray-500">{c.code}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div> 
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Phone *</label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-sm text-gray-700">
                      {countries.find((c) => c.name === addressForm.country)?.code || '+..'}
                    </span>
                    <input 
                      type="tel" 
                      value={addressForm.mobile} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, '');
                        setAddressForm({...addressForm, mobile: value});
                        validatePhone(value, addressForm.country);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:border-black focus:outline-none" 
                      placeholder="Phone" 
                      required 
                    />
                  </div>

                  {phoneError && (
                    <p className="text-xs text-red-600">{phoneError}</p>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 -mt-3">May be used to assist delivery</p>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Full name (First and Last name)</label>
                <input type="text" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Flat, House no., Building, Company, Apartment</label>
                <input type="text" value={addressForm.flatNo} onChange={e => setAddressForm({...addressForm, flatNo: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Area, Street, Sector, Village</label>
                <input type="text" value={addressForm.area} onChange={e => setAddressForm({...addressForm, area: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Landmark</label>
                <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" placeholder="E.g. near apollo hospital" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Pincode</label>
                  <input type="text" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" placeholder="6-digit Pincode" maxLength="6" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Town/City</label>
                  <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">State</label>
                <input type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" placeholder="Enter state" required />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Address Type</label>
                <div className="flex gap-4">
                  {['Home', 'Office', 'Other'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="addressType" value={type} checked={addressForm.type === type} onChange={e => setAddressForm({...addressForm, type: e.target.value})} className="w-4 h-4" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="defaultAddress" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4" />
                <label htmlFor="defaultAddress" className="text-sm text-gray-600">Set as default address</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeAddressModal} className="flex-1 px-6 py-3 border border-gray-300 hover:border-black uppercase font-medium text-sm">Cancel</button>
                <button onClick={handleAddressSubmit} className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 uppercase font-medium text-sm">Save Address</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}