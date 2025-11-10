import React from 'react';
import type { Review } from '../types';
import { Star } from './icons';

interface ProductReviewsProps {
    reviews: Review[];
}

const StarRating: React.FC<{rating: number}> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
        ))}
    </div>
);


const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
    if (reviews.length === 0) {
        return (
             <div className="text-center py-10 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold">لا توجد مراجعات بعد</h3>
                <p className="text-gray-600 mt-2">كن أول من يراجع هذا المنتج!</p>
            </div>
        )
    }

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    return (
        <div>
            <h2 className="text-2xl font-extrabold mb-6">مراجعات العملاء</h2>
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                    <StarRating rating={averageRating} />
                    <p className="text-sm text-gray-600">بناءً على {reviews.length} مراجعة</p>
                </div>
            </div>
            <div className="space-y-6">
                {reviews.map(review => (
                    <div key={review.id} className="pb-6 border-b">
                        <div className="flex items-center mb-2">
                           <StarRating rating={review.rating} />
                           <span className="mr-auto text-sm text-gray-500">{new Date(review.date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <h4 className="font-semibold">{review.author}</h4>
                        <p className="text-gray-700 mt-1">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductReviews;
