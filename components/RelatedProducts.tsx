import React, { useState, useEffect } from 'react';
import { getProducts } from '../firebase/services';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface RelatedProductsProps {
    currentProductId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId }) => {
    const [related, setRelated] = useState<Product[]>([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const allProducts = await getProducts();
                // Simple logic: get 4 other products that are not the current one.
                const relatedProducts = allProducts.filter(p => p.id !== currentProductId).slice(0, 4);
                setRelated(relatedProducts);
            } catch (error) {
                console.error("Failed to fetch related products:", error);
            }
        };
        fetchRelated();
    }, [currentProductId]);

    if (related.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="text-2xl font-extrabold text-center mb-8">قد يعجبك أيضاً</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map(product => (
                    <ProductCard key={product.id} product={product} onQuickView={() => {}} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;