import React, { useContext, useState, useEffect } from 'react';
import { WishlistContext } from '../contexts/WishlistContext';
import { getProductById } from '../firebase/services';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import QuickViewModal from '../components/QuickViewModal';

const WishlistPage: React.FC = () => {
    const { wishlistItems } = useContext(WishlistContext);
    const [wishedProducts, setWishedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchWishedProducts = async () => {
            setLoading(true);
            try {
                const productPromises = wishlistItems.map(id => getProductById(id));
                const products = (await Promise.all(productPromises)).filter(p => p !== null) as Product[];
                setWishedProducts(products);
            } catch (error) {
                console.error("Failed to fetch wishlist products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (wishlistItems.length > 0) {
            fetchWishedProducts();
        } else {
            setWishedProducts([]);
            setLoading(false);
        }
    }, [wishlistItems]);

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">قائمة الرغبات</h1>
                    <p className="mt-2 text-lg text-gray-600">منتجاتك المفضلة في مكان واحد.</p>
                </div>
                {loading ? (
                    <div className="text-center py-20"><p>جاري تحميل قائمة الرغبات...</p></div>
                ) : wishedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {wishedProducts.map(product => (
                            <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">قائمة رغباتك فارغة حالياً.</p>
                        <Link to="/products" className="mt-4 inline-block text-brand-accent hover:underline">
                            ابدأ التصفح
                        </Link>
                    </div>
                )}
            </div>
            {quickViewProduct && (
                <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
            )}
        </>
    );
};

export default WishlistPage;