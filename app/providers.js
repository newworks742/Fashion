// 'use client';
// import { SessionProvider } from 'next-auth/react';

// export default function Providers({ children }) {
//     return (
//         <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
//             {children}
//         </SessionProvider>
//     );
// }


'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { createContext, useContext, useState, useEffect } from 'react';

// Create Cart Context
const CartContext = createContext({
    cartCount: 0,
    updateCartCount: () => {},
    refreshCartCount: () => {}
});

// Cart Provider Component
function CartProvider({ children }) {
    const { data: session, status } = useSession();
    const [cartCount, setCartCount] = useState(0);

    // Function to fetch cart count
    const fetchCartCount = async () => {
        if (status === 'authenticated' && session?.user?.id) {
            try {
                const response = await fetch('/api/cartfetch');
                const data = await response.json();
                setCartCount(data.total || 0);
            } catch (error) {
                console.error('Error fetching cart count:', error);
                setCartCount(0);
            }
        } else {
            setCartCount(0);
        }
    };

    // Fetch cart count when session changes
    useEffect(() => {
        fetchCartCount();
    }, [session, status]);

    // Function to manually update cart count
    const updateCartCount = (newCount) => {
        setCartCount(newCount);
    };

    // Function to refresh cart count from server
    const refreshCartCount = () => {
        fetchCartCount();
    };

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount, refreshCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

// Main Providers Component
export default function Providers({ children }) {
    return (
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
            <CartProvider>
                {children}
            </CartProvider>
        </SessionProvider>
    );
}

// Custom hook to use cart context
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within Providers');
    }
    return context;
}