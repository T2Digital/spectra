import type { Product, FilterOptionsData } from '../types';

// Note: IDs have been converted to strings to match Firestore document IDs.
export const mockProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Ray-Ban Aviator Classic',
    brand: 'Ray-Ban',
    price: 3200,
    originalPrice: 4000,
    images: [
      'https://i.ibb.co/1GZf4qR/download-3-1.png',
      'https://picsum.photos/id/11/800/800',
      'https://picsum.photos/id/12/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات شمسية',
    gender: 'رجالي',
    shape: 'طيار',
    color: 'ذهبي',
    sizes: ['55-14-140', '58-14-140'],
    installmentStartPrice: 267,
    // FIX: Add missing 'stock' property.
    stock: 25,
    reviews: [
        { id: 'review1', author: 'أحمد', rating: 5, comment: 'كلاسيكية وأنيقة جداً!', date: '2023-05-10'},
        { id: 'review2', author: 'سارة', rating: 4, comment: 'جودة ممتازة لكنها لم تناسب وجهي تماماً.', date: '2023-04-22'},
    ]
  },
  {
    name: 'Oakley Holbrook',
    brand: 'Oakley',
    price: 2800,
    images: [
      'https://picsum.photos/id/20/800/800',
      'https://picsum.photos/id/21/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات شمسية',
    gender: 'رجالي',
    shape: 'مربع',
    color: 'أسود مطفي',
    sizes: ['57-18-137'],
    installmentStartPrice: 233,
    // FIX: Add missing 'stock' property.
    stock: 15,
    reviews: [
        { id: 'review3', author: 'خالد', rating: 5, comment: 'مثالية للرياضة واليوميات.', date: '2023-06-01'},
    ]
  },
  {
    name: 'Persol 714',
    brand: 'Persol',
    price: 4500,
    images: [
      'https://i.ibb.co/j3400/download-3-1.png',
      'https://picsum.photos/id/31/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات طبية',
    gender: 'رجالي',
    shape: 'طيار',
    color: 'بني',
    sizes: ['54-21-145'],
    installmentStartPrice: 375,
    // FIX: Add missing 'stock' property.
    stock: 10,
    reviews: []
  },
  {
    name: 'Prada Cat Eye',
    brand: 'Prada',
    price: 5200,
    images: [
      'https://picsum.photos/id/40/800/800',
      'https://picsum.photos/id/41/800/800',
      'https://picsum.photos/id/42/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات شمسية',
    gender: 'حريمي',
    shape: 'عين القطة',
    color: 'أسود',
    sizes: ['54-19-140'],
    installmentStartPrice: 433,
    // FIX: Add missing 'stock' property.
    stock: 18,
    reviews: [
        { id: 'review4', author: 'نورة', rating: 5, comment: 'تصميم يبرز الأنوثة والفخامة.', date: '2023-07-15'},
    ]
  },
  {
    name: 'Tom Ford FT5401',
    brand: 'Tom Ford',
    price: 6100,
    originalPrice: 7000,
    images: [
      'https://picsum.photos/id/50/800/800',
      'https://picsum.photos/id/51/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات طبية',
    gender: 'حريمي',
    shape: 'مربع',
    color: 'بني داكن',
    sizes: ['52-17-145'],
    installmentStartPrice: 508,
    // FIX: Add missing 'stock' property.
    stock: 8,
    reviews: [
        { id: 'review5', author: 'محمد', rating: 5, comment: 'جودة استثنائية وتصميم راقي.', date: '2023-03-20'},
        { id: 'review6', author: 'فاطمة', rating: 4, comment: 'سعرها مرتفع قليلاً لكنها تستحق.', date: '2023-02-11'},
    ]
  },
  {
    name: 'Oliver Peoples Gregory Peck',
    brand: 'Oliver Peoples',
    price: 5800,
    images: [
      'https://picsum.photos/id/60/800/800',
      'https://picsum.photos/id/61/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات طبية',
    gender: 'أطفالي',
    shape: 'دائري',
    color: 'شفاف',
    sizes: ['47-23-150'],
    installmentStartPrice: 483,
    // FIX: Add missing 'stock' property.
    stock: 12,
    reviews: []
  },
  {
    name: 'Gucci GG0026O',
    brand: 'Gucci',
    price: 5500,
    images: [
      'https://picsum.photos/id/70/800/800',
      'https://picsum.photos/id/71/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات طبية',
    gender: 'حريمي',
    shape: 'مربع',
    color: 'أسود',
    sizes: ['53-17-145'],
    installmentStartPrice: 458,
    // FIX: Add missing 'stock' property.
    stock: 20,
    reviews: [
         { id: 'review7', author: 'علي', rating: 5, comment: 'تصميم عصري وجودة لا يعلى عليها.', date: '2023-08-01'},
    ]
  },
  {
    name: 'Versace VE4361',
    brand: 'Versace',
    price: 4800,
    originalPrice: 5500,
    images: [
      'https://picsum.photos/id/80/800/800',
      'https://picsum.photos/id/81/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات شمسية',
    gender: 'حريمي',
    shape: 'عين القطة',
    color: 'أحمر',
    sizes: ['53-18-140'],
    installmentStartPrice: 400,
    // FIX: Add missing 'stock' property.
    stock: 7,
    reviews: []
  },
  {
    name: 'Carrera Champion',
    brand: 'Carrera',
    price: 2500,
    images: [
      'https://picsum.photos/id/90/800/800',
      'https://picsum.photos/id/91/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات شمسية',
    gender: 'رجالي',
    shape: 'طيار',
    color: 'أسود',
    sizes: ['62-12-125'],
    installmentStartPrice: 208,
    // FIX: Add missing 'stock' property.
    stock: 30,
    reviews: [
        { id: 'review8', author: 'يوسف', rating: 4, comment: 'جيدة جداً مقابل السعر.', date: '2023-06-18'},
    ]
  },
  {
    name: 'Burberry BE2299',
    brand: 'Burberry',
    price: 4950,
    images: [
      'https://picsum.photos/id/100/800/800',
      'https://picsum.photos/id/101/800/800',
    ],
    category: 'نظارات',
    subCategory: 'نظارات طبية',
    gender: 'أطفالي',
    shape: 'دائري',
    color: 'بني مخطط',
    sizes: ['52-21-145'],
    installmentStartPrice: 412,
    // FIX: Add missing 'stock' property.
    stock: 14,
    reviews: [
        { id: 'review9', author: 'ريم', rating: 5, comment: 'أنيقة جداً ومريحة في اللبس.', date: '2023-07-30'},
    ]
  },
  {
    name: 'Acuvue Oasys',
    brand: 'Acuvue',
    price: 800,
    images: ['https://picsum.photos/id/201/800/800'],
    category: 'عدسات لاصقة',
    subCategory: 'عدسات طبية',
    shape: undefined,
    color: 'شفاف',
    sizes: ['شهرية - 6 عدسات'],
    installmentStartPrice: 67,
    // FIX: Add missing 'stock' property.
    stock: 50,
    reviews: []
  },
  {
    name: 'FreshLook ColorBlends',
    brand: 'FreshLook',
    price: 450,
    images: ['https://picsum.photos/id/202/800/800'],
    category: 'عدسات لاصقة',
    subCategory: 'عدسات ملونة',
    shape: undefined,
    color: 'أزرق',
    sizes: ['شهرية - عدستان'],
    installmentStartPrice: 38,
    // FIX: Add missing 'stock' property.
    stock: 45,
    reviews: []
  },
  {
    name: 'Renu Multi-Purpose Solution',
    brand: 'Bausch + Lomb',
    price: 150,
    images: ['https://picsum.photos/id/203/800/800'],
    category: 'عدسات لاصقة',
    subCategory: 'محلول عدسات',
    shape: undefined,
    color: 'N/A',
    sizes: ['355 مل'],
    installmentStartPrice: 13,
    // FIX: Add missing 'stock' property.
    stock: 100,
    reviews: []
  },
  {
    name: 'Spectra Microfiber Cloth',
    brand: 'Spectra',
    price: 75,
    images: ['https://picsum.photos/id/204/800/800'],
    category: 'اكسسوارات',
    subCategory: 'اكسسوار',
    shape: undefined,
    color: 'رمادي',
    sizes: ['15x15 سم'],
    installmentStartPrice: 6,
    // FIX: Add missing 'stock' property.
    stock: 80,
    reviews: []
  }
];

// Changed to object of arrays to match Firestore structure
export const filterOptions: FilterOptionsData = {
  genders: ['رجالي', 'حريمي', 'أطفالي'],
  brands: ['Ray-Ban', 'Oakley', 'Persol', 'Prada', 'Tom Ford', 'Oliver Peoples', 'Gucci', 'Versace', 'Carrera', 'Burberry', 'Acuvue', 'FreshLook', 'Bausch + Lomb', 'Spectra'],
  subCategories: ['نظارات طبية', 'نظارات شمسية', 'عدسات طبية', 'عدسات ملونة', 'محلول عدسات', 'اكسسوار'],
  shapes: ['دائري', 'مربع', 'طيار', 'عين القطة'],
  colors: ['ذهبي', 'أسود مطفي', 'بني', 'أسود', 'بني داكن', 'شفاف', 'أحمر', 'بني مخطط', 'أزرق', 'رمادي'],
};