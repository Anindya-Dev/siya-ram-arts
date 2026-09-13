// src/data/products.ts
import { Product, InventoryItem, Review } from '../types';
import { fetchApi } from '../lib/api.ts';

export const ALL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Vikram Mehta',
    location: 'London, United Kingdom',
    rating: 5,
    title: 'The divine presence in the eyes is breathtaking',
    content: 'We were anxious about ordering an 18-inch sacred idol for our new home in New Jersey. The wooden crate arrived with not a single scratch. When we unveiled the murti, the gentle innocence in Shri Ram\'s face moved my elderly parents to tears.',
    verifiedPatron: true,
    date: 'February 2025',
    image: '/static/idols/cow-krishna-bansuri-idol.png',
    altarName: 'Anand & Radhika Parekh • London Mandir'
  },
  {
    id: 'rev-2',
    author: 'Pandit R. K. Shastri',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    title: 'High-density chemical resin of unmatched fidelity',
    content: 'I was looking for a durable, non-porous murti that can withstand regular worship and abhishek without fear of damage. The high-density chemical resin casting has phenomenal detail and crisp features. The gold vark work is delicate and water-sealed.',
    verifiedPatron: true,
    date: 'January 2025',
    image: '/static/idols/white-marble-shvetambara-krishna.png',
    altarName: 'Dr. S. K. Narayanan • Bengaluru Sanctum'
  },
  {
    id: 'rev-3',
    author: 'Meenakshi Sundaram',
    location: 'San Jose, California',
    rating: 5,
    title: 'Seamless consecration certificate and guidance',
    content: 'The artisans provided full photographic tracking of the carving progress over 3 weeks. It felt like watching divinity take physical shape. Exceptional packaging and truly museum worthy craft.',
    verifiedPatron: true,
    date: 'December 2024',
    image: '/static/idols/sanjeevani-parvat-dhari-hanuman.png',
    altarName: 'Pooja & Sameer Bajpai • San Jose, CA'
  },
  {
    id: 'rev-4',
    author: 'Maharaj Brajraj Singh',
    location: 'Jaipur, Rajasthan',
    rating: 5,
    title: 'Authentic Shilpa Shastra iconometry',
    content: 'The Talamana proportioning matches classical Manasara manuscripts. The Netronmeelana eye opening is divine and radiates serene shanti across the courtyard sanctum.',
    verifiedPatron: true,
    date: 'November 2024',
    image: '/static/idols/kailash-shiv-parvati-ganesha.png',
    altarName: 'Maharaj Brajraj Singh • Jaipur Altar'
  }
];

export async function getLiveProducts(): Promise<Product[]> {
  try {
    return await fetchApi<Product[]>('/products/');
  } catch (error) {
    console.error("Failed to fetch live products from backend, falling back:", error);
    return [];
  }
}

export const PRODUCTS: Product[] = []; 

export const COMPANIONS = [
  {
    id: 'comp-1',
    name: 'White Marble Pure Shvetambara Krishna Murti',
    material: 'Pure White Marble • 18 Inch',
    price: 45000,
    tag: 'MATCHING SWAROOP',
    image: '/static/idols/white-marble-shvetambara-krishna.png',
    slug: 'white-marble-pure-shvetambara-krishna-murti',
  },
  {
    id: 'comp-2',
    name: 'Sanjeevani Parvat Dhari Hanuman Ji Idol',
    material: 'White Marble Composite • 14 Inch',
    price: 32000,
    tag: 'DEVOTEE FAVORITE',
    image: '/static/idols/sanjeevani-parvat-dhari-hanuman.png',
    slug: 'sanjeevani-parvat-dhari-hanuman-ji-idol',
  },
  {
    id: 'comp-3',
    name: 'Paan Patta Green Leaf Ganesha Idol',
    material: 'High-Gloss Marble Resin • 9 Inch',
    price: 22000,
    tag: 'SANCTUM FAVORITE',
    image: '/static/idols/paan-patta-green-leaf-ganesha.png',
    slug: 'paan-patta-green-leaf-ganesha-idol',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [];