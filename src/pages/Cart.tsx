import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, products, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [coupon, setCoupon] = useState('');
  const navigate = useNavigate();

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  if (cartItems.length === 0) {
    return (
      <div className="pt-40 pb-24 text-center">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-lit-pastel w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={40} className="text-lit-purple/20" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-500 font-light mb-10">Parece que aún no has añadido ningún suplemento a tu carrito.</p>
          <Link to="/shop" className="btn-primary inline-block">Ir a la tienda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-16">Tu Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="hidden md:grid grid-cols-6 gap-4 border-b border-gray-100 pb-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">
              <div className="col-span-3">Producto</div>
              <div className="text-center">Cantidad</div>
              <div className="text-right">Precio</div>
              <div className="text-right">Total</div>
            </div>

            {cartItems.map(item => (
              <div key={`${item.productId}-${item.packId}`} className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center border-b border-gray-100 pb-8">
                <div className="col-span-1 md:col-span-3 flex gap-6">
                  <div className="w-24 h-24 bg-lit-pastel flex-shrink-0">
                    <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link to={`/product/${item.productId}`} className="font-bold text-lit-purple hover:text-lit-green transition-colors">{item.product?.name}</Link>
                    <span className="text-xs text-gray-400 mt-1">{item.product?.format}</span>
                    <button 
                      onClick={() => removeFromCart(item.productId, item.packId)}
                      className="text-[10px] uppercase tracking-widest font-bold text-red-400 mt-4 flex items-center gap-1 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.packId)} className="p-2 hover:bg-lit-pastel"><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.packId)} className="p-2 hover:bg-lit-pastel"><Plus size={12} /></button>
                  </div>
                </div>

                <div className="hidden md:block text-right text-sm font-medium text-gray-500">
                  ${item.product?.price.toFixed(2)}
                </div>

                <div className="text-right font-bold text-lit-purple">
                  ${(item.product!.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-lit-pastel p-10 sticky top-32">
              <h3 className="text-xl font-bold tracking-tight mb-8">Resumen del pedido</h3>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="text-xs uppercase tracking-widest font-bold text-lit-green">Calculado en checkout</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-lit-purple">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-10">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Cupón de descuento</label>
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="Código" 
                    className="bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none w-full"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button className="bg-lit-purple text-white px-4 py-3"><Tag size={16} /></button>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary flex items-center justify-center gap-3 py-4"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight size={18} />
              </button>

              <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-widest font-bold">
                Cierre de venta vía WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
