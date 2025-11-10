import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, Heart, X, ChevronDown, User, LogOut as LogOutIcon, Filter } from './icons';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import SearchOverlay from './SearchOverlay';
import FilterSidebar from './FilterSidebar'; // Import FilterSidebar
import { getFilterOptions } from '../firebase/services'; // To fetch filter data
import type { FilterOptionsData } from '../types';
import NotificationBell from './NotificationBell';

// Duplicating this from HomePage for modularity
const mapFilterOptions = (optionsData: FilterOptionsData | null): any[] => {
  if (!optionsData) return [];
  return [
    { id: 'gender', label: 'الجنس', options: optionsData.genders || [] },
    { id: 'brand', label: 'البراند', options: optionsData.brands || [] },
    { id: 'subCategory', label: 'النوع', options: optionsData.subCategories || [] },
    { id: 'shape', label: 'الشكل', options: optionsData.shapes || [] },
    { id: 'color', label: 'اللون', options: optionsData.colors || [] },
  ];
};


const navigationLinks = [
    {
        name: 'نظارات',
        subCategories: [
            {
                name: 'رجالي',
                href: '/products?category=نظارات&gender=رجالي',
                types: [
                    { name: 'نظارات شمسية', href: '/products?category=نظارات&gender=رجالي&subCategory=نظارات شمسية' },
                    { name: 'نظارات طبية', href: '/products?category=نظارات&gender=رجالي&subCategory=نظارات طبية' },
                ],
            },
            {
                name: 'حريمي',
                href: '/products?category=نظارات&gender=حريمي',
                types: [
                    { name: 'نظارات شمسية', href: '/products?category=نظارات&gender=حريمي&subCategory=نظارات شمسية' },
                    { name: 'نظارات طبية', href: '/products?category=نظارات&gender=حريمي&subCategory=نظارات طبية' },
                ],
            },
            {
                name: 'أطفالي',
                href: '/products?category=نظارات&gender=أطفالي',
                types: [
                    { name: 'نظارات شمسية', href: '/products?category=نظارات&gender=أطفالي&subCategory=نظارات شمسية' },
                    { name: 'نظارات طبية', href: '/products?category=نظارات&gender=أطفالي&subCategory=نظارات طبية' },
                ],
            },
        ],
    },
    {
        name: 'عدسات لاصقة',
        href: '/products?category=عدسات لاصقة',
        subCategories: [
            { name: 'عدسات ملونة', href: '/products?category=عدسات لاصقة&subCategory=عدسات ملونة' },
            { name: 'عدسات طبية', href: '/products?category=عدسات لاصقة&subCategory=عدسات طبية' },
            { name: 'محلول عدسات', href: '/products?category=عدسات لاصقة&subCategory=محلول عدسات' },
        ]
    },
    {
        name: 'اكسسوارات',
        href: '/products?category=اكسسوارات',
    }
];

