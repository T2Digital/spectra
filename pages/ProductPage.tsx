import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCarousel from '../components/ProductCarousel';
import PaymentOptions from '../components/PaymentOptions';
import ProductReviews from '../components/ProductReviews';
import RelatedProducts from '../components/RelatedProducts';
import { ArrowLeft, Heart } from '../components/icons';
import { CartContext } from '../contexts/CartContext';
import { WishlistContext } from '../contexts/WishlistContext';
import { getProductById } from '../firebase/services';
import type { Product } from '../types';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const { addToCart } = useContext(CartContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
        if (fetchedProduct?.sizes?.[0]) {
          setSelectedSize(fetchedProduct.sizes[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">جاري تحميل المنتج...</div>;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
        <Link to="/" className="text-brand-accent hover:underline">العودة إلى الصفحة الرئيسية</Link>
      </div>
    );
  }
  
  const inWishlist = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/products" className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary">
            <ArrowLeft className="w-4 h-4" />
            <span>العودة إلى كل المنتجات</span>
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <ProductCarousel images={product.images} />
        
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-brand-accent uppercase">{product.brand}</p>
              <h1 className="text-3xl lg:text-4xl font-extrabold my-2">{product.name}</h1>
            </div>
            <button onClick={() => toggleWishlist(product.id)} className="p-2" aria-label="Add to wishlist">
                <Heart className={`w-7 h-7 transition-colors ${inWishlist ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </div>
          
          <div className="mt-4 flex items-baseline space-x-2 rtl:space-x-reverse">
            <p className="text-3xl font-bold text-brand-primary">{product.price.toLocaleString()} جنيه</p>
            {product.originalPrice && (
              <p className="text-lg text-gray-400 line-through">{product.originalPrice.toLocaleString()} جنيه</p>
            )}
          </div>

          <PaymentOptions price={product.installmentStartPrice} />

          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-800 mb-3">المقاس</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSize === size ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button 
                onClick={handleAddToCart}
                className="w-full bg-brand-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-opacity"
            >
              أضف إلى السلة
            </button>
            <Link to={`/try-on/${product.id}`} className="w-full text-center bg-brand-accent/20 text-brand-primary py-4 rounded-lg font-bold text-lg hover:bg-brand-accent/30 transition-colors">
              جرّب النظارة افتراضيًا
            </Link>
          </div>
          
          <div className="mt-8 text-gray-600 space-y-4 border-t pt-6">
              <p><span className="font-semibold">النوع:</span> {product.subCategory}</p>
              <p><span className="font-semibold">الشكل:</span> {product.shape}</p>
              <p><span className="font-semibold">اللون:</span> {product.color}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <ProductReviews reviews={product.reviews} />
      </div>

      <div className="mt-16">
        <RelatedProducts currentProductId={product.id} />
      </div>
    </div>
  );
};

export default ProductPage;