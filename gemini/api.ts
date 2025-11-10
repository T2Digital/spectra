import { GoogleGenAI } from "@google/genai";
import { type ChatSession } from "@google/genai";
import type { ChatMessage, Product, CartItem, FunctionDeclaration } from '../types';
import { Type } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatSession: ChatSession | null = null;

interface AIResult {
    recommendationText: string;
    productNames: string[];
}

export const getStyleSuggestion = async (answers: string[], allProducts: Product[]): Promise<AIResult> => {
    if (!process.env.API_KEY) {
        return { 
            recommendationText: "ميزة المستشار الذكي غير متاحة حاليًا.",
            productNames: []
        };
    }

    const model = 'gemini-2.5-flash';
    const [faceShape, style, frameColor] = answers;

    const glassesProducts = allProducts.filter(p => p.category === 'نظارات');
    const productListText = glassesProducts.map(p => `- ${p.name} (ماركة: ${p.brand}, شكل: ${p.shape || 'غير محدد'})`).join('\n');

    const prompt = `أنت خبير أزياء ومستشار متخصص في متجر نظارات فاخر اسمه "Spectra". 
    مهمتك هي تقديم توصية ودية ومفصلة بناءً على اختيارات العميل وقائمة المنتجات المتاحة، وإرجاع الرد على هيئة JSON.
    
    اختيارات العميل:
    - شكل الوجه: ${faceShape}
    - الأسلوب المفضل: ${style}
    - لون الإطار المفضل: ${frameColor}

    المنتجات المتاحة في المتجر:
    ${productListText}

    التعليمات:
    1. بناءً على اختيارات العميل، اختر 2 أو 3 منتجات **بالاسم الدقيق** من القائمة أعلاه.
    2. اكتب نص توصية ودود باللهجة المصرية تشرح فيه سبب اختيارك للمنتجات.
    3. يجب أن تكون إجابتك على هيئة JSON object فقط لا غير، بدون أي نص إضافي قبله أو بعده، ويحتوي على مفتاحين:
       - "recommendationText": (string) يحتوي على نص التوصية.
       - "productNames": (array of strings) يحتوي على أسماء المنتجات المقترحة بالضبط كما هي في القائمة.
    
    مثال للرد المطلوب:
    {
      "recommendationText": "يا أهلاً بيك! بناءً على اختياراتك، دي الترشيحات اللي ممكن تعجبك جدًا:",
      "productNames": ["Ray-Ban Aviator Classic", "Oakley Holbrook"]
    }`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // It is recommended to check the response text before parsing.
        const jsonText = response.text.trim();
        if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
             return JSON.parse(jsonText);
        } else {
             console.error("Received non-JSON response from Gemini:", jsonText);
             throw new Error("Invalid response format from AI stylist.");
        }
       
    } catch (error) {
        console.error("Error getting style suggestion from Gemini:", error);
        throw new Error("Failed to communicate with the AI stylist.");
    }
};

interface ToolFunctions {
    allProducts: Product[];
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    navigate: (path: string) => void;
}

const findProducts = (args: { query: string }, tools: ToolFunctions): Product[] => {
    const { query } = args;
    if (!query) return [];
    return tools.allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())
    );
};

const addProductToCart = (args: { productName: string }, tools: ToolFunctions): string => {
    const { productName } = args;
    const productToAdd = tools.allProducts.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (productToAdd) {
        tools.addToCart(productToAdd);
        return `تمام، ضفت "${productName}" للسلة بتاعتك. 👍`;
    }
    return `للأسف، مش لاقي منتج بالاسم ده. ممكن تتأكد من الاسم؟`;
};

const removeProductFromCart = (args: { productName: string }, tools: ToolFunctions): string => {
    const { productName } = args;
    const productToRemove = tools.cartItems.find(p => p.name.toLowerCase() === productName.toLowerCase());
    if (productToRemove) {
        tools.removeFromCart(productToRemove.id);
        return `خلاص، شيلت "${productName}" من السلة.`;
    }
    return `المنتج ده مش موجود في السلة أصلًا.`;
};

const viewCart = (args: any, tools: ToolFunctions): string => {
    if (tools.cartItems.length === 0) {
        return "السلة بتاعتك فاضية دلوقتي.";
    }
    const cartDetails = tools.cartItems.map(item => `${item.name} (الكمية: ${item.quantity})`).join('\n');
    return `محتويات السلة حاليًا:\n${cartDetails}`;
};

