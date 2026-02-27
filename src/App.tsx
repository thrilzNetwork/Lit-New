import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { Promos } from './pages/Promos';
import { About } from './pages/About';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { CartProvider, useCart } from './context/CartContext';
import { X, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AppContent = () => {
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} onMenuToggle={() => setIsMenuOpen(true)} />
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-lit-purple text-white flex flex-col"
          >
            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Leaf className="text-lit-green" size={24} fill="currentColor" />
                <span className="text-2xl font-bold tracking-tighter">LIT</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 border border-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col justify-center items-center gap-8">
              {[
                { name: 'Inicio', path: '/' },
                { name: 'Tienda', path: '/shop' },
                { name: 'Packs', path: '/packs' },
                { name: 'Acerca de', path: '/about' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Contacto', path: '/contact' }
              ].map((item, i) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-bold tracking-tighter hover:text-lit-green transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="p-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4">Bienestar Premium</p>
              <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-widest">
                <span>IG</span>
                <span>FB</span>
                <span>TW</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/promos" element={<Promos />} />
          <Route path="/category/:id" element={<Shop />} />
          <Route path="/packs" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}
