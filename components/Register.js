"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  countries,
  phoneNumberPatterns,
  countryCurrencyMap,
} from "../lib/constants"; 

export default function Register({ endpoint = "/api/auth/register" }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef(null);

  const validateFirstName = (value) => {
    const newErrors = { ...errors };

    if (!value.trim()) newErrors.firstName = "Required";
    else if (!/^[a-zA-Z\s]+$/.test(value.trim()))
      newErrors.firstName = "Letters only";
    else delete newErrors.firstName;

    setErrors(newErrors);
  };

  const validateEmail = (value) => {
    const newErrors = { ...errors };

    if (!value.trim()) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      newErrors.email = "Invalid email";
    else delete newErrors.email;

    setErrors(newErrors);
  };

  const validatePassword = (value) => {
    const newErrors = { ...errors };

    if (!value) newErrors.password = "Required";
    else if (value.length < 8) newErrors.password = "Min 8 characters";
    else delete newErrors.password;

    setErrors(newErrors);
  };

  const validateConfirmPassword = (value) => {
    const newErrors = { ...errors };

    if (!value) newErrors.passwordConfirm = "Required";
    else if (value !== password) newErrors.passwordConfirm = "Passwords don't match";
    else delete newErrors.passwordConfirm;

    setErrors(newErrors);
  };

  const validatePhone = (value, selectedCountry) => {
    const newErrors = { ...errors };

    const regex = phoneNumberPatterns[selectedCountry] || /^[0-9]+$/;

    if (!value) {
      newErrors.phone = "Required";
    } else if (!regex.test(value)) {
      newErrors.phone = `Invalid phone for ${selectedCountry}`;
    } else delete newErrors.phone;

    setErrors(newErrors);
  };



  const filterCountries = (term) => {
    const t = term.toLowerCase();

    const starts = countries.filter((c) =>
      c.name.toLowerCase().startsWith(t)
    );

    const contains = countries.filter(
      (c) =>
        !c.name.toLowerCase().startsWith(t) &&
        c.name.toLowerCase().includes(t)
    );

    const combined = [...starts, ...contains];

    const codeMatches = countries.filter((c) =>
      c.code.replace("+", "").includes(t.replace("+", ""))
    );

    codeMatches.forEach((c) => {
      if (!combined.some((x) => x.name === c.name)) combined.push(c);
    });

    setFilteredCountries(combined);
  };

  const selectCountry = (c) => {
    setCountry(c.name);
    setSearchTerm(c.name);
    setCurrency(countryCurrencyMap[c.name] || "");
    setShowDropdown(false);

    const newErrors = { ...errors };
    delete newErrors.country;
    delete newErrors.phone;
    setErrors(newErrors);
  };

  const handleCountryInput = (value) => {
    setSearchTerm(value);
    setCountry(value);

    filterCountries(value);
    setShowDropdown(true);
    const newErrors = { ...errors };
    if (!countries.some((c) => c.name.toLowerCase() === value.toLowerCase()))
      newErrors.country = "Invalid country";
    else delete newErrors.country;

    setErrors(newErrors);
  };

  const validateForm = () => {
    const missing = Object.keys(errors).length > 0;

    if (missing) {
      toast.error("Please fix all errors");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    const payload = {
      firstName,
      email,
      country,
      phone,
      password,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      if (String(data.message).includes("already")) {
        setShowRedirectModal(true);
      }
      toast.error(data.message || "Error");
      setIsProcessing(false);
      return;
    }

    toast.success("Account created");
    window.location.href = "/admin/dashboard";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow border border-gray-200 rounded-xl">
      <h2 className="text-2xl font-semibold text-black mb-6">Register</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm text-gray-700">First Name *</label>
          <input
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              validateFirstName(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-700">Email *</label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email}</p>
          )}
        </div>


        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 relative">
            <label className="text-sm text-gray-700">Country *</label>

            <input
              value={searchTerm}
              onChange={(e) => handleCountryInput(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Search country"
            />

            {showDropdown && (
              <ul
                ref={dropdownRef}
                className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 z-20 max-h-48 overflow-auto"
              >
                {filteredCountries.length === 0 && (
                  <li className="px-3 py-2 text-gray-500">
                    No countries found
                  </li>
                )}

                {filteredCountries.map((c) => (
                  <li
                    key={c.name}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    onClick={() => selectCountry(c)}
                  >
                    {c.name}
                    <span className="text-xs text-gray-500">{c.code}</span>
                  </li>
                ))}
              </ul>
            )}

            {errors.country && (
              <p className="text-xs text-red-600">{errors.country}</p>
            )}
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
        </div>
        <div>
          <label className="text-sm text-gray-700">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Create password"
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password}</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-700">Confirm Password *</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Confirm password"
          />
          {errors.passwordConfirm && (
            <p className="text-xs text-red-600">{errors.passwordConfirm}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Create Account"}
        </button>
      </form>

      <ToastContainer position="bottom-right" />

      {showRedirectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
            <h3 className="text-black font-semibold text-lg">
              Email Already Exists
            </h3>
            <p className="text-gray-700 text-sm mt-2">
              This email is already registered. Go to login page?
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setShowRedirectModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-md"
                onClick={() => (window.location.href = "/login")}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
