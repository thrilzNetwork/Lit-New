import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tag, ShoppingBag, ArrowRight, Percent, Gift, Sparkles } from 'lucide-react';
import { Promo } from '../types';

export const Promos: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promos')
      .then(res => res.json())
      .then(data => {
        setPromos(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-40 text-center bg-white min-h-screen">Cargando promociones...</div>;

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-lit-purple font-bold mb-4 block">Ofertas Exclusivas</span>
          <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-6 leading-none">Promociones <span className="text-lit-green italic">LIT</span></h1>
          <p className="text-lit-purple/50 max-w-2xl mx-auto font-light text-lg">Aprovecha nuestros descuentos especiales y packs diseñados para potenciar tu bienestar al mejor precio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-100 p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 text-lit-purple/5 group-hover:text-lit-purple/10 transition-colors">
                <Percent size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-lit-purple text-white flex items-center justify-center rounded-full">
                    <Tag size={24} />
                  </div>
                  <span className="bg-lit-green text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Activo</span>
                </div>
                
                <h2 className="text-3xl font-bold tracking-tighter mb-4">{promo.title}</h2>
                <p className="text-lit-purple/50 mb-8 font-light leading-relaxed">{promo.description}</p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="bg-lit-pastel border-2 border-dashed border-gray-200 px-6 py-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Código de Cupón</span>
                    <span className="text-xl font-bold tracking-widest text-lit-purple">{promo.code}</span>
                  </div>
                  <div className="text-4xl font-bold tracking-tighter text-lit-green">
                    {promo.discount}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Static Promo Banners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-lit-purple text-white p-10 relative overflow-hidden md:col-span-2"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold tracking-tighter mb-4">Envío Gratis en Pedidos Superiores a $100</h2>
                <p className="text-white/70 font-light">No necesitas cupón. El descuento se aplica automáticamente al superar el monto en tu carrito.</p>
              </div>
              <Link to="/shop" className="bg-lit-green text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-lit-purple transition-all">
                Ir a la Tienda
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
