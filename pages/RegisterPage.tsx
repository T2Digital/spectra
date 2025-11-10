import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser } from '../firebase/services';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
        return;
    }
    setLoading(true);
    setError('');
    try {
      await signUpUser(email, password, displayName);
      navigate('/'); // Redirect to home on successful registration
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل بالفعل.');
      } else {
        setError('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
      }
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-brand-primary">إنشاء حساب جديد</h1>
            <p className="text-gray-500 mt-2">انضم إلى عالم Spectra.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400"
            >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-medium text-brand-accent hover:underline">
              سجل الدخول من هنا
            </Link>
          </p>
      </div>
    </div>
  );
};

export default RegisterPage;