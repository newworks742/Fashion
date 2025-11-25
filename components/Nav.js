'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);

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

                    {/* Right Side - Cart, Login, Register */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/cart"
                            className="text-base font-light tracking-widehover:text-gray-100 hover:scale-110 transition"
                        >
                            Cart (0)
                        </Link>
                        <Link
                            href="/login"
                            className="text-base font-light tracking-wide hover:text-gray-100 hover:scale-110 transition"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="border border-white px-6 py-2 text-sm font-light tracking-wider  hover:scale-110 hover:bg-white hover:text-black transition uppercase"
                        >
                            Register
                        </Link>
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
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}