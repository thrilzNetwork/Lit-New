import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "¿Cómo realizo mi pedido?",
    answer: "Es muy sencillo. Agrega los productos que desees al carrito, completa tus datos de entrega y haz clic en 'Completar pedido por WhatsApp'. Serás redirigido a una conversación con uno de nuestros asesores quien confirmará tu pedido y te indicará los métodos de pago disponibles."
  },
  {
    question: "¿Cuáles son los métodos de pago?",
    answer: "Aceptamos transferencias bancarias, depósitos y pagos vía plataformas digitales (Mercado Pago, etc.). Los detalles específicos te serán proporcionados por el asesor de ventas al momento de finalizar tu pedido por WhatsApp."
  },
  {
    question: "¿Realizan envíos a todo el país?",
    answer: "Sí, realizamos envíos a todo el territorio nacional a través de las principales empresas de logística. El costo de envío es fijo y se detalla en el resumen de tu compra."
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer: "El tiempo de entrega estimado es de 2 a 5 días hábiles, dependiendo de tu ubicación. Una vez despachado, te proporcionaremos un número de seguimiento."
  },
  {
    question: "¿Son seguros los suplementos de LIT?",
    answer: "Absolutamente. Todos nuestros productos son fabricados bajo estrictas normas de calidad y cuentan con las certificaciones correspondientes. Sin embargo, siempre recomendamos consultar con un profesional de la salud antes de comenzar cualquier suplementación."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <HelpCircle size={48} className="mx-auto mb-6 text-lit-purple opacity-20" />
          <h1 className="text-5xl font-serif font-bold tracking-tighter mb-4">Preguntas Frecuentes</h1>
          <p className="text-gray-500 font-light">Todo lo que necesitas saber sobre Laboratorios LIT.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-sm tracking-tight">{faq.question}</span>
                {openIndex === i ? <Minus size={18} className="text-lit-purple" /> : <Plus size={18} className="text-lit-purple" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-sm text-gray-500 font-light leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-16 p-10 bg-lit-purple text-white text-center">
          <h3 className="text-xl font-bold mb-4">¿Aún tienes dudas?</h3>
          <p className="text-white/70 text-sm font-light mb-8">Nuestro equipo de atención al cliente está listo para ayudarte.</p>
          <button 
            onClick={() => window.open('https://wa.me/15557089007', '_blank')}
            className="bg-lit-green text-white px-8 py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-lit-purple transition-all"
          >
            Contactar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
