import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Order, Settings } from '../types';
import { ArrowLeft, MessageCircle, Truck, Store, ChevronRight } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, products, cartTotal, clearCart } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_method: 'Envío' as 'Envío' | 'Retiro',
    address: '',
    city: '',
    state: '',
    postal: '',
    notes: ''
  });
  const [leadCreated, setLeadCreated] = useState(false);

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  // Trigger lead creation when user starts filling info
  useEffect(() => {
    if (!leadCreated && (formData.customer_name || formData.customer_phone)) {
      const timer = setTimeout(() => {
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.customer_name,
            phone: formData.customer_phone,
            email: formData.customer_email,
            source: 'checkout',
            interest: cartItems.map(i => i.product?.name).join(', ')
          })
        });
        setLeadCreated(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formData, leadCreated, cartItems]);

  const shippingFee = formData.delivery_method === 'Envío' ? parseFloat(settings?.shipping_fee || '10') : 0;
  const total = cartTotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateOrderId = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `LIT-${date}-${random}`;
  };

  const handleSubmit = async () => {
    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      date: new Date().toLocaleString('es-AR'),
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email,
      delivery_method: formData.delivery_method,
      address: formData.delivery_method === 'Envío' ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.postal}` : 'Retiro en tienda',
      items: cartItems.map(item => ({
        name: item.product?.name,
        qty: item.quantity,
        price: item.product?.price,
        total: item.product!.price * item.quantity,
        format: item.product?.format
      })),
      subtotal: cartTotal,
      shipping: shippingFee,
      total: total,
      status: 'Nuevo',
      notes: formData.notes
    };

    // 1. Save to DB
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (res.ok) {
        const result = await res.json();
        const finalId = result.id || orderId;
        
        // 2. Format WhatsApp Message (Receipt Style)
        const itemsText = order.items.map(i => `- ${i.name} (${i.format}) ${i.qty} x $${i.price.toFixed(2)} = $${i.total.toFixed(2)}`).join('\n');
        
        const message = `🧾 NUEVO PEDIDO – LIT
Pedido: ${finalId}
Fecha: ${order.date}
Cliente: ${order.customer_name}
Teléfono: ${order.customer_phone}
Email: ${order.customer_email || 'N/A'}
Entrega: ${order.delivery_method}
Dirección: ${order.address}

ITEMS:
${itemsText}

Subtotal: $${order.subtotal.toFixed(2)}
Descuento: $0.00
Envío: $${order.shipping.toFixed(2)}
Impuestos: $0.00
TOTAL: $${order.total.toFixed(2)}

Notas: ${order.notes || '—'}

Por favor confirmar disponibilidad y método de pago.`;
        
        const whatsappUrl = `https://wa.me/${settings?.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
        
        // 3. Clear Cart and Redirect
        clearCart();
        window.open(whatsappUrl, '_blank');
        navigate('/');
      }
    } catch (error) {
      alert('Error al procesar el pedido. Por favor intenta de nuevo.');
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="pt-32 pb-24 bg-lit-pastel min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form Side */}
          <div>
            <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-400 mb-8 hover:text-lit-purple transition-colors">
              <ArrowLeft size={14} /> Volver al carrito
            </button>
            
            <div className="bg-white p-10 shadow-sm">
              <div className="flex gap-4 mb-10">
                <div className={`flex-1 h-1 ${step >= 1 ? 'bg-lit-purple' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1 ${step >= 2 ? 'bg-lit-purple' : 'bg-gray-100'}`} />
              </div>

              {step === 1 ? (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold tracking-tighter">Datos de contacto</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nombre y Apellido *</label>
                      <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} className="input-lit" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Teléfono *</label>
                      <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={handleInputChange} className="input-lit" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email (Opcional)</label>
                    <input type="email" name="customer_email" value={formData.customer_email} onChange={handleInputChange} className="input-lit" />
                  </div>

                  <h2 className="text-2xl font-bold tracking-tighter pt-4">Método de entrega</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'Envío' }))}
                      className={`p-6 border flex flex-col items-center gap-3 transition-all ${formData.delivery_method === 'Envío' ? 'border-lit-purple bg-lit-pastel' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <Truck size={24} />
                      <span className="text-xs font-bold uppercase tracking-widest">Envío a domicilio</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, delivery_method: 'Retiro' }))}
                      className={`p-6 border flex flex-col items-center gap-3 transition-all ${formData.delivery_method === 'Retiro' ? 'border-lit-purple bg-lit-pastel' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <Store size={24} />
                      <span className="text-xs font-bold uppercase tracking-widest">Retiro en tienda</span>
                    </button>
                  </div>

                  {formData.delivery_method === 'Envío' && (
                    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Dirección completa *</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-lit" required />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Ciudad *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-lit" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Estado / Provincia *</label>
                          <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="input-lit" required />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={!formData.customer_name || !formData.customer_phone || (formData.delivery_method === 'Envío' && !formData.address)}
                    onClick={() => setStep(2)}
                    className="w-full btn-primary py-4 disabled:opacity-50"
                  >
                    Continuar a revisión
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold tracking-tighter">Revisar pedido</h2>
                  
                  <div className="space-y-6 text-sm">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                      <span className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Cliente</span>
                      <span className="font-bold text-right">{formData.customer_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                      <span className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Teléfono</span>
                      <span className="font-bold text-right">{formData.customer_phone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                      <span className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Entrega</span>
                      <span className="font-bold text-right">{formData.delivery_method}</span>
                    </div>
                    {formData.delivery_method === 'Envío' && (
                      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                        <span className="text-gray-400 uppercase tracking-widest font-bold text-[10px]">Dirección</span>
                        <span className="font-bold text-right">{formData.address}, {formData.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Notas adicionales</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="input-lit h-24 resize-none" placeholder="Ej: Tocar timbre 2, dejar en recepción..."></textarea>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">Atrás</button>
                    <button onClick={handleSubmit} className="btn-primary flex-[2] flex items-center justify-center gap-3 bg-lit-green text-lit-purple">
                      <MessageCircle size={20} />
                      <span>Completar por WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Side */}
          <div className="hidden lg:block">
            <div className="bg-white p-10 sticky top-32 border border-gray-100">
              <h3 className="text-xl font-bold tracking-tight mb-8">Tu Pedido</h3>
              <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-4">
                {cartItems.map(item => (
                  <div key={`${item.productId}-${item.packId}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-lit-pastel flex-shrink-0">
                      <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold">{item.product?.name}</h4>
                      <p className="text-xs text-gray-400">Cant: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">${(item.product!.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío ({formData.delivery_method})</span>
                  <span className="font-bold">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-lit-purple">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
