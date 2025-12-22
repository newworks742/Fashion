"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, Edit, Plus, Trash2, Loader2, X, Check } from 'lucide-react';
import { countries, phoneNumberPatterns, countryCurrencyMap } from '../lib/constants';

export default function FashionDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    phoneCountry: '' 
  });
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    isDefault: false
  });

  // Country dropdown states
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [filteredPhoneCountries, setFilteredPhoneCountries] = useState(countries);
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);
  const phoneDropdownRef = useRef(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch user data
  const fetchUserData = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const id = session.user.id;
      
      // Profile
      const profileRes = await fetch(`/api/register?type=profile&id=${id}`);
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        setProfileForm({
          name: profileData.first_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          phoneCountry: profileData.country || ''
        });
        setPhoneSearchTerm(profileData.country || '');
      }
      
      // Addresses
      const addressRes = await fetch(`/api/register?type=addresses&id=${id}`);
      const addressData = await addressRes.json();
      setAddresses(Array.isArray(addressData) ? addressData : []);
      
      // Orders
      const ordersRes = await fetch(`/api/register?type=orders&id=${id}`);
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchUserData();
  }, [session]);

  // Country search and selection for ADDRESS
  const filterCountries = (term) => {
    const t = term.toLowerCase();
    const starts = countries.filter((c) => c.name.toLowerCase().startsWith(t));
    const contains = countries.filter((c) => !c.name.toLowerCase().startsWith(t) && c.name.toLowerCase().includes(t));
    const combined = [...starts, ...contains];
    const codeMatches = countries.filter((c) => c.code.replace("+", "").includes(t.replace("+", "")));
    codeMatches.forEach((c) => {
      if (!combined.some((x) => x.name === c.name)) combined.push(c);
    });
    setFilteredCountries(combined);
  };

  const handleCountryInput = (value) => {
    setSearchTerm(value);
    filterCountries(value);
    setAddressForm({...addressForm, country: value});
    
    const newErrors = { ...errors };
    if (!countries.some((c) => c.name.toLowerCase() === value.toLowerCase())) {
      newErrors.country = 'Invalid country';
    } else {
      delete newErrors.country;
    }
    setErrors(newErrors);
  };

  const selectCountry = (country) => {
    setSearchTerm(country.name);
    setAddressForm({...addressForm, country: country.name});
    setShowDropdown(false);
    const newErrors = { ...errors };
    delete newErrors.country;
    setErrors(newErrors);
  };

  // Country search and selection for PHONE
  const filterPhoneCountries = (term) => {
    const t = term.toLowerCase();
    const starts = countries.filter((c) => c.name.toLowerCase().startsWith(t));
    const contains = countries.filter((c) => !c.name.toLowerCase().startsWith(t) && c.name.toLowerCase().includes(t));
    const combined = [...starts, ...contains];
    const codeMatches = countries.filter((c) => c.code.replace("+", "").includes(t.replace("+", "")));
    codeMatches.forEach((c) => {
      if (!combined.some((x) => x.name === c.name)) combined.push(c);
    });
    setFilteredPhoneCountries(combined);
  };

  const handlePhoneCountryInput = (value) => {
    setPhoneSearchTerm(value);
    filterPhoneCountries(value);
    setProfileForm({...profileForm, phoneCountry: value});
    
    const newErrors = { ...errors };
    if (!countries.some((c) => c.name.toLowerCase() === value.toLowerCase())) {
      newErrors.phoneCountry = 'Invalid country';
    } else {
      delete newErrors.phoneCountry;
      delete newErrors.phone;
    }
    setErrors(newErrors);
  };

  const selectPhoneCountry = (country) => {
    setPhoneSearchTerm(country.name);
    setProfileForm({...profileForm, phoneCountry: country.name});
    setShowPhoneDropdown(false);
    const newErrors = { ...errors };
    delete newErrors.phoneCountry;
    delete newErrors.phone;
    setErrors(newErrors);
  };

  // Validate phone number
  const validatePhone = (phoneValue, countryName) => {
    const newErrors = { ...errors };
    
    if (!phoneValue) {
      newErrors.phone = 'Phone number is required';
      setErrors(newErrors);
      return false;
    }

    if (!countryName || !countries.some(c => c.name === countryName)) {
      newErrors.phone = 'Please select a valid country first';
      setErrors(newErrors);
      return false;
    }

    const pattern = phoneNumberPatterns[countryName];
    const cleanPhone = phoneValue.replace(/\D/g, '');
    
    if (pattern && !pattern.test(cleanPhone)) {
      newErrors.phone = `Invalid phone format for ${countryName}`;
      setErrors(newErrors);
      return false;
    }

    delete newErrors.phone;
    setErrors(newErrors);
    return true;
  };

  // Validate name
  const validateName = (value) => {
    const newErrors = { ...errors };
    
    if (!value.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
      newErrors.name = 'Name can only contain letters';
    } else {
      delete newErrors.name;
    }
    
    setErrors(newErrors);
  };

  // Validate address fields
  const validateAddressField = (field, value) => {
    const newErrors = { ...errors };
    
    if (!value.trim()) {
      newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      delete newErrors[field];
    }
    
    setErrors(newErrors);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setShowPhoneDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- PROFILE SUBMIT ----------
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    validateName(profileForm.name);
    
    if (profileForm.phone && profileForm.phone.trim()) {
      if (!validatePhone(profileForm.phone, profileForm.phoneCountry)) {
        return;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      alert('Please fix all errors before submitting');
      return;
    }
    
    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          id: session.user.id,
          first_name: profileForm.name,
          phone: profileForm.phone,
          country: profileForm.phoneCountry
        })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setShowProfileModal(false);
        fetchUserData();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  // ---------- ADDRESS SUBMIT ----------
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all address fields
    validateAddressField('street', addressForm.street);
    validateAddressField('city', addressForm.city);
    validateAddressField('state', addressForm.state);
    validateAddressField('zip', addressForm.zip);
    
    if (!editingAddress && addresses.length >= 2) {
      alert('Maximum 2 addresses allowed. Delete one first.');
      return;
    }

    // Validate country is selected
    if (!addressForm.country || !countries.find(c => c.name === addressForm.country)) {
      setErrors({...errors, country: 'Please select a valid country'});
      return;
    }

    if (Object.keys(errors).length > 0) {
      alert('Please fix all errors before submitting');
      return;
    }

    try {
      const method = editingAddress ? 'PUT' : 'POST';
      const body = {
        type: 'addresses',
        id: session.user.id,
        ...addressForm
      };

      if (editingAddress) {
        body.addressId = editingAddress.id;
      }

      const response = await fetch('/api/register', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(editingAddress ? 'Address updated!' : 'Address added!');
        closeAddressModal();
        fetchUserData();
      } else {
        alert('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address');
    }
  };

  const deleteAddress = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    
    try {
      const response = await fetch('/api/register', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'addresses',
      id: session.user.id,
          addressId
        })
      });

      if (response.ok) {
        fetchUserData();
      } else {
        alert('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Error deleting address');
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'addresses',
          id: session.user.id,
          addressId,
          isDefault: true
        })
      });

      if (response.ok) {
        fetchUserData();
      } else {
        alert('Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Error setting default address');
    }
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setSearchTerm(address.country || '');
    setAddressForm({
      type: address.type || 'Home',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zip: address.zip || '',
      country: address.country || '',
      isDefault: address.is_default || false
    });
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setSearchTerm('');
    setErrors({});
    setAddressForm({ type: 'Home', street: '', city: '', state: '', zip: '', country: 'USA', isDefault: false });
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setErrors({});
    // Reset to original values
    if (session?.user?.id) fetchUserData();
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
                <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500 uppercase">Country</dt>
                  <dd className="text-base col-span-2">{profileForm.phoneCountry || 'Not provided'}</dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <dt className="text-sm font-medium text-gray-500 uppercase">Phone</dt>
                  <dd className="text-base col-span-2">
                    {profileForm.phone ? `${countries.find(c => c.name === profileForm.phoneCountry)?.code || ''} ${profileForm.phone}` : 'Not provided'}
                  </dd>
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
                  {addresses.map(address => (
                    <div key={address.userId} className="border border-gray-200 p-6 relative hover:border-black transition-colors">
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
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zip}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        {!address.is_default && (
                          <button onClick={() => setDefaultAddress(address.id)} className="flex-1 py-2 text-xs font-medium uppercase tracking-wide border border-gray-300 hover:border-black">
                            Set Default
                          </button>
                        )}
                        <button onClick={() => openEditAddress(address)} className="flex-1 py-2 text-xs font-medium uppercase tracking-wide border border-gray-300 hover:border-black">
                          Edit
                        </button>
                        <button onClick={() => deleteAddress(address.userId)} className="flex-1 py-2 text-xs font-medium uppercase tracking-wide border border-gray-300 hover:border-red-600 hover:text-red-600">
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
          <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-black">Edit Profile</h3>
              <button onClick={closeProfileModal} className="text-gray-400 hover:text-black"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={(e) => {
                    setProfileForm({...profileForm, name: e.target.value});
                    validateName(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" 
                  placeholder="Enter your full name"
                  required 
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Email</label>
                <input type="email" value={profileForm.email} disabled className="w-full px-4 py-3 border border-gray-300 bg-gray-50 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 relative">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Country *</label>
                  <input 
                    type="text" 
                    value={phoneSearchTerm} 
                    onChange={(e) => handlePhoneCountryInput(e.target.value)}
                    onFocus={() => setShowPhoneDropdown(true)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" 
                    placeholder="Search country"
                    required 
                  />
                  
                  {showPhoneDropdown && (
                    <ul
                      ref={phoneDropdownRef}
                      className="absolute w-full bg-white border border-gray-300 mt-1 z-20 max-h-48 overflow-auto shadow-lg"
                    >
                      {filteredPhoneCountries.length === 0 && (
                        <li className="px-4 py-2 text-gray-500">
                          No countries found
                        </li>
                      )}
                      
                      {filteredPhoneCountries.map((c) => (
                        <li
                          key={c.name}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => selectPhoneCountry(c)}
                        >
                          <span>{c.name}</span>
                          <span className="text-xs text-gray-500">{c.code}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {errors.phoneCountry && (
                    <p className="text-xs text-red-600 mt-1">{errors.phoneCountry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Phone *</label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-sm text-gray-700">
                      {countries.find((c) => c.name === profileForm.phoneCountry)?.code || '+..'}
                    </span>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/\s+/g, '');
                        setProfileForm({...profileForm, phone: cleanValue});
                        validatePhone(cleanValue, profileForm.phoneCountry);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-r-md focus:border-black focus:outline-none"
                      placeholder="Phone"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeProfileModal} className="flex-1 px-6 py-3 border border-gray-300 hover:border-black uppercase font-medium text-sm">Cancel</button>
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
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Address Type</label>
                <select value={addressForm.type} onChange={e => setAddressForm({...addressForm, type: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none">
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Street Address</label>
                <input type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">City</label>
                  <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">State</label>
                  <input type="text" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">ZIP Code</label>
                  <input type="text" value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" required />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Country</label>
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => handleCountryInput(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none" 
                    placeholder="Search country"
                    required 
                  />
                  
                  {showDropdown && (
                    <ul
                      ref={dropdownRef}
                      className="absolute w-full bg-white border border-gray-300 mt-1 z-20 max-h-48 overflow-auto shadow-lg"
                    >
                      {filteredCountries.length === 0 && (
                        <li className="px-4 py-2 text-gray-500">
                          No countries found
                        </li>
                      )}
                      
                      {filteredCountries.map((c) => (
                        <li
                          key={c.name}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => selectCountry(c)}
                        >
                          <span>{c.name}</span>
                          <span className="text-xs text-gray-500">{c.code}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {errors.country && (
                    <p className="text-xs text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>
              </div>

                <div>
                          <label className="text-sm text-gray-700">Phone *</label>
                          <div className="flex">
                            <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-sm text-gray-700">
                              {countries.find((c) => c.name === country)?.code || "+.."}
                            </span>
                            <input
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value.replace(/\s+/g, ""));
                                validatePhone(e.target.value, country);
                              }}
                              className="w-full border border-gray-300 rounded-r-md px-3 py-2"
                              placeholder="Phone"
                            />
                          </div>
              
                          {errors.phone && (
                            <p className="text-xs text-red-600">{errors.phone}</p>
                          )}
                        </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                <label className="text-sm text-gray-600">Set as default address</label>
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