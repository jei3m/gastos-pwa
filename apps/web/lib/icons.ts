import type { ComponentType } from 'react';
import {
  Apple,
  ArrowDownUp,
  ArrowLeftRight,
  Backpack,
  BadgeDollarSign,
  Banknote,
  Beer,
  Bike,
  Bitcoin,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Bus,
  CakeSlice,
  Camera,
  Car,
  CarFront,
  Carrot,
  CarTaxiFront,
  ChartCandlestick,
  CircleDollarSign,
  Clapperboard,
  Coffee,
  Coins,
  CreditCard,
  Croissant,
  CupSoda,
  Dices,
  Donut,
  Droplets,
  Dumbbell,
  Ellipsis,
  Film,
  Footprints,
  Fuel,
  Gamepad2,
  Gem,
  Gift,
  Glasses,
  GraduationCap,
  Hammer,
  HandCoins,
  Heart,
  HeartHandshake,
  HeartPulse,
  Headphones,
  Home as HomeIcon,
  HousePlus,
  IceCreamBowl,
  Lamp,
  Landmark,
  Laptop,
  type LucideProps,
  Martini,
  Motorbike,
  Music,
  Palette,
  PartyPopper,
  PawPrint,
  Pencil,
  Percent,
  Phone,
  PiggyBank,
  Pill,
  Pizza,
  Plane,
  Popcorn,
  Receipt,
  Sailboat,
  Sandwich,
  Scale,
  Scissors,
  Shirt,
  Ship,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Sofa,
  Sparkles,
  Stethoscope,
  Store,
  Syringe,
  Tag,
  Tags,
  BedDouble,
  TrainFront,
  TramFront,
  Trash2,
  TrendingUp,
  Trophy,
  Tv,
  Undo2,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wine,
  Wrench,
  Zap,
  Baby,
  LifeBuoy,
} from 'lucide-react';

export interface IconData {
  id: string;
  name: string;
  icon: ComponentType<LucideProps>;
  type: string;
  category: string;
  keywords?: string[];
}

export type IconKey = (typeof icons)[number]['id'];

const expense = (
  id: string,
  name: string,
  icon: ComponentType<LucideProps>,
  category: string,
  keywords: string[] = []
): IconData => ({
  id,
  name,
  icon,
  type: 'expense',
  category,
  keywords,
});

const income = (
  id: string,
  name: string,
  icon: ComponentType<LucideProps>,
  category: string,
  keywords: string[] = []
): IconData => ({
  id,
  name,
  icon,
  type: 'income',
  category,
  keywords,
});

export const EXPENSE_CATEGORIES = [
  'Food & Drink',
  'Shopping',
  'Transport',
  'Home & Bills',
  'Health & Care',
  'Leisure & Fun',
  'Work & Education',
  'Money & Other',
] as const;

export const INCOME_CATEGORIES = [
  'Pay & Work',
  'Business & Investing',
  'Gifts & Other',
] as const;

