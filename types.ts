import { Timestamp } from 'firebase/firestore';
// FIX: Use an inline `type` qualifier for `FunctionDeclaration`
// to allow `GeminiType` (an enum) to be imported as a value.
import { type FunctionDeclaration, Type as GeminiType } from '@google/genai';

export const Type = GeminiType;
export type { FunctionDeclaration };

export interface Review {
  id: string; 
  author: string;
  rating: number; 
  comment: string;
  date: string;
}

export interface Product {
  id: string; 
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: 'نظارات' | 'عدسات لاصقة' | 'اكسسوارات';
  subCategory: string;
  gender?: 'رجالي' | 'حريمي' | 'أطفالي';
  shape?: string; 
  color: string;
  sizes: string[];
  installmentStartPrice: number;
  stock: number; 
  reviews: Review[];
}

export interface FilterOption {
  id: string;
  label: string;
  options: string[];
}

export interface CartItem extends Product {
    quantity: number;
}

export interface FilterOptionsData {
  brands: string[];
  subCategories: string[];
  shapes: string[];
  colors: string[];
  genders: string[];
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt?: Timestamp;
}

export type OrderStatus = 'جديد' | 'قيد التنفيذ' | 'تم الشحن' | 'مكتمل' | 'ملغي';

export interface Order {
  id: string;
  userId: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string; // This will now be the governorate
    governorate: string;
  };
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingCompany: string;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: Timestamp;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    expiryDate: Timestamp;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface Notification {
    id: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: Timestamp;
}

export interface ShippingCompany {
    id: string;
    name: string;
    prices: { [governorate: string]: number };
}

export interface ShippingSettings {
    companies: ShippingCompany[];
}