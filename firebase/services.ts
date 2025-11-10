import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, setDoc, arrayUnion, arrayRemove, serverTimestamp, orderBy, query, where, Timestamp, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, auth, storage } from './config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product, FilterOptionsData, AuthUser, CartItem, Order, OrderStatus, Coupon, Notification, ShippingSettings } from '../types';

const productsCollectionRef = collection(db, 'products');
const filterOptionsDocRef = doc(db, 'settings', 'filterOptions');
const usersCollectionRef = collection(db, 'users');
const ordersCollectionRef = collection(db, 'orders');
const couponsCollectionRef = collection(db, 'coupons');
const shippingSettingsDocRef = doc(db, 'settings', 'shipping');


// --- Product Services ---
const mapDocToProduct = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        brand: data.brand,
        price: data.price,
        originalPrice: data.originalPrice,
        images: data.images,
        category: data.category,
        subCategory: data.subCategory,
        gender: data.gender,
        shape: data.shape,
        color: data.color,
        sizes: data.sizes,
        stock: data.stock || 0,
        installmentStartPrice: data.installmentStartPrice,
        reviews: data.reviews,
    };
};

export const getProducts = async (): Promise<Product[]> => {
    const data = await getDocs(productsCollectionRef);
    return data.docs.map(mapDocToProduct);
};

export const getProductById = async (id: string): Promise<Product | null> => {
    const productDoc = doc(db, 'products', id);
    const docSnap = await getDoc(productDoc);
    if (docSnap.exists()) {
        return mapDocToProduct(docSnap);
    } else {
        console.log("No such document!");
        return null;
    }
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<void> => {
    await addDoc(productsCollectionRef, productData);
};

export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id'>>): Promise<void> => {
    const productDoc = doc(db, 'products', id);
    await updateDoc(productDoc, productData);
};

export const deleteProduct = async (id: string): Promise<void> => {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
};

// --- Image Upload Service ---
export const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};

// --- Filter Options Services ---
export const getFilterOptions = async (): Promise<FilterOptionsData | null> => {
    const docSnap = await getDoc(filterOptionsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as FilterOptionsData;
    } else {
        console.log("No filter options document!");
        return null;
    }
};

export const setFilterOptions = async (options: FilterOptionsData): Promise<void> => {
    await setDoc(filterOptionsDocRef, options);
};

export const updateFilterOptions = async (options: Partial<FilterOptionsData>): Promise<void> => {
    await updateDoc(filterOptionsDocRef, options);
};


// --- Customer Auth Services ---

export const signUpUser = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        await createUserDocument(userCredential.user, { displayName });
    }
    return userCredential.user;
};

export const signInUser = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const createUserDocument = async (user: AuthUser, additionalData: object) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        const { email, displayName } = user;
        const createdAt = serverTimestamp();
        await setDoc(userDocRef, {
            displayName,
            email,
            createdAt,
            wishlist: [],
            cart: [],
            ...additionalData,
        });
    }
};

export const checkUserExists = async (email: string): Promise<boolean> => {
    const q = query(usersCollectionRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};


// --- User Wishlist Services ---

export const getUserWishlist = async (userId: string): Promise<string[]> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data()?.wishlist || [];
    }
    return [];
};

export const updateUserWishlist = async (userId: string, productId: string, add: boolean) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        wishlist: add ? arrayUnion(productId) : arrayRemove(productId),
    });
};

// --- User Cart Services ---

export const getUserCart = async (userId: string): Promise<CartItem[]> => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data()?.cart || [];
    }
    return [];
};

export const updateUserCart = async (userId: string, cart: CartItem[]) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { cart });
};


// --- Order Services ---

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
    const orderWithTimestamp = {
        ...orderData,
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(ordersCollectionRef, orderWithTimestamp);
    
    // Add initial notification for new order
    await addNotification(orderData.userId, `تم استلام طلبك رقم #${docRef.id.slice(0, 6)} بنجاح!`, `/profile`);

    return docRef.id;
};

export const getOrders = async (): Promise<Order[]> => {
    const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    return orders;
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const q = query(ordersCollectionRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
    return orders;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
    const orderDoc = doc(db, 'orders', orderId);
    const docSnap = await getDoc(orderDoc);
    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Order;
    }
    return null;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { status });
    
    // Send notification to user
    const order = await getOrderById(orderId);
    if (order) {
        await addNotification(order.userId, `تم تحديث حالة طلبك #${orderId.slice(0,6)} إلى: ${status}`, `/profile`);
    }
};

// --- User Services (Admin) ---
export const getUsers = async (): Promise<AuthUser[]> => {
    const snapshot = await getDocs(usersCollectionRef);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            createdAt: data.createdAt,
        };
    });
};

// --- Coupon Services ---

export const getCoupons = async (): Promise<Coupon[]> => {
    const snapshot = await getDocs(query(couponsCollectionRef, orderBy('expiryDate', 'desc')));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Coupon));
}

export const addCoupon = async (couponData: Omit<Coupon, 'id'>): Promise<void> => {
    await addDoc(couponsCollectionRef, couponData);
}

export const updateCoupon = async (id: string, couponData: Partial<Omit<Coupon, 'id'>>): Promise<void> => {
    const couponDoc = doc(db, 'coupons', id);
    await updateDoc(couponDoc, couponData);
}

export const deleteCoupon = async (id: string): Promise<void> => {
    const couponDoc = doc(db, 'coupons', id);
    await deleteDoc(couponDoc);
}

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
    const q = query(couponsCollectionRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const couponDoc = snapshot.docs[0];
    const coupon = { ...couponDoc.data(), id: couponDoc.id } as Coupon;
    
    // Check expiry date
    const now = Timestamp.now();
    if (coupon.expiryDate.seconds < now.seconds) {
        return null; // Coupon expired
    }
    
    return coupon;
};

// --- Dashboard Services ---

export const getDashboardStats = async () => {
    const [ordersSnapshot, usersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(query(ordersCollectionRef, orderBy('createdAt', 'desc'))),
        getDocs(usersCollectionRef),
        getDocs(productsCollectionRef),
    ]);

    const orders = ordersSnapshot.docs.map(doc => doc.data() as Omit<Order, 'id'>);
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalUsers = usersSnapshot.size;
    
    const products = productsSnapshot.docs.map(mapDocToProduct);
    const lowStockCount = products.filter(p => p.stock < 5).length;
    
    const recentOrders = ordersSnapshot.docs.slice(0, 5).map(doc => ({ ...doc.data(), id: doc.id } as Order));

    return { totalSales, totalOrders, totalUsers, lowStockCount, recentOrders };
};


// --- Notification Services ---

export const addNotification = async (userId: string, message: string, link: string): Promise<void> => {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationsRef, {
        message,
        link,
        read: false,
        createdAt: serverTimestamp(),
    });
};

export const listenToUserNotifications = (userId: string, callback: (notifications: Notification[]) => void): Unsubscribe => {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(10));
    
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Notification));
        callback(notifications);
    });
};

export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<void> => {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
};

// --- Shipping Settings Services ---

export const getShippingSettings = async (): Promise<ShippingSettings | null> => {
    const docSnap = await getDoc(shippingSettingsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as ShippingSettings;
    }
    return null;
}

export const updateShippingSettings = async (settings: ShippingSettings): Promise<void> => {
    await setDoc(shippingSettingsDocRef, settings);
}