const proceedToCheckout = (args: any, tools: ToolFunctions): string => {
    if (tools.cartItems.length === 0) {
        return "السلة فاضية، لازم تضيف منتجات الأول عشان تكمل.";
    }
    tools.navigate('/checkout');
    return "تمام، يلا بينا على صفحة الدفع عشان نخلص الأوردر.";
};

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'findProducts',
        description: 'يبحث عن منتجات في كتالوج المتجر بناءً على اسم المنتج أو الماركة.',
        parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING, description: 'اسم المنتج أو الماركة للبحث عنه' } }, required: ['query'] }
    },
    {
        name: 'addProductToCart',
        description: 'يضيف منتج معين إلى سلة التسوق الخاصة بالعميل.',
        parameters: { type: Type.OBJECT, properties: { productName: { type: Type.STRING, description: 'الاسم الدقيق للمنتج المراد إضافته' } }, required: ['productName'] }
    },
    {
        name: 'removeProductFromCart',
        description: 'يزيل منتج معين من سلة التسوق الخاصة بالعميل.',
        parameters: { type: Type.OBJECT, properties: { productName: { type: Type.STRING, description: 'الاسم الدقيق للمنتج المراد إزالته' } }, required: ['productName'] }
    },
    {
        name: 'viewCart',
        description: 'يعرض للعميل المنتجات الموجودة حاليًا في سلة التسوق الخاصة به.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'proceedToCheckout',
        description: 'يوجه العميل إلى صفحة إتمام الطلب (الدفع) عندما يكون جاهزًا للشراء.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
];

const systemInstruction = {
    parts: [{text: `أنت مساعد مبيعات ذكي ومرح اسمك "سبكترا بوت" في متجر نضارات فاخر اسمه "Spectra". 
    كلم العميل دايماً بالعامية المصرية بأسلوب خدوم ومحترف ومختصر. استخدم ايموجيز مناسبة.
    مهمتك هي مساعدة العملاء في العثور على المنتجات، وإضافتها أو إزالتها من السلة، والإجابة على أسئلتهم، وتوجيههم للدفع.
    لديك القدرة على استدعاء دوال للبحث في المنتجات وإدارة السلة. استخدم هذه القدرات بفاعلية.
    لما العميل يسأل عن منتج، اعرضله النتائج وقوله لو عايز يضيف حاجة منهم للسلة.
    لا تخترع معلومات غير موجودة.`}],
};

export const chatWithSalesBot = async (history: ChatMessage[], tools: ToolFunctions): Promise<string> => {
    if (!process.env.API_KEY) return "ميزة المساعد الذكي غير متاحة حاليًا.";
    
    const model = 'gemini-2.5-flash';

    if (!chatSession) {
        chatSession = ai.chats.create({
            model: model,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations }],
            },
        });
    }

    const lastUserMessage = history[history.length - 1].parts[0].text;

    try {
        let response = await chatSession.sendMessage({ message: lastUserMessage });

        while(response.functionCalls) {
            const functionCalls = response.functionCalls;
            const toolResponseParts = [];

            for (const call of functionCalls) {
                const { name, args } = call;
                let result: any;
                switch (name) {
                    case 'findProducts':
                        result = findProducts(args as any, tools);
                        break;
                    case 'addProductToCart':
                        result = addProductToCart(args as any, tools);
                        break;
                    case 'removeProductFromCart':
                        result = removeProductFromCart(args as any, tools);
                        break;
                    case 'viewCart':
                        result = viewCart(args, tools);
                        break;
                    case 'proceedToCheckout':
                        result = proceedToCheckout(args, tools);
                        break;
                    default:
                        result = { error: `Function ${name} not found.` };
                }

                toolResponseParts.push({
                    functionResponse: {
                        name: call.name,
                        response: {
                            result: result
                        },
                    },
                });
            }
            
            // Send the function response back to the model
            response = await chatSession.sendMessage({ message: { parts: toolResponseParts } });
        }
        
        return response.text;

    } catch (error) {
        console.error("Error chatting with sales bot:", error);
        chatSession = null; // Reset session on error
        throw new Error("Failed to get response from sales bot.");
    }
};