const MobileNav: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const { user, logout } = useContext(AuthContext);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    return (
        <>
            <div className="fixed inset-0 z-50 bg-white text-brand-primary p-4 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <Link to="/" onClick={onClose} className="text-2xl font-extrabold">SPECTRA</Link>
                    <button onClick={onClose} aria-label="Close menu"><X className="w-6 h-6"/></button>
                </div>
                <nav className="flex-grow overflow-y-auto">
                    <ul className="space-y-2">
                        {navigationLinks.map(link => (
                            <li key={link.name} className="border-b">
                                {link.subCategories ? (
                                    <div>
                                        <button onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)} className="w-full flex justify-between items-center py-4 text-lg font-semibold">
                                            <span>{link.name}</span>
                                            <ChevronDown className={`w-5 h-5 transition-transform ${openMenu === link.name ? 'rotate-180' : ''}`}/>
                                        </button>
                                        {openMenu === link.name && (
                                            <ul className="pr-4 pb-2">
                                                {link.href && <li><NavLink to={link.href} onClick={onClose} className="block py-2 text-gray-600">عرض الكل</NavLink></li>}
                                                {link.subCategories.map(sub => (
                                                    <li key={sub.name} className="py-1">
                                                        <NavLink to={sub.href || '#'} onClick={onClose} className="block py-2 font-medium">{sub.name}</NavLink>
                                                        {sub.types && (
                                                            <ul className="pr-4">
                                                                {sub.types.map(type => (
                                                                    <li key={type.name}><NavLink to={type.href} onClick={onClose} className="block py-2 text-gray-600">{type.name}</NavLink></li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink to={link.href || '#'} onClick={onClose} className="block py-4 text-lg font-semibold">{link.name}</NavLink>
                                )}
                            </li>
                        ))}
                         <li className="border-b">
                            <button onClick={() => setIsFilterModalOpen(true)} className="w-full flex justify-between items-center py-4 text-lg font-semibold">
                                <span>الفلاتر</span>
                                <Filter className="w-5 h-5"/>
                            </button>
                        </li>
                    </ul>
                </nav>
                <div className="mt-auto border-t pt-4">
                    {user ? (
                        <div className="space-y-2">
                            <Link to="/profile" onClick={onClose} className="w-full text-left flex items-center gap-2 py-2 text-lg">
                                <User className="w-5 h-5" />
                                حسابي
                            </Link>
                            <button onClick={logout} className="w-full text-left flex items-center gap-2 py-2 text-lg">
                                <LogOutIcon className="w-5 h-5" />
                                تسجيل الخروج
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Link to="/login" onClick={onClose} className="block text-center w-full bg-brand-primary text-white py-3 rounded-lg font-semibold">تسجيل الدخول</Link>
                            <Link to="/register" onClick={onClose} className="block text-center w-full bg-gray-200 py-3 rounded-lg font-semibold">إنشاء حساب</Link>
                        </div>
                    )}
                </div>
            </div>
            {isFilterModalOpen && <MobileFilterModal onClose={() => setIsFilterModalOpen(false)} onApplyFilters={onClose} />}
        </>
    )
}

const MobileFilterModal: React.FC<{onClose: () => void; onApplyFilters: () => void}> = ({ onClose, onApplyFilters }) => {
    const [filterOptions, setFilterOptionsData] = useState<any[]>([]);
    const [filters, setFilters] = useState<Record<string, string[]>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            const optionsData = await getFilterOptions();
            setFilterOptionsData(mapFilterOptions(optionsData));
        };
        fetchOptions();
    }, []);

    const handleFilterChange = (filterId: string, option: string) => {
        setFilters(prevFilters => {
            const currentOptions = prevFilters[filterId] || [];
            const newOptions = currentOptions.includes(option)
                ? currentOptions.filter(o => o !== option)
                : [...currentOptions, option];
            return { ...prevFilters, [filterId]: newOptions };
        });
    };

    const handleApply = () => {
        const params = new URLSearchParams();
        // FIX: Explicitly type the destructured 'values' as 'string[]' to resolve type inference issue.
        Object.entries(filters).forEach(([key, values]: [string, string[]]) => {
            if (values.length > 0) {
                params.set(key, values.join(','));
            }
        });
        navigate(`/products?${params.toString()}`);
        onApplyFilters();
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col">
            <FilterSidebar 
                options={filterOptions}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={() => setFilters({})}
                filterCounts={{}} // Simplified for mobile menu
                isMobile={true}
                onClose={onClose}
                onApply={handleApply} // Custom apply function
            />
        </div>
    );
};


const Header: React.FC = () => {
    const { cartItems, toggleCart } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const navigate = useNavigate();
    
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen || isSearchOpen ? 'hidden' : 'unset';
    }, [mobileMenuOpen, isSearchOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md sticky top-[40px] z-40 border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                            {navigationLinks.map((link) => (
                                <div key={link.name} className="group relative">
                                    <NavLink 
                                        to={link.href || '#'} 
                                        className={({isActive}) => `text-base font-semibold transition-colors flex items-center gap-1 ${isActive && !link.subCategories ? 'text-brand-accent' : 'hover:text-brand-accent'}`}
                                    >
                                        {link.name}
                                        {link.subCategories && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180"/>}
                                    </NavLink>
                                    {link.subCategories && (
                                        <div className="absolute top-full right-0 w-max bg-white shadow-lg rounded-md mt-2 p-4 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-10 grid grid-flow-col gap-8">
                                            {link.subCategories.map((sub) => (
                                                <ul key={sub.name} className="space-y-2">
                                                    <li><Link to={sub.href || '#'} className="font-bold hover:text-brand-accent">{sub.name}</Link></li>
                                                    {sub.types?.map((type) => (
                                                        <li key={type.name}><Link to={type.href} className="text-sm text-gray-600 hover:text-brand-accent">{type.name}</Link></li>
                                                    ))}
                                                </ul>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                                <Menu className="h-6 w-6 text-brand-primary" />
                            </button>
                        </div>
                        
                        <div className="absolute left-1/2 -translate-x-1/2">
                            <Link to="/" className="text-3xl font-extrabold tracking-wider">SPECTRA</Link>
                        </div>

                        <div className="flex items-center space-x-5 rtl:space-x-reverse">
                            <button onClick={() => setIsSearchOpen(true)} aria-label="Search"><Search className="h-6 w-6 text-brand-primary" /></button>
                            {user && <NotificationBell />}
                            <Link to="/wishlist" aria-label="Wishlist"><Heart className="h-6 w-6 text-brand-primary" /></Link>
                            {user ? (
                                <div className="group relative hidden md:block">
                                    <button className="flex items-center gap-2">
                                        <User className="h-6 w-6 text-brand-primary" />
                                    </button>
                                    <div className="absolute top-full right-0 w-48 bg-white shadow-lg rounded-md mt-2 p-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-10">
                                        <div className="px-3 py-2 border-b">
                                            <p className="text-sm font-semibold truncate">{user.displayName || user.email}</p>
                                        </div>
                                        <Link to="/profile" className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                                            <User className="w-4 h-4" />
                                            حسابي
                                        </Link>
                                        <button onClick={handleLogout} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md">
                                            <LogOutIcon className="w-4 h-4" />
                                            تسجيل الخروج
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login" className="text-sm font-semibold hover:text-brand-accent">تسجيل الدخول</Link>
                                    <Link to="/register" className="text-sm font-semibold bg-brand-primary text-white px-3 py-1.5 rounded-md hover:bg-opacity-90">إنشاء حساب</Link>
                                </div>
                            )}
                            <button className="relative" onClick={toggleCart} aria-label={`Open cart with ${totalItems} items`}>
                                <ShoppingCart className="h-6 w-6 text-brand-primary" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            {mobileMenuOpen && <MobileNav onClose={() => setMobileMenuOpen(false)} />}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Header;