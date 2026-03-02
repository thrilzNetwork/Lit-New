import React, { useState, useEffect } from 'react';
import { Order, Settings, User as UserType, Product, Promo, Lead, ActivityLog } from '../types';
import { 
  MessageCircle, Copy, ExternalLink, Settings as SettingsIcon, Package, User, 
  Calendar, DollarSign, CheckCircle2, Clock, Truck, XCircle, Bell, LogOut, 
  ShieldCheck, Users, LogIn, UserPlus, Plus, Edit, Trash2, Tag, ShoppingBag,
  Save, ChevronDown, ChevronUp, Phone, FileText, History, Send, UserCheck, ArrowRight, Upload, Loader2
} from 'lucide-react';
import { io } from 'socket.io-client';

export const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'leads' | 'productos' | 'promos' | 'usuarios' | 'config'>('pedidos');
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  
  // Detail views
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [newLog, setNewLog] = useState({ type: 'call' as any, outcome: '', notes: '', next_follow_up: '' });

  // Edit states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPromo, setEditingPromo] = useState<Partial<Promo> | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    checkAuth();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        fetchData();
        setupSocket();
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    if (socketRef.current) return;
    
    const socket = io();
    socketRef.current = socket;
    
    socket.on('new_order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 5000);
    });
    socket.on('order_status_updated', ({ id, status }) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
        fetchLogs('order', id);
      }
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, leadsRes, settingsRes, productsRes, promosRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/leads'),
        fetch('/api/settings'),
        fetch('/api/products'),
        fetch('/api/admin/promos')
      ]);
      
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (promosRes.ok) setPromos(await promosRes.json());
      
      // Fetch users if admin
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const me = await meRes.json();
        if (me.role === 'admin') {
          const usersRes = await fetch('/api/admin/users');
          if (usersRes.ok) setUsers(await usersRes.json());
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (type: 'lead' | 'order', id: string) => {
    const res = await fetch(`/api/${type}s/${id}/logs`);
    if (res.ok) setActivityLogs(await res.json());
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (isLogin) {
          setCurrentUser(data);
          fetchData();
          setupSocket();
        } else {
          alert(data.message);
          setIsLogin(true);
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: `Error del servidor (${res.status})` }));
        setAuthError(errorData.error || `Error ${res.status}`);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError('Error de red o servidor no disponible');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setOrders([]);
    setLeads([]);
    setUsers([]);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  };

  const updateLeadStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as any } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, status: status as any } : null);
  };

  const addLog = async (type: 'lead' | 'order', id: string) => {
    const res = await fetch(`/api/${type}s/${id}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    });
    if (res.ok) {
      setNewLog({ type: 'call', outcome: '', notes: '', next_follow_up: '' });
      fetchLogs(type, id);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct)
    });
    if (res.ok) {
      alert('Producto guardado');
      setEditingProduct(null);
      fetchData();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url && editingProduct) {
        setEditingProduct({ ...editingProduct, image: data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const savePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingPromo)
    });
    if (res.ok) {
      alert('Promoción guardada');
      setEditingPromo(null);
      fetchData();
    }
  };

  const deletePromo = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta promoción?')) return;
    const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const updateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      whatsapp_number: formData.get('whatsapp_number'),
      shipping_fee: formData.get('shipping_fee'),
      hero_image: formData.get('hero_image'),
      hero_title: formData.get('hero_title'),
      hero_subtitle: formData.get('hero_subtitle'),
      hero_badge: formData.get('hero_badge')
    };
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('Configuración guardada');
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const updateUserStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const updateUserRole = async (id: number, role: string) => {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (res.ok) fetchData();
  };

  const copySummary = (order: Order) => {
    const itemsText = order.items.map(i => `• ${i.name} x${i.qty} = $${i.total.toFixed(2)}`).join('\n');
    const summary = `🧾 PEDIDO: ${order.id}\nCliente: ${order.customer_name}\nTeléfono: ${order.customer_phone}\nTotal: $${order.total.toFixed(2)}\n\nITEMS:\n${itemsText}`;
    navigator.clipboard.writeText(summary);
    alert('Resumen copiado al portapapeles');
  };

  const statusColors = {
    'Nuevo': 'bg-blue-100 text-blue-700',
    'Contactado': 'bg-yellow-100 text-yellow-700',
    'Pagado': 'bg-emerald-100 text-emerald-700',
    'Enviado': 'bg-purple-100 text-purple-700',
    'Cancelado': 'bg-red-100 text-red-700',
    'En seguimiento': 'bg-orange-100 text-orange-700',
    'Cerrado ganado': 'bg-emerald-100 text-emerald-700',
    'Cerrado perdido': 'bg-gray-100 text-gray-700'
  };

  if (loading) return <div className="pt-40 text-center">Cargando panel...</div>;

  if (!currentUser) {
    return (
      <div className="pt-40 pb-24 bg-white min-h-screen flex items-center justify-center px-6">
        <div className="bg-white border border-gray-100 p-10 max-w-md w-full shadow-xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-lit-purple text-white rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">Acceso CRM LIT</h1>
            <p className="text-lit-purple/50 font-light">{isLogin ? 'Inicia sesión para gestionar la tienda' : 'Regístrate para solicitar acceso'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  className="input-lit" 
                  value={authForm.name}
                  onChange={e => setAuthForm({...authForm, name: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email</label>
              <input 
                type="email" 
                required 
                className="input-lit" 
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Contraseña</label>
              <input 
                type="password" 
                required 
                className="input-lit" 
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
              />
            </div>

            {authError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{authError}</p>}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? 'Entrar' : 'Registrarse'}
            </button>
            
            <button 
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/health');
                  const data = await res.json();
                  if (data.dbStatus === 'connected') {
                    alert(`Conexión OK: Base de datos ${data.database} conectada correctamente.`);
                  } else {
                    alert(`Error en Base de Datos: ${data.dbStatus}\n\nVerifica que hayas configurado POSTGRES_URL en Vercel.`);
                  }
                } catch (err) {
                  alert('Error de conexión con el servidor. El backend podría estar caído.');
                }
              }}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-lit-purple transition-colors"
            >
              Probar Conexión
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}
              className="text-xs font-bold uppercase tracking-widest text-lit-purple hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-lit-purple text-white">
                {currentUser.role === 'admin' ? 'Administrador' : 'Ventas'}
              </span>
              <span className="text-xs text-lit-purple/40 font-bold uppercase tracking-widest">Bienvenido, {currentUser.name}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter">Central CRM LIT</h1>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {newOrderAlert && (
              <div className="bg-lit-green text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-bounce">
                <Bell size={14} /> ¡Nuevo Pedido!
              </div>
            )}
            <div className="flex bg-white border border-gray-200 p-1 flex-1 md:flex-none overflow-x-auto">
              <button 
                onClick={() => { setActiveTab('pedidos'); setSelectedOrder(null); setSelectedLead(null); }}
                className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'pedidos' ? 'bg-lit-purple text-white' : 'text-gray-400 hover:text-lit-purple'}`}
              >
                Pedidos
              </button>
              <button 
                onClick={() => { setActiveTab('leads'); setSelectedOrder(null); setSelectedLead(null); }}
                className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'leads' ? 'bg-lit-purple text-white' : 'text-gray-400 hover:text-lit-purple'}`}
              >
                Leads
              </button>
              {currentUser.role === 'admin' && (
                <>
                  <button 
                    onClick={() => setActiveTab('productos')}
                    className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'productos' ? 'bg-lit-purple text-white' : 'text-gray-400 hover:text-lit-purple'}`}
                  >
                    Productos
                  </button>
                  <button 
                    onClick={() => setActiveTab('promos')}
                    className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'promos' ? 'bg-lit-purple text-white' : 'text-gray-400 hover:text-lit-purple'}`}
                  >
                    Promos
                  </button>
                  <button 
                    onClick={() => setActiveTab('usuarios')}
                    className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'usuarios' ? 'bg-lit-purple text-white' : 'text-gray-400 hover:text-lit-purple'}`}
                  >
                    Usuarios
                  </button>
                  <button 
                    onClick={() => setActiveTab('config')}
                    className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap ${activeTab === 'config' ? 'bg-lit-purple text-white' : 'text-gray-400 hover:text-lit-purple'}`}
                  >
                    Ajustes
                  </button>
                </>
              )}
              <button 
                onClick={handleLogout}
                className="px-6 py-2 text-xs uppercase tracking-widest font-bold text-red-400 hover:bg-red-50 transition-all flex items-center gap-2"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'pedidos' && !selectedOrder && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-20 text-center border border-gray-100">
                <Package size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 italic">No hay pedidos registrados aún.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 shadow-sm overflow-hidden hover:border-lit-purple/30 transition-all cursor-pointer" onClick={() => { setSelectedOrder(order); fetchLogs('order', order.id); }}>
                  <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">ID Pedido</span>
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest ${statusColors[order.status]}`}>{order.status}</span>
                      </div>
                      <h3 className="text-lg font-bold">{order.id}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} /> {order.date}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block">Cliente</span>
                      <div className="font-bold flex items-center gap-2"><User size={14} /> {order.customer_name}</div>
                      <div className="text-sm text-lit-purple flex items-center gap-2"><MessageCircle size={14} /> {order.customer_phone}</div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block">Resumen</span>
                      <div className="text-sm font-bold flex items-center gap-2"><Package size={14} /> {order.items.length} productos</div>
                      <div className="text-lg font-bold text-lit-purple flex items-center gap-2"><DollarSign size={16} /> ${order.total.toFixed(2)}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-start justify-end" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => window.open(`https://wa.me/${order.customer_phone.replace(/\+/g, '')}`, '_blank')}
                        className="p-2 border border-gray-200 hover:border-lit-green hover:text-lit-green transition-colors"
                        title="Contactar Cliente"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button 
                        onClick={() => copySummary(order)}
                        className="p-2 border border-gray-200 hover:border-lit-purple hover:text-lit-purple transition-colors"
                        title="Copiar Resumen"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pedidos' && selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <button onClick={() => setSelectedOrder(null)} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lit-purple flex items-center gap-2">
                <ArrowRight size={14} className="rotate-180" /> Volver a la lista
              </button>
              
              <div className="bg-white border border-gray-100 p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Detalle de Pedido</span>
                    <h2 className="text-3xl font-bold tracking-tighter">{selectedOrder.id}</h2>
                  </div>
                  <select 
                    value={selectedOrder.status} 
                    onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border-none focus:ring-0 ${statusColors[selectedOrder.status]}`}
                  >
                    {['Nuevo', 'Contactado', 'Pagado', 'Enviado', 'Cancelado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-4">Información del Cliente</span>
                    <p className="font-bold text-lg mb-1">{selectedOrder.customer_name}</p>
                    <p className="text-lit-purple font-bold">{selectedOrder.customer_phone}</p>
                    <p className="text-gray-500 text-sm">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-4">Entrega</span>
                    <p className="font-bold mb-1">{selectedOrder.delivery_method}</p>
                    <p className="text-gray-500 text-sm">{selectedOrder.address}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-6">Items del Pedido</span>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-lit-purple font-bold">
                            {item.qty}x
                          </div>
                          <div>
                            <p className="font-bold text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.format}</p>
                          </div>
                        </div>
                        <p className="font-bold text-sm">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-bold">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Envío</span>
                      <span className="font-bold">${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-50">
                      <span>Total</span>
                      <span className="text-lit-purple">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-gray-100 p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <History size={16} /> Historial de Actividad
                </h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto mb-8 pr-2">
                  {activityLogs.map(log => (
                    <div key={log.id} className="border-l-2 border-lit-purple/20 pl-4 py-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-lit-purple">{log.type}</span>
                        <span className="text-[9px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-600">{log.notes}</p>
                      {log.outcome && <p className="text-[10px] text-lit-green font-bold mt-1 italic">Resultado: {log.outcome}</p>}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Registrar Actividad</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setNewLog({...newLog, type: 'call'})}
                      className={`p-2 text-[10px] font-bold uppercase tracking-widest border ${newLog.type === 'call' ? 'bg-lit-purple text-white border-lit-purple' : 'border-gray-200 text-gray-400'}`}
                    >
                      Llamada
                    </button>
                    <button 
                      onClick={() => setNewLog({...newLog, type: 'whatsapp'})}
                      className={`p-2 text-[10px] font-bold uppercase tracking-widest border ${newLog.type === 'whatsapp' ? 'bg-lit-purple text-white border-lit-purple' : 'border-gray-200 text-gray-400'}`}
                    >
                      WhatsApp
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Resultado (ej: Interesado)" 
                    className="input-lit text-xs py-2" 
                    value={newLog.outcome}
                    onChange={e => setNewLog({...newLog, outcome: e.target.value})}
                  />
                  <textarea 
                    placeholder="Notas de la actividad..." 
                    className="input-lit text-xs py-2 h-20 resize-none"
                    value={newLog.notes}
                    onChange={e => setNewLog({...newLog, notes: e.target.value})}
                  ></textarea>
                  <button 
                    onClick={() => addLog('order', selectedOrder.id)}
                    className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Guardar Registro
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Acciones Rápidas</h3>
                <button 
                  onClick={() => window.open(`https://wa.me/${selectedOrder.customer_phone.replace(/\+/g, '')}`, '_blank')}
                  className="w-full py-3 border border-lit-green text-lit-green font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-lit-green hover:text-white transition-all"
                >
                  <MessageCircle size={14} /> Abrir WhatsApp Cliente
                </button>
                <button 
                  onClick={() => {
                    const itemsText = selectedOrder.items.map(i => `• ${i.name} x${i.qty} = $${i.total.toFixed(2)}`).join('\n');
                    const summary = `🧾 PEDIDO: ${selectedOrder.id}\nCliente: ${selectedOrder.customer_name}\nTotal: $${selectedOrder.total.toFixed(2)}\n\nITEMS:\n${itemsText}`;
                    window.open(`https://wa.me/${settings?.whatsapp_number.replace(/\+/g, '')}?text=${encodeURIComponent(summary)}`, '_blank');
                  }}
                  className="w-full py-3 border border-lit-purple text-lit-purple font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-lit-purple hover:text-white transition-all"
                >
                  <Send size={14} /> Enviar a WhatsApp Ventas
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && !selectedLead && (
          <div className="bg-white border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tighter flex items-center gap-3">
                <Users size={24} /> Leads Inbox (CRM)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    <th className="px-8 py-4">Lead</th>
                    <th className="px-8 py-4">Origen</th>
                    <th className="px-8 py-4">Interés</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4">Fecha</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setSelectedLead(lead); fetchLogs('lead', lead.id); }}>
                      <td className="px-8 py-6">
                        <div className="font-bold text-sm">{lead.name || 'Anónimo'}</div>
                        <div className="text-xs text-lit-purple">{lead.phone || lead.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{lead.source}</span>
                      </td>
                      <td className="px-8 py-6 text-xs text-gray-500">{lead.interest || '—'}</td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-[10px] text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-gray-400 hover:text-lit-purple"><ArrowRight size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leads' && selectedLead && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <button onClick={() => setSelectedLead(null)} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-lit-purple flex items-center gap-2">
                <ArrowRight size={14} className="rotate-180" /> Volver al Inbox
              </button>
              
              <div className="bg-white border border-gray-100 p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Detalle de Lead</span>
                    <h2 className="text-3xl font-bold tracking-tighter">{selectedLead.name || 'Anónimo'}</h2>
                  </div>
                  <select 
                    value={selectedLead.status} 
                    onChange={e => updateLeadStatus(selectedLead.id, e.target.value)}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border-none focus:ring-0 ${statusColors[selectedLead.status]}`}
                  >
                    {['Nuevo', 'En seguimiento', 'Cerrado ganado', 'Cerrado perdido'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-12">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block">Contacto</span>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-lit-purple" />
                      <span className="font-bold">{selectedLead.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-lit-purple" />
                      <span className="text-sm text-gray-500">{selectedLead.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block">Información</span>
                    <p className="text-sm"><span className="text-gray-400">Origen:</span> <span className="font-bold uppercase tracking-widest text-[10px]">{selectedLead.source}</span></p>
                    <p className="text-sm"><span className="text-gray-400">Interés:</span> <span className="font-bold">{selectedLead.interest || 'General'}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-gray-100 p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <History size={16} /> Actividad del Lead
                </h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto mb-8 pr-2">
                  {activityLogs.map(log => (
                    <div key={log.id} className="border-l-2 border-lit-purple/20 pl-4 py-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-lit-purple">{log.type}</span>
                        <span className="text-[9px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-600">{log.notes}</p>
                      {log.outcome && <p className="text-[10px] text-lit-green font-bold mt-1 italic">Resultado: {log.outcome}</p>}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Registrar Seguimiento</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setNewLog({...newLog, type: 'call'})}
                      className={`p-2 text-[10px] font-bold uppercase tracking-widest border ${newLog.type === 'call' ? 'bg-lit-purple text-white border-lit-purple' : 'border-gray-200 text-gray-400'}`}
                    >
                      Llamada
                    </button>
                    <button 
                      onClick={() => setNewLog({...newLog, type: 'whatsapp'})}
                      className={`p-2 text-[10px] font-bold uppercase tracking-widest border ${newLog.type === 'whatsapp' ? 'bg-lit-purple text-white border-lit-purple' : 'border-gray-200 text-gray-400'}`}
                    >
                      WhatsApp
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Resultado (ej: Interesado)" 
                    className="input-lit text-xs py-2" 
                    value={newLog.outcome}
                    onChange={e => setNewLog({...newLog, outcome: e.target.value})}
                  />
                  <textarea 
                    placeholder="Notas del seguimiento..." 
                    className="input-lit text-xs py-2 h-20 resize-none"
                    value={newLog.notes}
                    onChange={e => setNewLog({...newLog, notes: e.target.value})}
                  ></textarea>
                  <button 
                    onClick={() => addLog('lead', selectedLead.id)}
                    className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Guardar Registro
                  </button>
                </div>
              </div>

              {selectedLead.phone && (
                <div className="bg-white border border-gray-100 p-8">
                  <button 
                    onClick={() => window.open(`https://wa.me/${selectedLead.phone.replace(/\+/g, '')}`, '_blank')}
                    className="w-full py-3 border border-lit-green text-lit-green font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-lit-green hover:text-white transition-all"
                  >
                    <MessageCircle size={14} /> Abrir WhatsApp Lead
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'productos' && currentUser.role === 'admin' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tighter flex items-center gap-3">
                <ShoppingBag size={24} /> Catálogo de Productos
              </h2>
              <button 
                onClick={() => setEditingProduct({ id: '', name: '', price: 0, benefits: [], category: 'Bienestar femenino' })}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} /> Nuevo Producto
              </button>
            </div>

            {editingProduct && (
              <div className="bg-white border border-lit-purple/20 p-8 shadow-xl">
                <h3 className="text-lg font-bold mb-6">Editar Producto</h3>
                <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">ID Único (slug)</label>
                    <input type="text" className="input-lit" value={editingProduct.id} onChange={e => setEditingProduct({...editingProduct, id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Nombre</label>
                    <input type="text" className="input-lit" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Precio</label>
                    <input type="number" className="input-lit" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Categoría</label>
                    <select className="input-lit" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                      <option>Bienestar femenino</option>
                      <option>Mente y enfoque</option>
                      <option>Relajación y equilibrio</option>
                      <option>Detox y digestión</option>
                      <option>Definición</option>
                      <option>Salud ósea y articulaciones</option>
                      <option>Antioxidantes y longevidad</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Imagen</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder="URL de la imagen" className="input-lit" value={editingProduct.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 border border-dashed border-gray-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                          </label>
                          <span className="text-[9px] text-gray-400 italic">O pega un enlace directo arriba</span>
                        </div>
                      </div>
                      {editingProduct.image && (
                        <div className="w-20 h-20 border border-gray-100 p-1">
                          <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 md:col-span-2">
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={18} /> Guardar</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-3 border border-gray-200 font-bold uppercase tracking-widest text-xs">Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white border border-gray-100 p-6 flex gap-4 items-center">
                  <img src={p.image} className="w-16 h-16 object-cover bg-gray-50" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{p.name}</h4>
                    <p className="text-xs text-gray-400">{p.category}</p>
                    <p className="text-lit-purple font-bold text-sm">${p.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setEditingProduct(p)} className="p-2 text-gray-400 hover:text-lit-purple transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && currentUser.role === 'admin' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tighter flex items-center gap-3">
                <Tag size={24} /> Promociones y Cupones
              </h2>
              <button 
                onClick={() => setEditingPromo({ title: '', description: '', code: '', discount: '', active: 1 })}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} /> Nueva Promo
              </button>
            </div>

            {editingPromo && (
              <div className="bg-white border border-lit-purple/20 p-8 shadow-xl max-w-2xl">
                <h3 className="text-lg font-bold mb-6">Editar Promoción</h3>
                <form onSubmit={savePromo} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Título</label>
                      <input type="text" className="input-lit" value={editingPromo.title} onChange={e => setEditingPromo({...editingPromo, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Código</label>
                      <input type="text" className="input-lit" value={editingPromo.code} onChange={e => setEditingPromo({...editingPromo, code: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Descripción</label>
                    <input type="text" className="input-lit" value={editingPromo.description} onChange={e => setEditingPromo({...editingPromo, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Descuento (ej: 10% o $50)</label>
                      <input type="text" className="input-lit" value={editingPromo.discount} onChange={e => setEditingPromo({...editingPromo, discount: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Estado</label>
                      <select className="input-lit" value={editingPromo.active} onChange={e => setEditingPromo({...editingPromo, active: Number(e.target.value)})}>
                        <option value={1}>Activo</option>
                        <option value={0}>Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2"><Save size={18} /> Guardar</button>
                    <button type="button" onClick={() => setEditingPromo(null)} className="px-8 py-3 border border-gray-200 font-bold uppercase tracking-widest text-xs">Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promos.map(p => (
                <div key={p.id} className={`bg-white border p-8 flex justify-between items-center ${p.active ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg">{p.title}</h4>
                      <span className="bg-lit-purple/10 text-lit-purple px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{p.code}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{p.description}</p>
                    <p className="text-lit-green font-bold text-sm">Descuento: {p.discount}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setEditingPromo(p)} className="p-2 text-gray-400 hover:text-lit-purple transition-colors"><Edit size={18} /></button>
                    <button onClick={() => deletePromo(p.id!)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && currentUser.role === 'admin' && (
          <div className="bg-white border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold tracking-tighter flex items-center gap-3">
                <Users size={24} /> Gestión de Usuarios
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    <th className="px-8 py-4">Nombre</th>
                    <th className="px-8 py-4">Email</th>
                    <th className="px-8 py-4">Rol</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-sm">{user.name}</td>
                      <td className="px-8 py-6 text-sm text-gray-500">{user.email}</td>
                      <td className="px-8 py-6">
                        <select 
                          value={user.role} 
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-xs font-bold uppercase tracking-widest bg-transparent border-none focus:ring-0 cursor-pointer text-lit-purple"
                        >
                          <option value="admin">Admin</option>
                          <option value="sales">Ventas</option>
                          <option value="viewer">Lector</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest ${
                          user.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status === 'approved' ? 'Aprobado' : user.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        {user.status !== 'approved' && (
                          <button 
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:underline"
                          >
                            Aprobar
                          </button>
                        )}
                        {user.status !== 'rejected' && user.role !== 'admin' && (
                          <button 
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline"
                          >
                            Rechazar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && currentUser.role === 'admin' && (
          <div className="bg-white border border-gray-100 p-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tighter mb-8 flex items-center gap-3">
              <SettingsIcon size={24} /> Ajustes de Tienda
            </h2>
            <form onSubmit={updateSettings} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">WhatsApp de Ventas (Formato internacional)</label>
                <input type="text" name="whatsapp_number" defaultValue={settings?.whatsapp_number} className="input-lit" placeholder="+59178299604" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Tarifa de Envío Fija ({settings?.currency})</label>
                <input type="number" name="shipping_fee" defaultValue={settings?.shipping_fee} className="input-lit" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Imagen de Promoción (Hero)</label>
                <div className="flex gap-4">
                  <input type="text" name="hero_image" defaultValue={settings?.hero_image} className="input-lit flex-1" placeholder="URL de la imagen" />
                </div>
                {settings?.hero_image && (
                  <div className="mt-2 w-32 h-20 border border-gray-100 overflow-hidden">
                    <img src={settings.hero_image} alt="Hero Promo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Título Hero</label>
                <input type="text" name="hero_title" defaultValue={settings?.hero_title} className="input-lit" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Subtítulo Hero</label>
                <textarea name="hero_subtitle" defaultValue={settings?.hero_subtitle} className="input-lit h-24 resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Badge Hero (Texto pequeño arriba)</label>
                <input type="text" name="hero_badge" defaultValue={settings?.hero_badge} className="input-lit" />
              </div>
              <button type="submit" className="btn-primary w-full">Guardar Cambios</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
