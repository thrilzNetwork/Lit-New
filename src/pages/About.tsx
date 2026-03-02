import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Zap, Award } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-lit-purple font-bold mb-4 block">Nuestra Historia</span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-8 leading-none">Ciencia aplicada al <span className="text-lit-green italic">bienestar</span></h1>
            <p className="text-lit-purple/60 text-lg font-light leading-relaxed mb-6">
              En Laboratorios LIT, creemos que la salud no es solo la ausencia de enfermedad, sino un estado de performance óptimo donde cuerpo y mente trabajan en perfecta armonía.
            </p>
            <p className="text-lit-purple/60 font-light leading-relaxed">
              Nacimos con la misión de democratizar el acceso a suplementación de grado farmacéutico, formulada con los más altos estándares de pureza y eficacia. Cada producto LIT es el resultado de años de investigación y desarrollo.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img src="https://picsum.photos/seed/lab/1000/1200?grayscale" className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-80" alt="Laboratorio" />
            <div className="absolute -bottom-10 -left-10 bg-lit-purple text-white p-10 hidden md:block">
              <p className="text-4xl font-bold tracking-tighter mb-1">10+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Años de Innovación</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
          {[
            { icon: ShieldCheck, title: "Pureza Garantizada", desc: "Materias primas certificadas y procesos de control rigurosos." },
            { icon: Heart, title: "Enfoque Humano", desc: "Diseñamos soluciones pensando en el estilo de vida moderno." },
            { icon: Zap, title: "Eficacia Real", desc: "Fórmulas con biodisponibilidad optimizada para resultados visibles." },
            { icon: Award, title: "Calidad Premium", desc: "Excelencia en cada etapa, desde el laboratorio hasta tu hogar." }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <div className="w-12 h-12 bg-lit-pastel text-lit-purple flex items-center justify-center rounded-full">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold tracking-tight">{item.title}</h3>
              <p className="text-lit-purple/50 text-sm font-light">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-lit-pastel p-16 md:p-24 text-center border border-gray-100">
          <h2 className="text-3xl md:text-6xl font-serif font-bold tracking-tighter mb-8 max-w-3xl mx-auto leading-tight">Únete a la revolución del bienestar inteligente.</h2>
          <Link to="/shop" className="btn-primary px-12 py-4 inline-block">Ver Catálogo</Link>
        </div>
      </div>
    </div>
  );
};