export const icons: IconData[] = [
  // ---------- EXPENSE: Food & Drink ----------
  expense('food', 'Food', Utensils, 'Food & Drink', [
    'restaurant',
    'meal',
    'dining',
    'eat',
  ]),
  expense(
    'groceries',
    'Groceries',
    ShoppingCart,
    'Food & Drink',
    ['grocery', 'supermarket', 'market', 'cart']
  ),
  expense('coffee', 'Coffee', Coffee, 'Food & Drink', [
    'cafe',
    'espresso',
    'tea',
    'breakfast',
  ]),
  expense(
    'restaurant',
    'Restaurant',
    UtensilsCrossed,
    'Food & Drink',
    ['dining', 'dinner', 'lunch']
  ),
  expense('fast-food', 'Fast Food', Pizza, 'Food & Drink', [
    'pizza',
    'burger',
    'takeout',
    'delivery',
  ]),
  expense(
    'sandwich',
    'Sandwich',
    Sandwich,
    'Food & Drink',
    ['snack', 'lunch', 'deli']
  ),
  expense('bakery', 'Bakery', Croissant, 'Food & Drink', [
    'bread',
    'pastry',
    'breakfast',
  ]),
  expense('dessert', 'Dessert', CakeSlice, 'Food & Drink', [
    'cake',
    'sweets',
    'birthday',
  ]),
  expense('donut', 'Sweets', Donut, 'Food & Drink', [
    'donut',
    'candy',
    'sugar',
  ]),
  expense(
    'ice-cream',
    'Ice Cream',
    IceCreamBowl,
    'Food & Drink',
    ['gelato', 'dessert', 'frozen']
  ),
  expense(
    'soft-drinks',
    'Drinks',
    CupSoda,
    'Food & Drink',
    ['soda', 'juice', 'soda', 'beverage']
  ),
  expense('cocktails', 'Bar', Martini, 'Food & Drink', [
    'cocktail',
    'drinks',
    'nightlife',
  ]),
  expense('wine', 'Wine', Wine, 'Food & Drink', [
    'alcohol',
    'drinks',
    'dinner',
  ]),
  expense('beer', 'Beer', Beer, 'Food & Drink', [
    'alcohol',
    'drinks',
    'pub',
  ]),
  expense('snacks', 'Snacks', Popcorn, 'Food & Drink', [
    'popcorn',
    'chips',
    'movies',
  ]),
  expense('fruit', 'Fruit', Apple, 'Food & Drink', [
    'apple',
    'healthy',
    'fresh',
  ]),
  expense('veggies', 'Vegetables', Carrot, 'Food & Drink', [
    'carrot',
    'healthy',
    'vegan',
    'fresh',
  ]),

  // ---------- EXPENSE: Shopping ----------
  expense('shopping', 'Shopping', ShoppingBag, 'Shopping', [
    'bag',
    'store',
    'retail',
    'clothes',
  ]),
  expense('basket', 'Market', ShoppingBasket, 'Shopping', [
    'basket',
    'market',
    'grocery',
  ]),
  expense('clothing', 'Clothing', Shirt, 'Shopping', [
    'shirt',
    'fashion',
    'apparel',
    'tshirt',
  ]),
  expense('shoes', 'Shoes', Footprints, 'Shopping', [
    'footwear',
    'sneakers',
    'steps',
  ]),
  expense('accessories', 'Accessories', Gem, 'Shopping', [
    'jewelry',
    'gem',
    'luxury',
    'watch',
  ]),
  expense('deals', 'Deals', Tag, 'Shopping', [
    'tag',
    'discount',
    'offer',
    'price',
  ]),
  expense('sale', 'Sale', Tags, 'Shopping', [
    'discount',
    'clearance',
    'offer',
  ]),
  expense('store', 'Store', Store, 'Shopping', [
    'shop',
    'retail',
    'mall',
    'boutique',
  ]),

  // ---------- EXPENSE: Transport ----------
  expense('car', 'Car', Car, 'Transport', [
    'vehicle',
    'auto',
    'drive',
    'fuel',
  ]),
  expense('travel', 'Travel', Plane, 'Transport', [
    'flight',
    'vacation',
    'trip',
    'airport',
  ]),
  expense('sedan', 'Ride', CarFront, 'Transport', [
    'taxi',
    'ride',
    'vehicle',
  ]),
  expense('taxi', 'Taxi', CarTaxiFront, 'Transport', [
    'cab',
    'ride',
    'grab',
    'uber',
  ]),
  expense('bus', 'Bus', Bus, 'Transport', [
    'commute',
    'transit',
    'public',
  ]),
  expense('train', 'Train', TrainFront, 'Transport', [
    'rail',
    'metro',
    'commute',
  ]),
  expense('tram', 'Tram', TramFront, 'Transport', [
    'metro',
    'rail',
    'city',
  ]),
  expense('fuel', 'Fuel', Fuel, 'Transport', [
    'gas',
    'petrol',
    'diesel',
    'station',
  ]),
  expense('bike', 'Bike', Bike, 'Transport', [
    'bicycle',
    'cycling',
    'ride',
  ]),
  expense(
    'motorbike',
    'Motorbike',
    Motorbike,
    'Transport',
    ['motorcycle', 'scooter', 'ride']
  ),
  expense('sailboat', 'Boat', Sailboat, 'Transport', [
    'sail',
    'sea',
    'ferry',
  ]),
  expense('cruise', 'Ferry', Ship, 'Transport', [
    'ship',
    'cruise',
    'sea',
    'boat',
  ]),

  // ---------- EXPENSE: Home & Bills ----------
  expense('rent', 'Rent', HomeIcon, 'Home & Bills', [
    'house',
    'home',
    'mortgage',
    'apartment',
  ]),
  expense('phone', 'Phone', Phone, 'Home & Bills', [
    'mobile',
    'cellphone',
    'load',
    'telecom',
  ]),
  expense('internet', 'Internet', Wifi, 'Home & Bills', [
    'wifi',
    'broadband',
    'data',
  ]),
  expense(
    'electricity',
    'Electricity',
    Zap,
    'Home & Bills',
    ['power', 'energy', 'bill', 'meralco']
  ),
  expense('water', 'Water', Droplets, 'Home & Bills', [
    'bill',
    'utility',
    'supply',
  ]),
  expense('tv', 'TV & Cable', Tv, 'Home & Bills', [
    'television',
    'cable',
    'streaming',
    'netflix',
  ]),
  expense('furniture', 'Furniture', Sofa, 'Home & Bills', [
    'sofa',
    'couch',
    'living',
    'decor',
  ]),
  expense('bedroom', 'Bedroom', BedDouble, 'Home & Bills', [
    'bed',
    'sleep',
    'hotel',
  ]),
  expense('lighting', 'Lighting', Lamp, 'Home & Bills', [
    'lamp',
    'decor',
    'home',
  ]),
  expense('repairs', 'Repairs', Wrench, 'Home & Bills', [
    'fix',
    'maintenance',
    'tools',
    'service',
  ]),
  expense('diy', 'DIY & Tools', Hammer, 'Home & Bills', [
    'hammer',
    'tools',
    'hardware',
    'build',
  ]),
  expense('cleaning', 'Cleaning', Trash2, 'Home & Bills', [
    'trash',
    'waste',
    'housekeeping',
  ]),

  // ---------- EXPENSE: Health & Care ----------
  expense('health', 'Health', Heart, 'Health & Care', [
    'wellness',
    'care',
    'love',
  ]),
  expense(
    'healthcare',
    'Healthcare',
    HeartPulse,
    'Health & Care',
    ['medical', 'hospital', 'clinic', 'doctor']
  ),
  expense(
    'doctor',
    'Doctor',
    Stethoscope,
    'Health & Care',
    ['checkup', 'hospital', 'clinic', 'medical']
  ),
  expense('pharmacy', 'Pharmacy', Pill, 'Health & Care', [
    'medicine',
    'drugs',
    'prescription',
  ]),
  expense('vaccine', 'Vaccine', Syringe, 'Health & Care', [
    'shot',
    'immunization',
    'clinic',
  ]),
  expense('fitness', 'Fitness', Dumbbell, 'Health & Care', [
    'gym',
    'workout',
    'exercise',
    'sports',
  ]),
  expense('eyecare', 'Eyecare', Glasses, 'Health & Care', [
    'glasses',
    'vision',
    'optical',
  ]),
  expense('salon', 'Salon', Scissors, 'Health & Care', [
    'haircut',
    'barber',
    'grooming',
  ]),
  expense(
    'spa',
    'Spa & Beauty',
    Sparkles,
    'Health & Care',
    ['beauty', 'massage', 'skincare', 'wellness']
  ),
  expense('baby', 'Baby & Kids', Baby, 'Health & Care', [
    'child',
    'kids',
    'family',
    'diaper',
  ]),
  expense('pets', 'Pets', PawPrint, 'Health & Care', [
    'dog',
    'cat',
    'vet',
    'animal',
  ]),

  // ---------- EXPENSE: Leisure & Fun ----------
  expense('gaming', 'Gaming', Gamepad2, 'Leisure & Fun', [
    'games',
    'video',
    'console',
    'play',
  ]),
  expense('movies', 'Movies', Film, 'Leisure & Fun', [
    'film',
    'cinema',
    'watch',
  ]),
  expense(
    'cinema',
    'Cinema',
    Clapperboard,
    'Leisure & Fun',
    ['theater', 'movie', 'show']
  ),
  expense('music', 'Music', Music, 'Leisure & Fun', [
    'concert',
    'song',
    'instrument',
  ]),
  expense('audio', 'Audio', Headphones, 'Leisure & Fun', [
    'headphones',
    'podcast',
    'spotify',
  ]),
  expense('sports', 'Sports', Trophy, 'Leisure & Fun', [
    'trophy',
    'competition',
    'game',
    'fitness',
  ]),
  expense('hobbies', 'Hobbies', Palette, 'Leisure & Fun', [
    'art',
    'craft',
    'paint',
    'creative',
  ]),
  expense(
    'photography',
    'Photography',
    Camera,
    'Leisure & Fun',
    ['camera', 'photo', 'memories']
  ),
  expense('party', 'Party', PartyPopper, 'Leisure & Fun', [
    'celebration',
    'birthday',
    'event',
  ]),
  expense(
    'board-games',
    'Board Games',
    Dices,
    'Leisure & Fun',
    ['dice', 'games', 'play', 'casino']
  ),

  // ---------- EXPENSE: Work & Education ----------
  expense(
    'education',
    'Education',
    BookOpen,
    'Work & Education',
    ['school', 'study', 'books', 'tuition']
  ),
  expense(
    'school',
    'School',
    GraduationCap,
    'Work & Education',
    ['college', 'tuition', 'university', 'fees']
  ),
  expense(
    'supplies',
    'Supplies',
    Backpack,
    'Work & Education',
    ['bag', 'school', 'stationery']
  ),
  expense('laptop', 'Gadgets', Laptop, 'Work & Education', [
    'computer',
    'tech',
    'electronics',
  ]),
  expense(
    'office',
    'Office',
    Briefcase,
    'Work & Education',
    ['work', 'business', 'job']
  ),
  expense(
    'stationery',
    'Stationery',
    Pencil,
    'Work & Education',
    ['pencil', 'office', 'school', 'supplies']
  ),

  // ---------- EXPENSE: Money & Other ----------
  expense(
    'transfer',
    'Transfer',
    ArrowDownUp,
    'Money & Other',
    ['send', 'move', 'bank', 'gcash']
  ),
  expense(
    'insurance',
    'Insurance',
    Shield,
    'Money & Other',
    ['protection', 'policy', 'coverage']
  ),
  expense(
    'protection',
    'Warranty',
    ShieldCheck,
    'Money & Other',
    ['shield', 'guarantee', 'safety']
  ),
  expense(
    'credit-card',
    'Credit Card',
    CreditCard,
    'Money & Other',
    ['card', 'payment', 'debt']
  ),
  expense('bills', 'Bills', Receipt, 'Money & Other', [
    'receipt',
    'invoice',
    'payment',
    'utilities',
  ]),
  expense(
    'charity',
    'Charity',
    HeartHandshake,
    'Money & Other',
    ['donation', 'give', 'help']
  ),
  expense('legal', 'Legal', Scale, 'Money & Other', [
    'law',
    'lawyer',
    'fees',
    'court',
  ]),
  expense(
    'emergency',
    'Emergency',
    LifeBuoy,
    'Money & Other',
    ['help', 'sos', 'urgent', 'rescue']
  ),
  expense('ellipsis', 'Other', Ellipsis, 'Money & Other', [
    'misc',
    'miscellaneous',
    'etc',
  ]),

  // ---------- INCOME: Pay & Work ----------
  income('works', 'Freelance', Briefcase, 'Pay & Work', [
    'work',
    'gig',
    'contract',
    'project',
  ]),
  income('professional', 'Salary', Landmark, 'Pay & Work', [
    'pay',
    'wage',
    'paycheck',
    'bank',
  ]),
  income('salary', 'Payday', Banknote, 'Pay & Work', [
    'cash',
    'wage',
    'income',
    'pay',
  ]),
  income(
    'paycheck',
    'Allowance',
    BadgeDollarSign,
    'Pay & Work',
    ['allowance', 'stipend', 'pocket', 'money']
  ),
  income('tips', 'Tips', HandCoins, 'Pay & Work', [
    'gratuity',
    'bonus',
    'extra',
    'cash',
  ]),
  income('wallet', 'Wallet', Wallet, 'Pay & Work', [
    'cash',
    'money',
    'funds',
  ]),
  income('cash', 'Cash', Coins, 'Pay & Work', [
    'coins',
    'money',
    'payment',
  ]),
  income(
    'pocket-money',
    'Pocket Money',
    CircleDollarSign,
    'Pay & Work',
    ['allowance', 'spending', 'cash']
  ),

  // ---------- INCOME: Business & Investing ----------
  income(
    'investment',
    'Investment',
    TrendingUp,
    'Business & Investing',
    ['stocks', 'growth', 'returns', 'profit']
  ),
  income(
    'business',
    'Business',
    Building,
    'Business & Investing',
    ['company', 'store', 'shop', 'revenue']
  ),
  income(
    'company',
    'Company',
    Building2,
    'Business & Investing',
    ['corporate', 'office', 'enterprise']
  ),
  income(
    'stocks',
    'Stocks',
    ChartCandlestick,
    'Business & Investing',
    ['trading', 'shares', 'market', 'dividends']
  ),
  income(
    'crypto',
    'Crypto',
    Bitcoin,
    'Business & Investing',
    ['bitcoin', 'trading', 'coins']
  ),
  income(
    'interest',
    'Interest',
    Percent,
    'Business & Investing',
    ['savings', 'bank', 'rate', 'yield']
  ),
  income(
    'rental',
    'Rental',
    HousePlus,
    'Business & Investing',
    ['rent', 'property', 'landlord', 'passive']
  ),
  income(
    'savings',
    'Savings',
    PiggyBank,
    'Business & Investing',
    ['piggy', 'bank', 'deposit']
  ),

  // ---------- INCOME: Gifts & Other ----------
  income('gift', 'Gift', Gift, 'Gifts & Other', [
    'present',
    'birthday',
    'reward',
  ]),
  income('bonus', 'Bonus', Trophy, 'Gifts & Other', [
    'reward',
    'prize',
    'incentive',
  ]),
  income('refund', 'Refund', Undo2, 'Gifts & Other', [
    'return',
    'cashback',
    'rebate',
    'reimbursement',
  ]),
  income('receipt', 'Rebate', Receipt, 'Gifts & Other', [
    'refund',
    'cashback',
    'claim',
  ]),
  income(
    'transfer',
    'Transfer',
    ArrowDownUp,
    'Gifts & Other',
    ['receive', 'bank', 'gcash', 'remittance']
  ),
  income(
    'exchange',
    'Exchange',
    ArrowLeftRight,
    'Gifts & Other',
    ['swap', 'convert', 'forex', 'currency']
  ),
  income(
    'support',
    'Support',
    HeartHandshake,
    'Gifts & Other',
    ['help', 'family', 'allowance', 'donation']
  ),
  income('heart', 'Allowance', Heart, 'Gifts & Other', [
    'family',
    'love',
    'gift',
    'support',
  ]),
  income('ellipsis', 'Other', Ellipsis, 'Gifts & Other', [
    'misc',
    'miscellaneous',
    'etc',
  ]),
];

