import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Create lead
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        source: 'contact',
        interest: formData.message
      })
    });
    setSent(true);
  };

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-lit-purple font-bold mb-4 block">Contacto</span>
          <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-6 leading-none">Estamos para <span className="text-lit-green italic">ayudarte</span></h1>
          <p className="text-lit-purple/50 max-w-2xl mx-auto font-light text-lg">¿Tienes dudas sobre qué producto elegir o necesitas asesoría personalizada? Escríbenos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 border border-gray-100 shadow-sm"
          >
            {sent ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-lit-green text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-4">¡Mensaje enviado!</h2>
                <p className="text-lit-purple/50 font-light">Un asesor se pondrá en contacto contigo a la brevedad.</p>
                <button onClick={() => setSent(false)} className="mt-8 text-xs font-bold uppercase tracking-widest text-lit-purple hover:underline">Enviar otro mensaje</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nombre Completo</label>
                    <input type="text" required className="input-lit" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Teléfono</label>
                    <input type="tel" required className="input-lit" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email</label>
                  <input type="email" className="input-lit" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Mensaje / Consulta</label>
                  <textarea required className="input-lit h-32 resize-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  <Send size={18} /> Enviar Mensaje
                </button>
              </form>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight">Canales de Atención</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-lit-pastel text-lit-purple flex items-center justify-center rounded-full">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">WhatsApp Ventas</p>
                    <p className="font-bold">+591 78299604</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-lit-pastel text-lit-purple flex items-center justify-center rounded-full">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email Soporte</p>
                    <p className="font-bold">hola@laboratorioslit.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-lit-pastel text-lit-purple flex items-center justify-center rounded-full">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Horario de Atención</p>
                    <p className="font-bold">Lunes a Viernes: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-lit-purple text-white p-10 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tighter mb-4">¿Buscas Asesoría Personalizada?</h3>
                <p className="text-white/70 font-light mb-8">Nuestros expertos en bienestar pueden ayudarte a elegir el suplemento ideal para tus objetivos.</p>
                <button 
                  onClick={() => window.open('https://wa.me/59178299604?text=Hola,%20necesito%20asesoría%20personalizada%20con%20LIT', '_blank')}
                  className="bg-lit-green text-white px-8 py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-lit-purple transition-all"
                >
                  Hablar con un experto
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
