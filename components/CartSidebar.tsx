import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
// FIX: Import the 'ShoppingCart' icon to fix the 'Cannot find name' error.
import { X, Trash2, Plus, Minus, ShoppingCart } from './icons';

const CartSidebar: React.FC = () => {
  const { cartItems, isCartOpen, closeCart, removeFromCart, updateQuantity } = useContext(CartContext);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeCart}
        ></div>
        <div 
            className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">سلة التسوق</h2>
                    <button onClick={closeCart} aria-label="Close cart"><X className="w-6 h-6"/></button>
                </div>

                {cartItems.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-start gap-4">
                                    <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.brand}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded-md"><Minus className="w-4 h-4"/></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded-md"><Plus className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{(item.price * item.quantity).toLocaleString()} جنيه</p>
                                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 mt-2 hover:underline">إزالة</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t space-y-4">
                            <div className="flex justify-between font-semibold">
                                <span>المجموع الفرعي</span>
                                <span>{subtotal.toLocaleString()} جنيه</span>
                            </div>
                            <p className="text-xs text-gray-500">الشحن والضرائب سيتم حسابها عند الدفع.</p>
                             <Link to="/checkout" onClick={closeCart} className="block text-center w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90">
                                إتمام الطلب
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold">سلّتك فارغة</h3>
                        <p className="text-gray-500 mt-1">أضف بعض المنتجات لتبدأ.</p>
                    </div>
                )}
            </div>
        </div>
    </>
  );
};

export default CartSidebar;