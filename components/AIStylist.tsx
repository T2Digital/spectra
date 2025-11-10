import React, { useState } from 'react';
import { getStyleSuggestion } from '../gemini/api';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import QuickViewModal from './QuickViewModal';

const steps = [
  {
    question: "ما هو شكل وجهك الأقرب؟",
    options: ["دائري", "مربع", "بيضاوي", "قلب"],
  },
  {
    question: "ما هو أسلوبك المفضل؟",
    options: ["كلاسيكي", "عصري", "رياضي", "جريء"],
  },
  {
    question: "ما هو اللون الذي تفضله في الإطارات؟",
    options: ["أسود", "بني", "ملون", "معدني"],
  }
];

interface AIResult {
    recommendationText: string;
    productNames: string[];
}

const AIStylist: React.FC<{ allProducts: Product[] }> = ({ allProducts }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setError(null);
      try {
        const suggestion = await getStyleSuggestion(newAnswers, allProducts);
        setResult(suggestion);
      } catch (err) {
        console.error(err);
        setError("عذرًا، حدث خطأ أثناء الاتصال بمستشارنا الذكي. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
    setLoading(false);
    setError(null);
  };
  
  const recommendedProducts = result?.productNames
      .map(name => allProducts.find(p => p.name.toLowerCase() === name.toLowerCase()))
      .filter((p): p is Product => p !== undefined) || [];

  const renderContent = () => {
      if(loading) {
          return (
              <div className="text-center p-8 min-h-[200px] flex flex-col justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                  <h3 className="text-xl font-bold mt-4">جاري تحليل اختياراتك...</h3>
                  <p className="text-gray-500 mt-2">يقوم مستشارك الذكي باختيار الأفضل لك.</p>
              </div>
          )
      }
      if(error) {
        return (
             <div className="text-center p-8 min-h-[200px] flex flex-col justify-center">
                <h3 className="text-xl font-bold text-red-500">حدث خطأ</h3>
                <p className="text-gray-500 mt-2 mb-4">{error}</p>
                <button onClick={handleReset} className="mt-4 bg-brand-primary text-white py-2 px-6 rounded-lg font-semibold self-center">
                    حاول مرة أخرى
                </button>
            </div>
        )
      }
      if(result) {
          return (
              <div className="p-8">
                  <h3 className="text-xl font-bold text-center">✨ اقتراحنا لك! ✨</h3>
                  <p className="text-gray-700 mt-2 mb-6 text-center whitespace-pre-wrap">{result.recommendationText}</p>
                  
                  {recommendedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {recommendedProducts.map(product => (
                            <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                        ))}
                    </div>
                  ) : <p className="text-center text-gray-500">لم نتمكن من العثور على منتجات مطابقة. حاول مرة أخرى!</p>}


                  <div className="text-center">
                    <button onClick={handleReset} className="mt-6 bg-brand-primary text-white py-2 px-6 rounded-lg font-semibold">
                        البدء من جديد
                    </button>
                  </div>
              </div>
          )
      }
      return (
          <div className="p-8">
            <h3 className="text-xl font-bold text-center mb-2">{steps[step].question}</h3>
            <p className="text-center text-gray-500 mb-6">الخطوة {step + 1} من {steps.length}</p>
            <div className="grid grid-cols-2 gap-4">
                {steps[step].options.map(option => (
                    <button 
                        key={option} 
                        onClick={() => handleAnswer(option)}
                        className="p-4 border-2 border-gray-200 rounded-lg text-center font-semibold hover:border-brand-accent hover:bg-brand-accent/10 transition-colors"
                    >
                        {option}
                    </button>
                ))}
            </div>
          </div>
      )
  }

  return (
    <>
        <div className="bg-gray-50 rounded-lg shadow-md max-w-5xl mx-auto">
          <div className="bg-brand-primary text-white p-4 rounded-t-lg text-center">
            <h2 className="text-2xl font-extrabold">مستشارك الذكي للأناقة</h2>
          </div>
          {renderContent()}
        </div>
        {quickViewProduct && (
            <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
        )}
    </>
  );
};

export default AIStylist;