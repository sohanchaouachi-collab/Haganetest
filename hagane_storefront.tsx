import React, { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, ShoppingBag, Menu, X, ChevronRight, 
  Minus, Plus, Shield, Wrench, RotateCcw, ArrowRight,
  Flame, Ruler, Disc, GripHorizontal
} from 'lucide-react';

// ==========================================
// 1. TYPES & INTERFACES (types/index.ts)
// ==========================================

export interface Product {
  id: string;
  name: string;
  japaneseName: string;
  price: number;
  type: 'Gyuto' | 'Santoku' | 'Nakiri' | 'Petty' | 'Sujihiki';
  steelType: string;
  hrc: string;
  handleMaterial: string;
  bladeLength: number; // in mm
  imageUrls: string[];
  inStock: boolean;
  description: string;
  bestFor: ('Meat' | 'Vegetables' | 'Fish' | 'Everything')[];
  maintenance: 'High' | 'Low';
  gripStyle: 'Pinch' | 'Handle';
}

interface CartItem extends Product {
  quantity: number;
}

// ==========================================
// 2. MOCK DATABASE (lib/mockData.ts)
// ==========================================

export const mockKnives: Product[] = [
  {
    id: 'k-01',
    name: 'Kurokage Master Gyuto',
    japaneseName: '黒影 牛刀',
    price: 320,
    type: 'Gyuto',
    steelType: 'Aogami Super (Blue Carbon)',
    hrc: '63-64',
    handleMaterial: 'Octagonal Roasted Walnut',
    bladeLength: 210,
    imageUrls: [
      'https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    description: 'Forged by Master Hideo in Seki, the Kurokage (Black Shadow) features a raw Kurouchi finish that prevents food from sticking. The Aogami Super core provides a screaming sharp edge that lasts months in a professional kitchen.',
    bestFor: ['Everything', 'Meat'],
    maintenance: 'High',
    gripStyle: 'Pinch'
  },
  {
    id: 'k-02',
    name: 'Tsunami Damascus Santoku',
    japaneseName: '津波 三徳',
    price: 250,
    type: 'Santoku',
    steelType: 'VG-10 Stainless',
    hrc: '60-61',
    handleMaterial: 'D-Shape Ebony Wood',
    bladeLength: 165,
    imageUrls: [
      'https://images.unsplash.com/photo-1614362806509-373db7a6bd56?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    description: 'The Tsunami features 67 layers of Damascus steel folded over a highly durable VG-10 core. Perfectly balanced for the home cook who wants premium performance without the maintenance of carbon steel.',
    bestFor: ['Everything', 'Vegetables'],
    maintenance: 'Low',
    gripStyle: 'Handle'
  },
  {
    id: 'k-03',
    name: 'Shiroi Kiri Nakiri',
    japaneseName: '白い霧 菜切',
    price: 285,
    type: 'Nakiri',
    steelType: 'Shirogami #2 (White Carbon)',
    hrc: '62-63',
    handleMaterial: 'Octagonal Ho Wood (Magnolia)',
    bladeLength: 180,
    imageUrls: [
      'https://images.unsplash.com/photo-1589533610925-1c8c53fd97e9?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    description: 'A pure vegetable destroyer. The razor-thin Shirogami blade drops through dense root vegetables with zero wedging. Requires immediate wiping after use to develop a beautiful blue patina.',
    bestFor: ['Vegetables'],
    maintenance: 'High',
    gripStyle: 'Pinch'
  },
  {
    id: 'k-04',
    name: 'Ronin Petty Utility',
    japaneseName: '浪人 ペティ',
    price: 140,
    type: 'Petty',
    steelType: 'SG2 Powdered High-Speed Steel',
    hrc: '64',
    handleMaterial: 'Western Micarta',
    bladeLength: 135,
    imageUrls: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    description: 'For delicate, in-hand work. Peeling, paring, and precision slicing. The SG2 steel maintains its edge nearly twice as long as traditional stainless alloys.',
    bestFor: ['Everything', 'Meat', 'Vegetables'],
    maintenance: 'Low',
    gripStyle: 'Handle'
  },
  {
    id: 'k-05',
    name: 'Ocean Sujihiki Slicer',
    japaneseName: '海 筋引',
    price: 390,
    type: 'Sujihiki',
    steelType: 'Ginsan (Silver-3 Stainless)',
    hrc: '61',
    handleMaterial: 'Octagonal Wenge Wood',
    bladeLength: 270,
    imageUrls: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: true,
    description: 'The ultimate carving knife. Long, elegant, and designed to slice through large cuts of meat or fish in a single, clean draw without tearing the cellular structure.',
    bestFor: ['Meat', 'Fish'],
    maintenance: 'Low',
    gripStyle: 'Pinch'
  },
  {
    id: 'k-06',
    name: 'Akuma Heavy Gyuto',
    japaneseName: '悪魔 牛刀',
    price: 410,
    type: 'Gyuto',
    steelType: 'Aogami #1 (Blue Carbon)',
    hrc: '65',
    handleMaterial: 'Custom Buffalo Horn & Ironwood',
    bladeLength: 240,
    imageUrls: [
      'https://images.unsplash.com/photo-1621217646197-8c1055740fcb?q=80&w=1000&auto=format&fit=crop'
    ],
    inStock: false,
    description: 'A heavyweight workhorse for demanding professionals. Insanely hard, requiring excellent knife skills to avoid chipping. Not for the faint of heart.',
    bestFor: ['Meat', 'Everything'],
    maintenance: 'High',
    gripStyle: 'Pinch'
  }
];

// ==========================================
// 3. GLOBAL CART STATE (store/useCartStore.ts)
// ==========================================

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  toggleCartDrawer: () => void;
  cartTotal: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  addItem: (product) => set((state) => {
    const existing = state.items.find((item) => item.id === product.id);
    if (existing) {
      return { items: state.items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i), isDrawerOpen: true };
    }
    return { items: [...state.items, { ...product, quantity: 1 }], isDrawerOpen: true };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id)
  })),
  updateQuantity: (id, qty) => set((state) => ({
    items: qty === 0 
      ? state.items.filter((i) => i.id !== id)
      : state.items.map((i) => i.id === id ? { ...i, quantity: qty } : i)
  })),
  toggleCartDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  cartTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));

