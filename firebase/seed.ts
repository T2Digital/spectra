import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';
import { mockProducts, filterOptions } from '../data/mock';
import { setFilterOptions } from './services';

export const seedDatabase = async () => {
    if (!window.confirm("هل أنت متأكد من رغبتك في تعبئة قاعدة البيانات بالمنتجات؟ (يجب تشغيل هذه العملية مرة واحدة فقط)")) {
        return;
    }

    const productsCollectionRef = collection(db, 'products');
    console.log("Starting to seed database with products...");

    for (const product of mockProducts) {
        try {
            await addDoc(productsCollectionRef, product);
            console.log(`Added product: ${product.name}`);
        } catch (error) {
            console.error(`Error adding product ${product.name}:`, error);
        }
    }
    
    alert("اكتملت عملية تعبئة المنتجات بنجاح!");
    console.log("Database product seeding complete.");
};

export const seedFilters = async () => {
    if (!window.confirm("هل أنت متأكد من رغبتك في تعبئة الفلاتر المبدئية؟ سيؤدي هذا إلى الكتابة فوق الإعدادات الحالية. (يجب تشغيل هذه العملية مرة واحدة فقط)")) {
        return;
    }
    try {
        await setFilterOptions(filterOptions);
        alert("اكتملت عملية تعبئة الفلاتر بنجاح!");
        console.log("Filter seeding complete.");
    } catch (error) {
        console.error("Error seeding filters:", error);
        alert("حدث خطأ أثناء تعبئة الفلاتر.");
    }
}
