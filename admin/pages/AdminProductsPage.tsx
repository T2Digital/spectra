import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, deleteProduct } from '../../firebase/services';
import { seedDatabase } from '../../firebase/seed'; // Import the seed function
import type { Product } from '../../types';
import ProductFormModal from '../components/ProductFormModal';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productList = await getProducts();
      setProducts(productList);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      try {
        await deleteProduct(productId);
        // Refresh products list after deletion
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert('حدث خطأ أثناء حذف المنتج.');
      }
    }
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchProducts(); // Refresh data after add/edit
  };

  const handleSeed = async () => {
    await seedDatabase();
    fetchProducts(); // Refresh products after seeding
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h1>
          <div className="flex gap-2">
            {products.length === 0 && (
                 <button 
                    onClick={handleSeed}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700"
                  >
                    تعبئة قاعدة البيانات (لأول مرة)
                  </button>
            )}
            <button 
              onClick={handleAddNew}
              className="bg-brand-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90"
            >
              إضافة منتج جديد
            </button>
          </div>
        </div>
        
        {loading ? (
          <p>جاري تحميل المنتجات...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="border-b-2 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 font-semibold text-sm">المنتج</th>
                  <th className="py-3 px-4 font-semibold text-sm">الماركة</th>
                  <th className="py-3 px-4 font-semibold text-sm">السعر</th>
                  <th className="py-3 px-4 font-semibold text-sm">الفئة</th>
                  <th className="py-3 px-4 font-semibold text-sm">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md"/>
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.brand}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.price.toLocaleString()} جنيه</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{product.subCategory}</td>
                    <td className="py-3 px-4 text-sm space-x-2 rtl:space-x-reverse">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:underline">تعديل</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {products.length === 0 && !loading && (
              <div className="text-center py-10">
                <p className="text-gray-600">لا توجد منتجات. قم بتعبئة قاعدة البيانات للبدء.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleModalClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
};

export default AdminProductsPage;