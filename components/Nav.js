'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {  ShoppingCart } from 'lucide-react';

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    
    // Use useSession hook for real-time reactivity
    const { data: session, status } = useSession();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setDropdownOpen(false);
        
        await signOut({ 
            redirect: false,
            callbackUrl: '/login'
        });
        
        // Clear cookies and storage
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        sessionStorage.clear();
        
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="text-3xl font-bold tracking-wider hover:text-gray-300 transition">
                        FASHIO
                    </Link>

                    {/* Center Navigation Links */}
                    <div className="hidden md:flex items-center space-x-12">
                        <Link
                            href="/men"
                            className="text-base font-light tracking-wide hover:text-gray-100 hover:scale-110 transition uppercase"
                        >
                            Men
                        </Link>
                        <Link
                            href="/women"
                            className="text-base font-light tracking-wide hover:text-gray-100 hover:scale-110 transition uppercase"
                        >
                            Women
                        </Link>
                        <Link
                            href="/kids"
                            className="text-base font-light tracking-wide hover:text-gray-100 hover:scale-110 transition uppercase"
                        >
                            Kids
                        </Link>
                    </div>

                    {/* Right Side - Cart, Login, Register OR User Dropdown */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/cart"
                            className="text-base font-light tracking-wide hover:text-gray-100 hover:scale-110 transition"
                        >
                           <ShoppingCart size={22} />
                        </Link>
                        
                        {status === 'loading' ? (
                            <div className="text-base font-light tracking-wide animate-pulse">
                                Loading...
                            </div>
                        ) : session?.user ? (
                            // Logged in user dropdown
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 text-base font-light tracking-wide hover:text-gray-100 transition"
                                >
                                    <span>Hi, {session.user.name || session.user.email}</span>
                                    <svg 
                                        className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 z-50">
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 transition"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 transition"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100 transition"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Orders
                                        </Link>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition text-red-600"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Guest user menu
                            <>
                                <Link
                                    href="/login"
                                    className="text-base font-light tracking-wide hover:text-gray-100 hover:scale-110 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="border border-white px-6 py-2 text-sm font-light tracking-wider hover:scale-110 hover:bg-white hover:text-black transition uppercase"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden focus:outline-none"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-6 space-y-4">
                        <Link
                            href="/men"
                            className="block text-base font-light tracking-wide hover:text-gray-300 transition uppercase"
                            onClick={() => setIsOpen(false)}
                        >
                            Men
                        </Link>
                        <Link
                            href="/women"
                            className="block text-base font-light tracking-wide hover:text-gray-300 transition uppercase"
                            onClick={() => setIsOpen(false)}
                        >
                            Women
                        </Link>
                        <Link
                            href="/kids"
                            className="block text-base font-light tracking-wide hover:text-gray-300 transition uppercase"
                            onClick={() => setIsOpen(false)}
                        >
                            Kids
                        </Link>
                        <div className="border-t border-gray-700 pt-4 space-y-4">
                            <Link
                                href="/cart"
                                className="block text-base font-light tracking-wide hover:text-gray-300 transition"
                                onClick={() => setIsOpen(false)}
                            >
                                Cart (0)
                            </Link>
                            
                            {status === 'loading' ? (
                                <div className="block text-base font-light tracking-wide text-gray-300 animate-pulse">
                                    Loading...
                                </div>
                            ) : session?.user ? (
                                // Mobile logged in menu
                                <>
                                    <div className="block text-base font-light tracking-wide text-gray-300">
                                        Hi, {session.user.name || session.user.email}
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="block text-base font-light tracking-wide hover:text-gray-300 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block text-base font-light tracking-wide hover:text-gray-300 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/orders"
                                        className="block text-base font-light tracking-wide hover:text-gray-300 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Orders
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            handleLogout();
                                        }}
                                        className="block w-full border border-white px-6 py-2 text-sm font-light tracking-wider hover:bg-white hover:text-black transition uppercase text-center"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                // Mobile guest menu
                                <>
                                    <Link
                                        href="/login"
                                        className="block text-base font-light tracking-wide hover:text-gray-300 transition"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block border border-white px-6 py-2 text-sm font-light tracking-wider hover:bg-white hover:text-black transition uppercase text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}