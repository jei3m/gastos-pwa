import { Home, Utensils, Car, ShoppingBag, Film, Heart, BookOpen, DollarSign, Gift, Plane, Zap, HomeIcon, Shield, CreditCard, TrendingUp, Package, SquareDashed, Building, Coins, PiggyBank, Wallet, Receipt, Briefcase, Phone, Gamepad, Palette, Shirt, Dumbbell, Syringe, Wrench, UtensilsCrossed, Coffee, Baby, GraduationCap, Landmark, Ticket, ShoppingCart, Stethoscope, HeartPulse, Scale } from 'lucide-react';

// Define a type for our icon keys
export type IconKey = keyof typeof icons;

// Map of icon names to their components
export const icons = {
	home: Home,
	food: Utensils,
	car: Car,
	shopping: ShoppingBag,
	entertainment: Film,
	health: Heart,
	education: BookOpen,
	salary: DollarSign,
	gift: Gift,
	travel: Plane,
	utilities: Zap,
	rent: HomeIcon,
	insurance: Shield,
	loan: CreditCard,
	investment: TrendingUp,
	other: Package,
	business: Building,
	savings: PiggyBank,
	cash: Coins,
	wallet: Wallet,
	receipt: Receipt,
	works: Briefcase,
	phone: Phone,
	games: Gamepad,
	hobbies: Palette,
	clothing: Shirt,
	fitness: Dumbbell,
	medical: Stethoscope,
	healthcare: HeartPulse,
	legal: Scale,
	professional: Landmark,
	tickets: Ticket,
	coffee: Coffee,
	graduation: GraduationCap,
	repairs: Wrench,
	doctor: Syringe,
};

// Export the icon keys for use in type checking
export const iconKeys = Object.keys(icons) as IconKey[];