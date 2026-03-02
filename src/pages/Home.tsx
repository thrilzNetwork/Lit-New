import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Pack } from '../types';
import { ProductCard, PackCard } from '../components/Cards';
import { ArrowRight, ShieldCheck, Truck, Headphones, Leaf } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';

export const Home: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // 3D Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setBestSellers(data.slice(0, 4)));
    
    fetch('/api/packs')
      .then(res => res.json())
      .then(setPacks);

    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings);
  }, []);

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/wellness/1920/1080?grayscale" 
            alt="Wellness Hero" 
            className="w-full h-full object-cover opacity-10 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-lit-green text-xs font-bold uppercase tracking-[0.4em] mb-6 block">Bienestar + Performance</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-lit-purple tracking-tighter leading-[0.9] mb-8">
              TU MEJOR <br /> <span className="text-lit-green italic">VERSIÓN</span> <br /> ES LIT.
            </h1>
            <p className="text-lit-purple/70 text-lg md:text-xl mb-10 font-light max-w-lg leading-relaxed">
              Suplementos premium diseñados en laboratorio para potenciar tu equilibrio mental y rendimiento físico.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary bg-lit-purple text-white hover:bg-lit-green px-10 py-4">
                Comprar Ahora
              </Link>
              <Link to="/promos" className="btn-secondary border-lit-purple text-lit-purple hover:bg-lit-purple hover:text-white px-10 py-4">
                Ver Promos
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full aspect-[4/3] bg-white border border-gray-100 shadow-2xl overflow-hidden group"
            >
              <img 
                src={settings?.hero_image || "https://picsum.photos/seed/wellness/1920/1080?grayscale"} 
                alt="Promo Hero" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div 
                style={{ transform: "translateZ(50px)" }}
                className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0"
              >
                <span className="text-[10px] uppercase tracking-widest font-bold mb-2 block">Nueva Promoción</span>
                <h3 className="text-2xl font-serif font-bold">Descubre el Equilibrio</h3>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-20">
          <div className="flex items-center gap-3 text-lit-purple/40">
            <Truck size={20} className="text-lit-green" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Envío Nacional</span>
          </div>
          <div className="flex items-center gap-3 text-lit-purple/40">
            <Headphones size={20} className="text-lit-green" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Asesoría Humana</span>
          </div>
          <div className="flex items-center gap-3 text-lit-purple/40">
            <ShieldCheck size={20} className="text-lit-green" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Calidad Premium</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter mb-4">Encuentra tu objetivo</h2>
            <div className="w-20 h-1 bg-lit-green mx-auto" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Bienestar Femenino', img: 'https://picsum.photos/seed/fem/600/600' },
              { name: 'Mente y Enfoque', img: 'https://picsum.photos/seed/mind/600/600' },
              { name: 'Detox y Digestión', img: 'https://picsum.photos/seed/detox/600/600' },
              { name: 'Definición', img: 'https://picsum.photos/seed/fit/600/600' },
            ].map((cat, i) => (
              <Link key={i} to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`} className="group relative aspect-square overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-lit-purple/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <span className="text-white font-bold uppercase tracking-widest text-xs md:text-sm">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-lit-green text-[10px] font-bold uppercase tracking-widest mb-2 block">Los más buscados</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter">Best Sellers</h2>
            </div>
            <Link to="/shop" className="text-xs uppercase font-bold tracking-widest flex items-center gap-2 hover:text-lit-green transition-colors">
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Packs Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-lit-green text-[10px] font-bold uppercase tracking-widest mb-2 block">Ahorra en conjunto</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter">Packs Recomendados</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packs.map(pack => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      </section>

      {/* About Mini */}
      <section className="py-24 bg-white text-lit-purple overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-lit-green/5 rounded-full blur-3xl" />
            <span className="text-lit-green text-xs font-bold uppercase tracking-[0.4em] mb-6 block">Nuestra Filosofía</span>
            <h2 className="text-4xl md:text-7xl font-serif font-bold tracking-tighter leading-tight mb-8">
              Ingredientes naturales, <br /> <span className="italic text-lit-green">enfoque premium.</span>
            </h2>
            <p className="text-lit-purple/60 text-lg font-light leading-relaxed mb-10">
              En Laboratorios LIT creemos que el bienestar no debe ser complicado. Utilizamos ciencia aplicada e ingredientes de la más alta pureza para crear soluciones que se adaptan a tu ritmo de vida.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/about" className="btn-primary bg-lit-purple text-white hover:bg-lit-green">Conócenos</Link>
              <button 
                onClick={async () => {
                  await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ source: 'home', interest: 'Asesoría desde Home' })
                  });
                  window.open('https://wa.me/59178299604?text=Hola,%20necesito%20asesoría%20con%20los%20productos%20LIT', '_blank');
                }}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-lit-green transition-colors">
                  <Headphones size={20} className="text-lit-green" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">Habla con un asesor</span>
              </button>
            </div>
          </div>
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-lit-pastel overflow-hidden">
            <img 
              src="https://picsum.photos/seed/lab/800/1000?grayscale" 
              alt="Lab" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
