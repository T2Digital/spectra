import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from './icons';

interface ProductCarouselProps {
  images: string[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden">
        <img 
            src={images[currentIndex]} 
            alt={`Product image ${currentIndex + 1}`}
            className="w-full h-full object-cover object-center transition-opacity duration-500"
            loading="lazy"
        />
        <div className="absolute inset-0 flex justify-between items-center px-2">
          <button onClick={prevSlide} className="bg-white/50 hover:bg-white p-2 rounded-full shadow-md transition-colors" aria-label="Previous image">
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
          <button onClick={nextSlide} className="bg-white/50 hover:bg-white p-2 rounded-full shadow-md transition-colors" aria-label="Next image">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
        </div>
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div key={index} className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-brand-primary' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
      <div className="hidden md:grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button 
            key={index} 
            onClick={() => setCurrentIndex(index)}
            className={`aspect-square rounded-md overflow-hidden border-2 ${currentIndex === index ? 'border-brand-primary' : 'border-transparent'}`}
            aria-label={`View image ${index + 1}`}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover object-center" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;