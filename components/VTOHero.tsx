import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { Camera } from './icons';

interface VTOHeroProps {
    products: Product[];
}

const VTOHero: React.FC<VTOHeroProps> = ({ products }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const modelRef = useRef<any | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameraLoading, setCameraLoading] = useState(false);
    
    const [modelLoading, setModelLoading] = useState(true);
    const [modelReady, setModelReady] = useState(false);
    const [modelLoadError, setModelLoadError] = useState<string | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
    const glassesImgRef = useRef<HTMLImageElement>(new Image());

    const loadModel = useCallback(async () => {
        setModelLoading(true);
        setModelLoadError(null);
        setModelReady(false);
        try {
            // Wait for the main library to be available on the window object
            await new Promise<void>((resolve, reject) => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    if ((window as any).faceLandmarksDetection) {
                        clearInterval(interval);
                        resolve();
                    } else if (Date.now() - startTime > 15000) { // 15 second timeout
                        clearInterval(interval);
                        reject(new Error("VTO scripts did not load in time."));
                    }
                }, 300);
            });

            const faceDetectionLib = (window as any).faceLandmarksDetection;
            const model = faceDetectionLib.SupportedModels.MediaPipeFaceMesh;
            const detectorConfig = {
                runtime: 'mediapipe',
                solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
                maxFaces: 1,
            };
            const detector = await faceDetectionLib.createDetector(model, detectorConfig);
            modelRef.current = detector;
            setModelReady(true);
        } catch (err: any) {
            console.error("Failed to load VTO model:", err);
            setModelLoadError(`فشل تحميل نموذج التجربة الافتراضية. ${err.message}`);
        } finally {
            setModelLoading(false);
        }
    }, []);


    useEffect(() => {
        loadModel();
    }, [loadModel]);

    useEffect(() => {
        if (selectedProduct) {
            glassesImgRef.current.src = selectedProduct.images[0];
            glassesImgRef.current.crossOrigin = "anonymous";
        }
    }, [selectedProduct]);

    const startCamera = async () => {
        if (!modelReady) {
            setCameraError("نموذج التجربة الافتراضية ليس جاهزًا بعد.");
            return;
        }
        setCameraLoading(true);
        setCameraError(null);
    
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            const video = videoRef.current;
    
            if (video) {
                video.srcObject = stream;
                streamRef.current = stream;
    
                video.onloadedmetadata = () => {
                    video.play().catch(playError => {
                        console.error("Error attempting to play video:", playError);
                        setCameraError("حدث خطأ أثناء محاولة تشغيل بث الكاميرا.");
                    });
                    setCameraActive(true);
                };
            }
        } catch (err) {
            console.error("Error accessing camera: ", err);
            setCameraError("لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات وإعادة المحاولة.");
        } finally {
            setCameraLoading(false);
        }
    };
    

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const detectFace = useCallback(async () => {
        if (!cameraActive || !modelRef.current || !videoRef.current || !canvasRef.current || !selectedProduct) {
             if(cameraActive) requestAnimationFrame(detectFace);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const model = modelRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState < 2) {
             requestAnimationFrame(detectFace);
             return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const predictions = await model.estimateFaces(video);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
            const keypoints = predictions[0].keypoints;
            
            const leftEyeKp = keypoints.find(p => p.name === 'leftEye');
            const rightEyeKp = keypoints.find(p => p.name === 'rightEye');

            if (!leftEyeKp || !rightEyeKp) {
                requestAnimationFrame(detectFace);
                return;
            }

            // Manually mirror the coordinates because the canvas is NOT mirrored via CSS
            // This ensures the glasses align with the mirrored video feed the user sees.
            const mirroredLeftEye = { x: canvas.width - leftEyeKp.x, y: leftEyeKp.y };
            const mirroredRightEye = { x: canvas.width - rightEyeKp.x, y: rightEyeKp.y };

            // The eyes are now swapped from the user's perspective. The model's "left eye" is on the right side of the screen.
            const eyeMidpoint = {
                x: (mirroredLeftEye.x + mirroredRightEye.x) / 2,
                y: (mirroredLeftEye.y + mirroredRightEye.y) / 2
            };

            const eyeDist = Math.sqrt(Math.pow(mirroredRightEye.x - mirroredLeftEye.x, 2) + Math.pow(mirroredRightEye.y - mirroredLeftEye.y, 2));
            const glassesWidth = eyeDist * 2.2; 
            const glassesHeight = (glassesWidth / glassesImgRef.current.width) * glassesImgRef.current.height;

            // Calculate the angle based on the mirrored points, which correctly inverts the rotation.
            const angle = Math.atan2(mirroredRightEye.y - mirroredLeftEye.y, mirroredRightEye.x - mirroredLeftEye.x);
            
            ctx.save();
            ctx.translate(eyeMidpoint.x, eyeMidpoint.y);
            ctx.rotate(angle);
            
            // Draw the image normally, without any flipping.
            ctx.drawImage(
                glassesImgRef.current,
                -glassesWidth / 2,
                -glassesHeight / 2,
                glassesWidth,
                glassesHeight
            );
            ctx.restore();
        }

        requestAnimationFrame(detectFace);
    }, [cameraActive, selectedProduct]);

    useEffect(() => {
        let animationFrameId: number;
        if (cameraActive) {
           animationFrameId = requestAnimationFrame(detectFace);
        }
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        }
    }, [cameraActive, detectFace]);

     const renderVTOButton = () => {
        const buttonClasses = "mt-8 inline-flex items-center gap-2 bg-brand-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-wait";

        if (modelLoading) {
            return <button disabled className={buttonClasses}><span>جاري تحضير التجربة...</span></button>;
        }
        if (modelLoadError) {
            return (
                <div className="mt-8">
                    <p className="text-red-500 mb-2">{modelLoadError}</p>
                    <button onClick={loadModel} className="bg-brand-accent text-brand-primary py-2 px-6 rounded-lg font-semibold">
                        إعادة المحاولة
                    </button>
                </div>
            );
        }
        if (modelReady) {
            return (
                 <button onClick={startCamera} disabled={cameraLoading} className={buttonClasses}>
                    <Camera className="w-5 h-5"/>
                    <span>{cameraLoading ? 'جاري فتح الكاميرا...' : 'ابدأ التجربة الآن'}</span>
                </button>
            );
        }
        return null; // Should not be reached
    };


    return (
        <div className="bg-brand-secondary">
            <div className="container mx-auto grid lg:grid-cols-2 items-center gap-8 py-12 px-4">
                <div className="text-center lg:text-right">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-brand-primary leading-tight">
                        جرّبها قبل شرائها
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        استخدم كاميرا جهازك لتجربة أحدث موديلات النظارات مباشرة على وجهك.
                    </p>
                    
                    {!cameraActive ? renderVTOButton() : (
                        <button onClick={stopCamera} className="mt-8 inline-flex items-center gap-2 bg-red-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-red-700 transition-opacity">
                            <span>إيقاف الكاميرا</span>
                        </button>
                    )}
                    {cameraError && <p className="text-red-500 mt-4">{cameraError}</p>}
                </div>

                <div className="relative w-full aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                    {!cameraActive && (
                        <div className="text-center text-gray-500">
                            <Camera className="w-16 h-16 mx-auto"/>
                            <p className="mt-2 font-semibold">الكاميرا في انتظارك</p>
                        </div>
                    )}
                    <video ref={videoRef} playsInline muted className={`w-full h-full object-cover transform scale-x-[-1] ${!cameraActive ? 'hidden' : ''}`}></video>
                    <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${!cameraActive ? 'hidden' : ''}`}></canvas>
                </div>
            </div>
            {cameraActive && (
                 <div className="py-4 bg-white/50 backdrop-blur-sm">
                    <p className="text-center font-semibold mb-3">اختر موديل لتجربته</p>
                    <div className="container mx-auto flex justify-center items-center gap-3 overflow-x-auto pb-2">
                        {products.map(p => (
                            <button key={p.id} onClick={() => setSelectedProduct(p)} className={`w-20 h-20 rounded-md overflow-hidden border-4 shrink-0 transition-all ${selectedProduct?.id === p.id ? 'border-brand-accent' : 'border-transparent hover:border-gray-400'}`}>
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VTOHero;