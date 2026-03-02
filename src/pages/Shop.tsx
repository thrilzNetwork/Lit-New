import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/Cards';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('Relevancia');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  useEffect(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );

    if (category !== 'Todos') {
      result = result.filter(p => p.category === category);
    }

    if (sortBy === 'Precio: Menor a Mayor') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Precio: Mayor a Menor') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Nuevos') {
      // Placeholder for newness
      result.reverse();
    }

    setFilteredProducts(result);
  }, [search, category, sortBy, products]);

  const categories = ['Todos', 'Bienestar femenino', 'Mente y enfoque', 'Relajación y equilibrio', 'Detox y digestión', 'Definición', 'Salud ósea y articulaciones', 'Antioxidantes y longevidad'];

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl md:text-7xl font-serif font-bold tracking-tighter mb-4">Tienda Completa</h1>
          <p className="text-lit-purple/50 font-light max-w-2xl leading-relaxed">Explora nuestra gama de suplementos premium diseñados en laboratorio para potenciar tu rendimiento físico y equilibrio mental.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-10">
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
                <Search size={14} /> Buscar
              </h4>
              <input 
                type="text" 
                placeholder="¿Qué buscas?" 
                className="input-lit text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
                <SlidersHorizontal size={14} /> Categorías
              </h4>
              <div className="space-y-3">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`block text-sm transition-colors hover:text-lit-green ${category === cat ? 'text-lit-green font-bold' : 'text-gray-500'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-6">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                Mostrando {filteredProducts.length} productos
              </span>
              
              <div className="relative group">
                <button className="text-xs uppercase tracking-widest font-bold flex items-center gap-2 border border-gray-200 px-4 py-2 hover:border-lit-purple transition-colors">
                  Ordenar por: {sortBy} <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 w-48">
                  {['Relevancia', 'Nuevos', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor'].map(option => (
                    <button 
                      key={option}
                      onClick={() => setSortBy(option)}
                      className="block w-full text-left px-4 py-3 text-xs hover:bg-lit-pastel transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-400 italic">No se encontraron productos que coincidan con tu búsqueda.</p>
                <button onClick={() => {setSearch(''); setCategory('Todos');}} className="mt-4 text-lit-purple font-bold underline uppercase tracking-widest text-xs">Ver todo el catálogo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