export const getIconsByType = (
  type: string
): IconData[] => {
  return icons.filter(
    (icon) => icon.type.toLowerCase() === type.toLowerCase()
  );
};

export const getIconById = (
  id: string,
  type?: string
): IconData | undefined => {
  const matches = icons.filter((icon) => icon.id === id);
  if (matches.length === 0) return undefined;
  if (type) {
    const typed = matches.find(
      (icon) =>
        icon.type.toLowerCase() === type.toLowerCase()
    );
    if (typed) return typed;
  }
  return matches[0];
};

export const getIconCategories = (
  type: string
): string[] => {
  const categories: string[] = [];
  for (const icon of getIconsByType(type)) {
    if (!categories.includes(icon.category)) {
      categories.push(icon.category);
    }
  }
  return categories;
};

export interface GroupedIcons {
  category: string;
  icons: IconData[];
}

export const getGroupedIconsByType = (
  type: string
): GroupedIcons[] => {
  return getIconCategories(type).map((category) => ({
    category,
    icons: getIconsByType(type).filter(
      (icon) => icon.category === category
    ),
  }));
};

export const searchIconsByType = (
  type: string,
  query: string
): IconData[] => {
  const q = query.trim().toLowerCase();
  if (!q) return getIconsByType(type);
  return getIconsByType(type).filter((icon) => {
    const haystack = [
      icon.name,
      icon.id,
      icon.category,
      ...(icon.keywords ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return q
      .split(/\s+/)
      .every((word) => haystack.includes(word));
  });
};
