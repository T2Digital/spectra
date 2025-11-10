import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { createUserDocument } from '../firebase/services';
import type { AuthUser } from '../types';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                const { uid, email, displayName } = firebaseUser;
                // Ensure user document exists in Firestore on login to prevent update errors.
                await createUserDocument({ uid, email, displayName }, {}); 
                
                // Fetch the full user document to get all data, like createdAt
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({
                        uid,
                        email: userData.email,
                        displayName: userData.displayName,
                        createdAt: userData.createdAt,
                    });
                } else {
                    // This case is a fallback and should ideally not be reached
                    setUser({ uid, email, displayName });
                }

            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const contextValue = useMemo(() => ({
        user,
        loading,
        logout
    }), [user, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};