// ==========================================
// COMPONENTS & LAYOUT 
// ==========================================

// Global Router State for SPA
type Route = { page: 'home' } | { page: 'product', id: string } | { page: 'quiz' };

const TopBanner = () => (
  <div className="bg-zinc-100 text-zinc-950 text-xs md:text-sm font-medium py-2 px-4 text-center tracking-wide">
    Hand-forged in Seki, Japan. Free international shipping over $200.
  </div>
);

const Navbar = ({ navigate }: { navigate: (r: Route) => void }) => {
  const { items, toggleCartDrawer } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${isScrolled ? 'bg-zinc-950/95 backdrop-blur-md border-zinc-800 py-3 mt-0' : 'bg-transparent border-transparent py-5 mt-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(true)} className="text-white p-2">
                <Menu size={24} />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 md:flex-none text-center md:text-left cursor-pointer" onClick={() => navigate({ page: 'home' })}>
              <h1 className="text-2xl font-serif font-bold text-white tracking-widest uppercase">
                Hagane <span className="font-sans font-light text-xl text-zinc-400">鋼</span>
              </h1>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-8 items-center">
              {['Gyuto', 'Santoku', 'Sets', 'Sharpening'].map(link => (
                <button key={link} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors uppercase tracking-widest">
                  {link}
                </button>
              ))}
              <button onClick={() => navigate({ page: 'quiz' })} className="text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest border-b border-amber-500/30">
                Find Your Knife
              </button>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button className="text-white hover:text-zinc-300 hidden sm:block"><Search size={20} /></button>
              <button className="text-white hover:text-zinc-300 hidden sm:block"><User size={20} /></button>
              <button onClick={toggleCartDrawer} className="text-white hover:text-zinc-300 relative p-2">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-zinc-950 bg-white rounded-full translate-x-1 -translate-y-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 bg-zinc-950 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-serif font-bold text-white tracking-widest uppercase">Hagane 鋼</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2"><X size={28} /></button>
            </div>
            <div className="flex flex-col space-y-6 text-xl uppercase tracking-widest font-serif">
              {['Gyuto', 'Santoku', 'Sets', 'Sharpening'].map(link => (
                <button key={link} className="text-left text-zinc-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  {link}
                </button>
              ))}
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate({ page: 'quiz' }); }} 
                className="text-left text-amber-500 font-bold"
              >
                Find Your Knife
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CartDrawer = () => {
  const { items, isDrawerOpen, toggleCartDrawer, updateQuantity, cartTotal } = useCartStore();
  const total = cartTotal();
  const SHIPPING_THRESHOLD = 200;
  const progress = Math.min((total / SHIPPING_THRESHOLD) * 100, 100);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleCartDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-serif text-white tracking-wider uppercase">Your Cart</h2>
              <button onClick={toggleCartDrawer} className="text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            {/* Shipping Progress - CRO Element */}
            <div className="bg-zinc-900/50 p-6 border-b border-zinc-800">
              <p className="text-sm text-zinc-300 font-medium mb-3 text-center">
                {total >= SHIPPING_THRESHOLD 
                  ? "🎉 You unlocked Free International Shipping!" 
                  : `You are $${(SHIPPING_THRESHOLD - total).toFixed(2)} away from free shipping!`}
              </p>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <ShoppingBag size={48} opacity={0.2} />
                  <p className="uppercase tracking-widest text-sm">Your cart is empty.</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-24 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-white font-medium">{item.name}</h3>
                        <p className="text-xs text-zinc-500">{item.japaneseName}</p>
                        <p className="text-white font-medium mt-1">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-3 bg-zinc-900 w-fit rounded-md border border-zinc-800">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-zinc-400 hover:text-white"><Minus size={14} /></button>
                        <span className="text-sm font-medium text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-zinc-400 hover:text-white"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout CTA */}
            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-800 bg-zinc-950">
                <div className="flex justify-between text-white font-medium mb-4">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button className="w-full bg-white text-zinc-950 font-bold uppercase tracking-wider py-4 rounded hover:bg-zinc-200 transition-colors active:scale-95 flex items-center justify-center">
                  Checkout <ChevronRight className="ml-2" size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProductCard = ({ product, navigate }: { product: Product, navigate: (r: Route) => void }) => {
  const addItem = useCartStore(state => state.addItem);

  return (
    <div className="group cursor-pointer flex flex-col" onClick={() => navigate({ page: 'product', id: product.id })}>
      <div className="relative aspect-square overflow-hidden bg-zinc-900 mb-4 flex items-center justify-center">
        <img 
          src={product.imageUrls[0]} 
          alt={product.name} 
          className="w-[80%] h-[80%] object-cover object-center mix-blend-lighten transition-transform duration-700 group-hover:scale-105"
        />
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); addItem(product); }}
            className="w-full bg-white/90 backdrop-blur text-black font-bold py-3 text-sm uppercase tracking-wider hover:bg-white transition-colors"
          >
            Quick Add
          </button>
        </div>
        {!product.inStock && (
          <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Sold Out
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-medium text-lg font-serif">{product.name}</h3>
          <p className="text-zinc-500 text-sm font-serif">{product.japaneseName}</p>
        </div>
        <span className="text-white font-medium">${product.price}</span>
      </div>
      <p className="text-zinc-400 text-sm mt-2">{product.steelType}</p>
    </div>
  );
};

