import React, { createContext, useState, ReactNode, useMemo, useContext, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '../types';
import { AuthContext } from './AuthContext';
import { getUserCart, updateUserCart } from '../firebase/services';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    toggleCart: () => void;
    closeCart: () => void;
    loading: boolean;
}

export const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const getLocalCart = (): CartItem[] => {
        try {
            const items = window.localStorage.getItem('cart');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const setLocalCart = (items: CartItem[]) => {
        try {
            window.localStorage.setItem('cart', JSON.stringify(items));
        } catch (error) {
            console.error(error);
        }
    };

    const clearLocalCart = () => {
        window.localStorage.removeItem('cart');
    };

    // Effect to handle user login/logout and sync cart
    useEffect(() => {
        const syncCart = async () => {
            setLoading(true);
            if (user) {
                // User is logged in
                const remoteCart = await getUserCart(user.uid);
                const localCart = getLocalCart();
                
                if (localCart.length > 0) {
                    // Merge local and remote carts
                    const mergedCart = [...remoteCart];
                    localCart.forEach(localItem => {
                        const existingItem = mergedCart.find(item => item.id === localItem.id);
                        if (existingItem) {
                            existingItem.quantity += localItem.quantity;
                        } else {
                            mergedCart.push(localItem);
                        }
                    });
                    
                    setCartItems(mergedCart);
                    await updateUserCart(user.uid, mergedCart);
                    clearLocalCart();
                } else {
                    setCartItems(remoteCart);
                }
            } else {
                // User is logged out, use local storage
                setCartItems(getLocalCart());
            }
            setLoading(false);
        };

        syncCart();
    }, [user]);

    const toggleCart = () => setIsCartOpen(!isCartOpen);
    const closeCart = () => setIsCartOpen(false);
    
    const updateCart = useCallback(async (newCart: CartItem[]) => {
      setCartItems(newCart);
      if (user) {
        await updateUserCart(user.uid, newCart);
      } else {
        setLocalCart(newCart);
      }
    }, [user]);

    const addToCart = useCallback((product: Product) => {
        const newCart = [...cartItems];
        const existingItem = newCart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            newCart.push({ ...product, quantity: 1 });
        }
        updateCart(newCart);
        setIsCartOpen(true);
    }, [cartItems, updateCart]);

    const removeFromCart = useCallback((productId: string) => {
        const newCart = cartItems.filter(item => item.id !== productId);
        updateCart(newCart);
    }, [cartItems, updateCart]);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const newCart = cartItems.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
        updateCart(newCart);
    }, [cartItems, removeFromCart, updateCart]);

    const clearCart = useCallback(() => {
        updateCart([]);
    }, [updateCart]);

    const contextValue = useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        closeCart,
        loading
    }), [cartItems, isCartOpen, loading, addToCart, removeFromCart, updateQuantity, clearCart]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
