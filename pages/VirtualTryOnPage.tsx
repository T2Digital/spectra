import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../firebase/services';
import type { Product } from '../types';
import { ArrowLeft } from '../components/icons';

const VirtualTryOnPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                const fetchedProduct = await getProductById(id);
                setProduct(fetchedProduct);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        let isMounted = true;
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (isMounted) {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        streamRef.current = stream;
                    }
                } else {
                    stream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                if (isMounted) {
                    setError("لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.");
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    if (!product) {
        return <div className="text-center py-10">جاري تحميل المنتج...</div>;
    }

    return (
        <div className="bg-brand-primary min-h-screen flex flex-col items-center justify-center p-4 text-white">
            <div className="absolute top-4 right-4 z-10">
                <Link to={`/product/${id}`} className="flex items-center gap-2 text-sm bg-white/20 px-4 py-2 rounded-full hover:bg-white/30">
                    <ArrowLeft className="w-4 h-4" />
                    <span>العودة للمنتج</span>
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-2">جرّب {product.name}</h1>
            <p className="text-gray-300 mb-6">انظر كيف تبدو عليك النظارة في الوقت الفعلي.</p>

            <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-2xl">
                {error ? (
                    <div className="w-full h-full flex items-center justify-center text-center p-4">
                        <p>{error}</p>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src={product.images[0]} 
                      alt="Glasses overlay" 
                      className="w-1/2 opacity-90"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                </div>
            </div>
             <div className="mt-6 text-center text-xs text-gray-400 max-w-2xl">
                <p>هذه الميزة هي للعرض فقط. قد يختلف المظهر الفعلي.</p>
                <p>سيتم قريباً دمج تقنية الذكاء الاصطناعي لتجربة أكثر واقعية.</p>
            </div>
        </div>
    );
};

export default VirtualTryOnPage;