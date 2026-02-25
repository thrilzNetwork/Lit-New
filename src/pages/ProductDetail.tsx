import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Minus, ShoppingBag, Truck, ShieldCheck, RotateCcw, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('beneficios');
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProduct(data.find((p: Product) => p.id === id) || null));
  }, [id]);

  if (!product) return <div className="pt-40 text-center">Cargando...</div>;

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-12">
          <Link to="/" className="hover:text-lit-purple">Inicio</Link>
          <ChevronRight size={10} />
          <Link to="/shop" className="hover:text-lit-purple">Tienda</Link>
          <ChevronRight size={10} />
          <span className="text-lit-purple">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-lit-pastel overflow-hidden border border-gray-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-lit-pastel border border-gray-100 cursor-pointer hover:border-lit-green transition-colors">
                  <img 
                    src={`https://picsum.photos/seed/${product.id}${i}/400/400`} 
                    alt={`${product.name} ${i}`} 
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-lit-green">{product.category}</span>
                {product.badge && (
                  <span className="bg-lit-purple text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                    {product.badge}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter text-lit-purple mb-4">{product.name}</h1>
              <p className="text-lg text-gray-500 font-light mb-6">{product.focus}</p>
              <div className="text-3xl font-bold text-lit-purple mb-8">${product.price.toFixed(2)}</div>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="flex items-center border border-gray-200">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-lit-pastel transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-lit-pastel transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => addToCart(product.id, quantity)}
                  className="flex-1 btn-primary flex items-center justify-center gap-3 py-4"
                >
                  <ShoppingBag size={20} />
                  <span>Añadir al carrito</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-8">
                <div className="text-center">
                  <Truck size={20} className="mx-auto mb-2 text-lit-green" />
                  <span className="text-[10px] uppercase tracking-widest font-bold block">Envío Rápido</span>
                </div>
                <div className="text-center">
                  <ShieldCheck size={20} className="mx-auto mb-2 text-lit-green" />
                  <span className="text-[10px] uppercase tracking-widest font-bold block">Calidad LIT</span>
                </div>
                <div className="text-center">
                  <RotateCcw size={20} className="mx-auto mb-2 text-lit-green" />
                  <span className="text-[10px] uppercase tracking-widest font-bold block">Garantía</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-1">
              <div className="flex border-b border-gray-100 mb-8">
                {['beneficios', 'uso', 'ingredientes'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-xs uppercase tracking-widest font-bold transition-all relative ${activeTab === tab ? 'text-lit-purple' : 'text-gray-400'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-lit-purple" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                {activeTab === 'beneficios' && (
                  <ul className="space-y-4">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-light">
                        <div className="w-1.5 h-1.5 bg-lit-green rounded-full mt-1.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'uso' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2">Formato</h4>
                      <p className="text-sm text-gray-600 font-light">{product.format} ({product.specs})</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2">Modo de uso</h4>
                      <p className="text-sm text-gray-600 font-light leading-relaxed">{product.usage}</p>
                    </div>
                  </div>
                )}
                {activeTab === 'ingredientes' && (
                  <div className="bg-lit-pastel p-6 border border-gray-100">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 font-bold">Ingredientes Principales</td>
                          <td className="py-3 text-right text-gray-600">{product.ingredients}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 font-bold">Pureza</td>
                          <td className="py-3 text-right text-gray-600">Grado Laboratorio</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold">Origen</td>
                          <td className="py-3 text-right text-gray-600">Seleccionado Premium</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cross-sell Placeholder */}
        <div className="pt-24 border-t border-gray-100">
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tighter mb-12">Combínalo con...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <p className="text-gray-400 italic">Cargando recomendaciones...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