// ==========================================
// PAGES 
// ==========================================

const HomePage = ({ navigate }: { navigate: (r: Route) => void }) => {
  const bestsellers = mockKnives.slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* 1. Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          {/* Simulated Damascus Steel Background using CSS radial gradients and an image overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 to-zinc-950 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1590483863459-7157bc2de49a?q=80&w=2000&auto=format&fit=crop" 
            alt="Forged Steel" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity grayscale"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-tight leading-tight"
          >
            Mastery in <br className="hidden md:block"/> Every Slice.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-zinc-300 font-light max-w-2xl mx-auto mb-10 tracking-wide"
          >
            Hand-forged by multi-generational artisans in Seki City, Japan. Premium carbon and stainless steel culinary tools.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button 
              onClick={() => {
                document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white text-zinc-950 px-8 py-4 font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform active:scale-95"
            >
              Shop the Collection
            </button>
            <button 
              onClick={() => navigate({ page: 'quiz' })}
              className="w-full sm:w-auto bg-transparent border border-white text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors active:scale-95"
            >
              Find Your Perfect Knife
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="border-y border-zinc-800 bg-zinc-950 py-6 overflow-hidden">
        <div className="flex whitespace-nowrap opacity-50 grayscale select-none">
          <motion.div 
            animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            className="flex space-x-16 items-center"
          >
            {/* Repeating for seamless loop */}
            {[...Array(2)].fill(["Michelin Chef Daily", "The Culinary Institute", "Gastronomy Weekly", "Bon Appétit Pro", "Tokyo Knife Guild"]).flat().map((name, i) => (
              <span key={i} className="text-zinc-400 font-serif text-xl tracking-widest uppercase">{name}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Bestsellers Grid */}
      <section id="bestsellers" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">Heritage Collection</h2>
            <p className="text-zinc-400">Our most sought-after blades.</p>
          </div>
          <button className="hidden sm:flex items-center text-sm font-bold text-white uppercase tracking-widest hover:text-zinc-300 transition-colors group">
            View All <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
          {bestsellers.map(product => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* 4. Educational Hook */}
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">Carbon vs. Stainless:<br/>The Artisan's Choice.</h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed font-light">
              True Japanese mastery lies in high-carbon steel (Shirogami and Aogami). It achieves a level of sharpness impossible with standard western stainless, slicing through cellular structures without bruising ingredients. The trade-off? It requires immediate drying and develops a unique, living patina over time.
            </p>
            <button className="text-white font-bold uppercase tracking-widest border-b border-white pb-1 hover:text-zinc-300 hover:border-zinc-300 transition-colors">
              Read the full guide
            </button>
          </div>
          <div className="lg:w-1/2 w-full aspect-video bg-zinc-950 relative overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1200&auto=format&fit=crop" 
              alt="Knife sharpening" 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center bg-zinc-950/30 backdrop-blur cursor-pointer hover:bg-white hover:text-black transition-colors">
                 <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-current border-b-[8px] border-b-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductDisplayPage = ({ id, navigate }: { id: string, navigate: (r: Route) => void }) => {
  const product = mockKnives.find(k => k.id === id);
  const addItem = useCartStore(state => state.addItem);
  
  if (!product) return <div className="min-h-screen text-white pt-32 text-center">Product not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 pt-28 pb-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-8 flex items-center space-x-2">
          <span className="cursor-pointer hover:text-white" onClick={() => navigate({ page: 'home' })}>Home</span>
          <span>/</span>
          <span>{product.type}</span>
          <span>/</span>
          <span className="text-zinc-300">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left: Media (Sticky on Desktop) */}
          <div className="relative">
            <div className="lg:sticky lg:top-32 space-y-4">
              <div className="aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center">
                <img 
                  src={product.imageUrls[0]} 
                  alt={product.name} 
                  className="w-[90%] h-[90%] object-cover mix-blend-lighten"
                />
              </div>
              {product.imageUrls.length > 1 && (
                <div className="flex gap-4">
                  {product.imageUrls.map((url, idx) => (
                    <div key={idx} className="w-20 h-20 bg-zinc-900 border hover:border-white border-transparent cursor-pointer transition-colors p-2 flex items-center justify-center">
                       <img src={url} alt={`${product.name} detail ${idx}`} className="w-full h-full object-cover mix-blend-lighten" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details & Purchase Intent */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">{product.name}</h1>
            <p className="text-2xl font-serif text-zinc-500 mb-6">{product.japaneseName}</p>
            
            <div className="text-3xl font-medium text-white mb-2">${product.price}</div>
            
            {/* Klarna / ShopPay Split */}
            <p className="text-zinc-400 text-sm mb-8">
              or 4 interest-free payments of ${(product.price / 4).toFixed(2)} with <span className="font-semibold text-white">ShopPay</span>
            </p>

            {/* Urgency Hook */}
            {product.inStock && (
              <div className="flex items-center text-amber-500 text-sm font-medium mb-8 bg-amber-500/10 w-fit px-4 py-2 rounded-full border border-amber-500/20">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                🔥 High Demand: 3 sold in the last 2 hours.
              </div>
            )}

            <p className="text-zinc-300 text-base leading-relaxed mb-10 font-light">
              {product.description}
            </p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 border-y border-zinc-800 py-8">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center"><Flame size={14} className="mr-1.5"/> Steel Type</span>
                <span className="text-white text-sm font-medium">{product.steelType}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center"><Disc size={14} className="mr-1.5"/> Hardness</span>
                <span className="text-white text-sm font-medium">{product.hrc} HRC</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center"><Ruler size={14} className="mr-1.5"/> Blade Length</span>
                <span className="text-white text-sm font-medium">{product.bladeLength} mm</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500 uppercase tracking-widest mb-2 flex items-center"><GripHorizontal size={14} className="mr-1.5"/> Handle</span>
                <span className="text-white text-sm font-medium">{product.handleMaterial}</span>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block mb-8">
              <button 
                disabled={!product.inStock}
                onClick={() => addItem(product)}
                className={`w-full py-5 text-lg font-bold uppercase tracking-widest transition-all ${
                  product.inStock 
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.98]' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? `Add to Cart - $${product.price}` : 'Sold Out'}
              </button>
            </div>

            {/* Value Props */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center text-zinc-400 text-sm">
                <Shield size={18} className="mr-3 text-zinc-500" /> Lifetime Heritage Warranty
              </div>
              <div className="flex items-center text-zinc-400 text-sm">
                <Wrench size={18} className="mr-3 text-zinc-500" /> Free Sharpening for 1 Year
              </div>
              <div className="flex items-center text-zinc-400 text-sm">
                <RotateCcw size={18} className="mr-3 text-zinc-500" /> 30-Day Performance Guarantee
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-40 md:hidden pb-safe">
        <button 
          disabled={!product.inStock}
          onClick={() => addItem(product)}
          className={`w-full py-4 text-base font-bold uppercase tracking-widest transition-all ${
            product.inStock 
            ? 'bg-white text-zinc-950 active:scale-[0.98]' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {product.inStock ? `Add to Cart - $${product.price}` : 'Sold Out'}
        </button>
      </div>
    </div>
  );
};

const KnifeSelector = ({ navigate }: { navigate: (r: Route) => void }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ target: '', maintenance: '', grip: '' });
  const addItem = useCartStore(state => state.addItem);

  const handleAnswer = (key: string, val: string) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    setTimeout(() => setStep(s => s + 1), 300); // Small delay for UX feel
  };

  const recommendedKnife = useMemo(() => {
    if (step < 4) return null;
    // Simple Recommendation Algorithm
    let scores = mockKnives.map(knife => {
      let score = 0;
      if (knife.bestFor.includes(answers.target as any)) score += 3;
      if (knife.maintenance === answers.maintenance) score += 2;
      if (knife.gripStyle === answers.grip) score += 1;
      return { knife, score };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores[0].knife;
  }, [step, answers]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-24">
      <div className="w-full max-w-2xl relative">
        
        {/* Progress */}
        {step < 4 && (
           <div className="mb-12 flex justify-center space-x-2">
             {[1, 2, 3].map(i => (
               <div key={i} className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${step >= i ? 'bg-amber-500' : 'bg-zinc-800'}`} />
             ))}
           </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-3xl font-serif text-white mb-8">What are you cutting mostly?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Meat', 'Vegetables', 'Fish', 'Everything'].map(opt => (
                  <button key={opt} onClick={() => handleAnswer('target', opt)} className="p-6 border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-white transition-all text-lg font-medium tracking-wide">
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-3xl font-serif text-white mb-4">How much maintenance are you comfortable with?</h2>
              <p className="text-zinc-500 mb-8">Carbon steel holds a sharper edge but can rust if left wet.</p>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleAnswer('maintenance', 'High')} className="p-6 border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-white transition-all text-left flex flex-col">
                  <span className="text-lg font-medium mb-1">I'll wipe it down immediately (Carbon Steel)</span>
                  <span className="text-sm text-zinc-500">Ultimate sharpness, develops a patina.</span>
                </button>
                <button onClick={() => handleAnswer('maintenance', 'Low')} className="p-6 border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-white transition-all text-left flex flex-col">
                  <span className="text-lg font-medium mb-1">I prefer low maintenance (Stainless Steel)</span>
                  <span className="text-sm text-zinc-500">Forgiving, rust-resistant, great for busy kitchens.</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-3xl font-serif text-white mb-8">How do you hold your knife?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => handleAnswer('grip', 'Pinch')} className="p-6 border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-white transition-all text-left flex flex-col items-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full mb-4 flex items-center justify-center border border-zinc-700">🔪</div>
                  <span className="text-lg font-medium text-center">Pinch Grip</span>
                  <span className="text-sm text-zinc-500 text-center mt-2">Pinching the blade base. Best for Japanese octagonal handles.</span>
                </button>
                <button onClick={() => handleAnswer('grip', 'Handle')} className="p-6 border border-zinc-800 text-zinc-300 hover:border-amber-500 hover:text-white transition-all text-left flex flex-col items-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full mb-4 flex items-center justify-center border border-zinc-700">✊</div>
                  <span className="text-lg font-medium text-center">Handle Grip</span>
                  <span className="text-sm text-zinc-500 text-center mt-2">Holding only the handle. Best for contoured Western handles.</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && recommendedKnife && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <span className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 block">Your Perfect Match</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-2">{recommendedKnife.name}</h2>
              <p className="text-xl font-serif text-zinc-500 mb-8">{recommendedKnife.japaneseName}</p>
              
              <div className="relative aspect-video bg-zinc-900 w-full mb-8 overflow-hidden flex items-center justify-center border border-zinc-800">
                 <img src={recommendedKnife.imageUrls[0]} alt={recommendedKnife.name} className="w-[80%] object-contain mix-blend-lighten drop-shadow-2xl"/>
              </div>
              
              <p className="text-zinc-300 text-lg mb-8 max-w-lg mx-auto">
                Based on your needs for cutting <span className="text-white font-medium">{answers.target.toLowerCase()}</span>, preference for <span className="text-white font-medium">{answers.maintenance.toLowerCase()} maintenance</span>, and <span className="text-white font-medium">{answers.grip.toLowerCase()} grip</span>, this is the blade you've been looking for.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => { addItem(recommendedKnife); useCartStore.getState().toggleCartDrawer(); }}
                  className="w-full sm:w-auto bg-amber-500 text-zinc-950 px-8 py-4 font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors"
                >
                  Add to Cart - ${recommendedKnife.price}
                </button>
                <button 
                  onClick={() => navigate({ page: 'product', id: recommendedKnife.id })}
                  className="w-full sm:w-auto bg-transparent border border-zinc-700 text-white px-8 py-4 font-bold uppercase tracking-widest hover:border-white transition-colors"
                >
                  View Details
                </button>
              </div>
              
              <button onClick={() => { setStep(1); setAnswers({ target: '', maintenance: '', grip: '' }); }} className="mt-8 text-zinc-500 hover:text-white text-sm uppercase tracking-widest underline underline-offset-4">
                Retake Quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// ROOT APP ENTRY
// ==========================================

export default function App() {
  const [route, setRoute] = useState<Route>({ page: 'home' });

  // Custom client-side routing to maintain the strict single-file system requirement
  const navigate = (newRoute: Route) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRoute(newRoute);
  };

  return (
    <div className="font-sans text-zinc-50 bg-zinc-950 min-h-screen selection:bg-amber-500 selection:text-zinc-950">
      <TopBanner />
      <Navbar navigate={navigate} />
      <CartDrawer />
      
      <main>
        {route.page === 'home' && <HomePage navigate={navigate} />}
        {route.page === 'product' && <ProductDisplayPage id={route.id} navigate={navigate} />}
        {route.page === 'quiz' && <KnifeSelector navigate={navigate} />}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p className="uppercase tracking-widest font-serif">Hagane 鋼 © 2026</p>
        <p className="mt-2 text-xs">Forged with precision. Not a real store.</p>
      </footer>
    </div>
  );
}