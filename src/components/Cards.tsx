import React from 'react';
import { Link } from 'react-router-dom';
import { Product, Pack } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, ShoppingBag } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white border border-gray-100 overflow-hidden transition-all hover:shadow-xl hover:border-lit-green/20">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-lit-pastel">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {product.badge && (
          <span className="absolute top-4 left-4 bg-lit-purple text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
            {product.badge}
          </span>
        )}
      </Link>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-widest text-lit-green font-bold">{product.category}</span>
          <span className="text-sm font-bold text-lit-purple">${product.price.toFixed(2)}</span>
        </div>
        <Link to={`/product/${product.id}`} className="block text-xl font-serif font-bold text-lit-purple mb-1 hover:text-lit-green transition-colors">
          {product.name}
        </Link>
        <p className="text-xs text-gray-400 mb-6 line-clamp-1">{product.focus}</p>
        
        <button 
          onClick={() => addToCart(product.id)}
          className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2 group-hover:bg-lit-purple group-hover:text-white"
        >
          <Plus size={16} />
          <span>Añadir al carrito</span>
        </button>
      </div>
    </div>
  );
};

export const PackCard: React.FC<{ pack: Pack }> = ({ pack }) => {
  return (
    <div className="group relative bg-lit-purple text-white overflow-hidden transition-all hover:shadow-2xl">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={pack.image} 
          alt={pack.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lit-purple via-transparent to-transparent" />
      </div>
      
      <div className="p-8 relative">
        <span className="text-[10px] uppercase tracking-[0.3em] text-lit-green font-bold mb-4 block">Ahorro Especial</span>
        <h3 className="text-3xl font-serif font-bold tracking-tight mb-3">{pack.name}</h3>
        <p className="text-sm text-gray-300 mb-8 line-clamp-2 font-light leading-relaxed">{pack.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-lit-green">${pack.price.toFixed(2)}</span>
          <Link to={`/pack/${pack.id}`} className="btn-primary bg-white text-lit-purple hover:bg-lit-green hover:text-white py-2 px-6">
            Ver Pack
          </Link>
        </div>
      </div>
    </div>
  );
};
