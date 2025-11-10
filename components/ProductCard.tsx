import React, { useContext, useState } from 'react';
import type { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../contexts/WishlistContext';
import { CartContext } from '../contexts/CartContext';
import { Heart, Eye, ShoppingCart } from './icons';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isWishlisted(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  }
  
  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="group flex flex-col h-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className={`absolute top-2 left-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={handleQuickViewClick} 
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
              aria-label="Quick View"
            >
              <Eye className="w-5 h-5 text-brand-primary" />
            </button>
          </div>
          <div className="absolute top-2 right-2">
            <button 
              onClick={handleWishlistClick} 
              className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
              aria-label="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 transition-colors ${inWishlist ? 'text-red-500 fill-current' : 'text-brand-primary'}`} />
            </button>
          </div>
        </div>
      </Link>
      <div className="mt-3 text-center md:text-right flex-grow flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800">{product.brand}</h3>
        <p className="mt-1 text-base text-gray-600 truncate flex-grow"><Link to={`/product/${product.id}`}>{product.name}</Link></p>
        <div className="mt-2 flex justify-center md:justify-end items-baseline space-x-2 rtl:space-x-reverse">
          <p className="text-lg font-bold text-brand-primary">{product.price.toLocaleString()} جنيه</p>
          {product.originalPrice && (
            <p className="text-sm text-gray-400 line-through">{product.originalPrice.toLocaleString()} جنيه</p>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center md:text-right mt-1">
            أو {product.installmentStartPrice.toLocaleString()} جنيه/شهريًا
        </p>
      </div>
      <div className="mt-3 space-y-2">
        <button onClick={handleAddToCart} className="w-full text-center bg-brand-accent/20 text-brand-primary py-2.5 rounded-lg font-bold text-sm hover:bg-brand-accent/30 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4"/>
            أضف إلى السلة
        </button>
        <button onClick={handleBuyNow} className="w-full bg-brand-primary text-white py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-opacity">
            شراء الآن
        </button>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);