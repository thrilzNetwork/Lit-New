import React from 'react';
import { ShoppingBag, Menu, X, Search, User, Leaf } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  cartCount: number;
  onMenuToggle: () => void;
}

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative flex items-center">
      <span className="text-3xl font-serif font-bold tracking-tighter leading-none text-lit-purple">LIT</span>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
        <Leaf className="text-lit-green w-4 h-4 rotate-12" fill="currentColor" />
      </div>
    </div>
    <div className="hidden sm:block border-l pl-3 border-lit-purple/20">
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold leading-tight block text-lit-purple/60">Food and Supplement</span>
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold leading-tight block text-lit-purple/60">Processor</span>
    </div>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ cartCount, onMenuToggle }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda', path: '/shop' },
    { name: 'Promos', path: '/promos' },
    { name: 'Packs', path: '/packs' },
    { name: 'Contacto', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-white py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button onClick={onMenuToggle} className="lg:hidden text-lit-purple">
          <Menu size={24} />
        </button>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-colors hover:text-lit-green ${
                location.pathname === link.path 
                  ? 'text-lit-green' 
                  : 'text-lit-purple'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <Link to="/" className="group transition-transform hover:scale-105">
          <Logo />
        </Link>

        <div className="flex items-center gap-5 text-lit-purple">
          <button className="hidden sm:block hover:text-lit-green transition-colors">
            <Search size={20} />
          </button>
          <Link to="/profile" className="hover:text-lit-green transition-colors">
            <User size={20} />
          </Link>
          <Link to="/cart" className="relative group">
            <ShoppingBag size={22} className="group-hover:text-lit-green transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-lit-green text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="group inline-block">
            <Logo />
          </Link>
          <p className="text-sm text-lit-purple/50 leading-relaxed">
            Laboratorios LIT redefine el bienestar premium con suplementos diseñados para potenciar tu rendimiento y equilibrio diario.
          </p>
          <div className="flex gap-4">
            {['Instagram', 'Facebook', 'Twitter'].map((social) => (
              <a key={social} href="#" className="text-lit-purple hover:text-lit-green transition-colors text-xs uppercase tracking-widest font-bold">
                {social}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Navegación</h4>
          <ul className="space-y-4 text-sm text-lit-purple/50">
            <li><Link to="/shop" className="hover:text-lit-purple transition-colors">Tienda Completa</Link></li>
            <li><Link to="/promos" className="hover:text-lit-purple transition-colors">Promociones</Link></li>
            <li><Link to="/about" className="hover:text-lit-purple transition-colors">Nuestra Historia</Link></li>
            <li><Link to="/faq" className="hover:text-lit-purple transition-colors">Preguntas Frecuentes</Link></li>
            <li><Link to="/contact" className="hover:text-lit-purple transition-colors">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Políticas</h4>
          <ul className="space-y-4 text-sm text-lit-purple/50">
            <li><Link to="/policies/shipping" className="hover:text-lit-purple transition-colors">Envíos y Entregas</Link></li>
            <li><Link to="/policies/returns" className="hover:text-lit-purple transition-colors">Devoluciones</Link></li>
            <li><Link to="/policies/privacy" className="hover:text-lit-purple transition-colors">Privacidad</Link></li>
            <li><Link to="/policies/terms" className="hover:text-lit-purple transition-colors">Términos de Uso</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Newsletter</h4>
          <p className="text-sm text-lit-purple/50 mb-6">Suscríbete para recibir tips de bienestar y ofertas exclusivas.</p>
          <div className="flex">
            <input type="email" placeholder="Tu email" className="bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none w-full" />
            <button className="bg-lit-purple text-white px-4 py-3 text-xs uppercase font-bold tracking-widest">OK</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-lit-purple/40 uppercase tracking-widest">© 2024 Laboratorios LIT. Todos los derechos reservados.</p>
        <div className="flex gap-6 text-[10px] text-lit-purple/40 uppercase tracking-widest">
          <span>Horario: Lun-Vie 9:00 - 18:00</span>
          <span>Métodos de entrega: Nacional & Local</span>
        </div>
      </div>
    </footer>
  );
};
