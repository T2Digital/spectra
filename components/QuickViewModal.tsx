import React, { useContext } from 'react';
import type { Product } from '../types';
import { X } from './icons';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

interface QuickViewModalProps {
    product: Product;
    onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
    const { addToCart } = useContext(CartContext);
    
    const handleAddToCart = () => {
        addToCart(product);
        onClose();
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black z-10" aria-label="Close quick view">
                    <X className="w-6 h-6" />
                </button>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="aspect-square">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-l-lg"/>
                    </div>
                    <div className="p-8 flex flex-col">
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                        <p className="text-md text-gray-500">{product.brand}</p>
                        <div className="mt-4 flex items-baseline space-x-2 rtl:space-x-reverse">
                            <p className="text-2xl font-bold">{product.price.toLocaleString()} جنيه</p>
                            {product.originalPrice && <p className="text-md text-gray-400 line-through">{product.originalPrice.toLocaleString()} جنيه</p>}
                        </div>
                        <div className="my-6">
                            {/* Simplified size selection for quick view */}
                            <p className="text-sm font-semibold mb-2">مقاسات متاحة</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => <span key={size} className="text-xs border px-2 py-1 rounded">{size}</span>)}
                            </div>
                        </div>
                        <div className="mt-auto space-y-3">
                            <button onClick={handleAddToCart} className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90">
                                أضف إلى السلة
                            </button>
                            <Link to={`/product/${product.id}`} className="block w-full text-center bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200">
                                عرض التفاصيل الكاملة
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
