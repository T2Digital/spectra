import React, { createContext, useState, ReactNode, useMemo, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getUserWishlist, updateUserWishlist } from '../firebase/services';

interface WishlistContextType {
    wishlistItems: string[];
    toggleWishlist: (productId: string) => Promise<void>;
    isWishlisted: (productId: string) => boolean;
    loading: boolean;
}

export const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Effect to handle user login/logout and sync wishlist
    useEffect(() => {
        const syncWishlist = async () => {
            setLoading(true);
            if (user) {
                // User is logged in
                const remoteWishlist = await getUserWishlist(user.uid);
                const localWishlist = getLocalWishlist();

                if (localWishlist.length > 0) {
                    // Merge local and remote wishlists
                    const merged = [...new Set([...localWishlist, ...remoteWishlist])];
                    setWishlistItems(merged);
                    // Update Firestore with merged list
                    for (const productId of localWishlist) {
                        await updateUserWishlist(user.uid, productId, true);
                    }
                    clearLocalWishlist();
                } else {
                    setWishlistItems(remoteWishlist);
                }
            } else {
                // User is logged out, use local storage
                setWishlistItems(getLocalWishlist());
            }
            setLoading(false);
        };

        syncWishlist();
    }, [user]);

    const getLocalWishlist = (): string[] => {
        try {
            const items = window.localStorage.getItem('wishlist');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const setLocalWishlist = (items: string[]) => {
        try {
            window.localStorage.setItem('wishlist', JSON.stringify(items));
        } catch (error) {
            console.error(error);
        }
    };
    
    const clearLocalWishlist = () => {
        window.localStorage.removeItem('wishlist');
    };

    const isWishlisted = (productId: string) => {
        return wishlistItems.includes(productId);
    };
    
    const toggleWishlist = async (productId: string) => {
        const inWishlist = isWishlisted(productId);
        const optimisticWishlist = inWishlist
            ? wishlistItems.filter(id => id !== productId)
            : [...wishlistItems, productId];
        
        setWishlistItems(optimisticWishlist);

        if (user) {
            // Update Firestore if user is logged in
            try {
                await updateUserWishlist(user.uid, productId, !inWishlist);
            } catch (error) {
                console.error("Failed to update remote wishlist", error);
                // Revert optimistic update on failure
                setWishlistItems(wishlistItems); 
            }
        } else {
            // Update local storage if user is a guest
            setLocalWishlist(optimisticWishlist);
        }
    };

    const contextValue = useMemo(() => ({
        wishlistItems,
        toggleWishlist,
        isWishlisted,
        loading
    }), [wishlistItems, loading]);

    return (
        <WishlistContext.Provider value={contextValue}>
            {children}
        </WishlistContext.Provider>
    );
};