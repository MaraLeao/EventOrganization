import React, { useState, useEffect } from 'react';
import { Users, Calendar, Ticket, Plus, Edit2, Trash2, X, Search, Filter, TrendingUp, Clock, MapPin, UserCheck } from 'lucide-react';

const API_URL = '/api';

export default function EventsApp() {
  const [activeTab, setActiveTab] = useState('events');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [activeTab, token]);

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthData({ name: '', email: '', password: '' });
    setActiveTab('events');
  };

  const handleUnauthorized = () => {
    logout();
    setAuthError('Sua sessão expirou. Faça login novamente.');
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/users`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar usuários');
        }
        setUsers(await res.json());
      } else if (activeTab === 'events') {
        const res = await fetch(`${API_URL}/events`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar eventos');
        }
        setEvents(await res.json());
      } else if (activeTab === 'tickets') {
        const res = await fetch(`${API_URL}/tickets`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar ingressos');
        }
        setTickets(await res.json());
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (!token) {
        return handleUnauthorized();
      }
      const endpoint = modalType === 'user' ? 'users' : modalType === 'event' ? 'events' : 'tickets';
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${API_URL}/${endpoint}/${editingItem.id}` : `${API_URL}/${endpoint}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        let message = 'Erro ao salvar';
        try {
          const data = await response.json();
          if (data && typeof data.error === 'string') {
            message = data.error;
          }
        } catch (_) {}
        throw new Error(message);
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setFormError(error.message || 'Erro ao salvar');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      if (!token) {
        return handleUnauthorized();
      }
      const endpoint = type === 'user' ? 'users' : type === 'event' ? 'events' : 'tickets';
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        throw new Error('Erro ao deletar');
      }
      loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? 'login' : 'register';
      const payload =
        authMode === 'login'
          ? {
              email: authData.email,
              password: authData.password,
            }
          : {
              name: authData.name,
              email: authData.email,
              password: authData.password,
            };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Erro de autenticação');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setAuthData({ name: '', email: '', password: '' });
      setAuthMode('login');
      setAuthError('');
    } catch (error) {
      console.error('Erro de autenticação:', error);
      setAuthError(error.message || 'Erro de autenticação');
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setAuthError('');
  };

  const getStats = () => {
    const totalUsers = users.length;
    const totalEvents = events.length;
    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(t => !t.isUsed).length;
    
    return {
      totalUsers,
      totalEvents,
      totalTickets,
      activeTickets
    };
  };

  const renderDashboard = () => {
    const stats = getStats();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total de Eventos</p>
              <h3 className="text-3xl font-bold">{stats.totalEvents}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Usuários</p>
              <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Ingressos Vendidos</p>
              <h3 className="text-3xl font-bold">{stats.totalTickets}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Ticket size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Ingressos Ativos</p>
              <h3 className="text-3xl font-bold">{stats.activeTickets}</h3>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Usuários</h2>
          <p className="text-gray-600">Gerencie todos os usuários cadastrados</p>
        </div>
        <button
          onClick={() => openModal('user')}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-1">{user.name}</h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <Clock size={14} />
                      Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('user', user)}
                    className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete('user', user.id)}
                    className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Eventos</h2>
          <p className="text-gray-600">Todos os eventos cadastrados no sistema</p>
        </div>
        <button
          onClick={() => openModal('event')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-2xl transition-all overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-2xl text-gray-800 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('event', event)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete('event', event.id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {event.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <Calendar className="text-blue-600" size={20} />
                  <span className="font-medium">{new Date(event.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="text-red-600" size={20} />
                  <span>{event.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-emerald-600 font-medium mb-1">Capacidade</p>
                    <p className="text-lg font-bold text-emerald-700">{event.maxCapacity}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium mb-1">Vendidos</p>
                    <p className="text-lg font-bold text-purple-700">{event._count?.tickets || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Ingressos</h2>
          <p className="text-gray-600">Gerencie todos os ingressos vendidos</p>
        </div>
        <button
          onClick={() => openModal('ticket')}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} /> Novo Ingresso
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar ingressos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
            <div className="flex">
              <div className={`w-2 ${ticket.isUsed ? 'bg-gray-400' : 'bg-gradient-to-b from-emerald-400 to-emerald-600'}`}></div>
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${ticket.isUsed ? 'bg-gray-100' : 'bg-emerald-100'}`}>
                        <Ticket className={ticket.isUsed ? 'text-gray-600' : 'text-emerald-600'} size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">
                          {ticket.event?.title || 'Evento'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <UserCheck size={16} className="text-gray-400" />
                          <p className="text-gray-600">{ticket.user?.name || 'Usuário'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Preço</p>
                        <p className="text-xl font-bold text-emerald-600">
                          R$ {Number(ticket.price).toFixed(2)}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-medium ${
                        ticket.isUsed 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.isUsed ? '✓ Usado' : '● Disponível'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('ticket', ticket)}
                      className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete('ticket', ticket.id)}
                      className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border border-purple-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold mb-4">
            VE
          </div>
          <h1 className="text-3xl font-bold text-gray-800">VivaEventos</h1>
          <p className="text-gray-500 mt-2">
            {authMode === 'login'
              ? 'Acesse o painel para gerenciar eventos, usuários e ingressos.'
              : 'Crie sua conta para começar a organizar seus eventos.'}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={authData.name}
                onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="voce@exemplo.com"
              value={authData.email}
              onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={authData.password}
              onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {authError && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:opacity-90 transition"
          >
            {authMode === 'login' ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleAuthMode}
          className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {authMode === 'login' ? 'Não tem conta? Registre-se' : 'Já possui conta? Faça login'}
        </button>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {editingItem ? 'Editar' : 'Novo'} {modalType === 'user' ? 'Usuário' : modalType === 'event' ? 'Evento' : 'Ingresso'}
            </h3>
            <button 
              onClick={closeModal} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
                {formError}
              </div>
            )}
            {modalType === 'user' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    placeholder="Digite o nome completo"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password || ''}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {modalType === 'event' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    placeholder="Nome do evento"
                    value={formData.title || ''}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    placeholder="Descreva o evento..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora</label>
                  <input
                    type="datetime-local"
                    value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                    onChange={e => setFormData({...formData, date: new Date(e.target.value).toISOString()})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                  <input
                    type="text"
                    placeholder="Endereço do evento"
                    value={formData.location || ''}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacidade Máxima</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.maxCapacity || ''}
                    onChange={e => setFormData({...formData, maxCapacity: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {modalType === 'ticket' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID do Usuário</label>
                  <input
                    type="text"
                    placeholder="ID do usuário"
                    value={formData.userId || ''}
                    onChange={e => setFormData({...formData, userId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                    required
                    disabled={editingItem}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID do Evento</label>
                  <input
                    type="text"
                    placeholder="ID do evento"
                    value={formData.eventId || ''}
                    onChange={e => setFormData({...formData, eventId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                    required
                    disabled={editingItem}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                {editingItem && (
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isUsed || false}
                      onChange={e => setFormData({...formData, isUsed: e.target.checked})}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-gray-700">Marcar ingresso como usado</span>
                  </label>
                )}
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all transform hover:scale-105"
              >
                {editingItem ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!token) {
    return renderAuth();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 shadow-2xl">
        <div className="container mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">VivaEventos</h1>
            <p className="text-blue-100">Gerenciamento de eventos, usuários e ingressos</p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
              <div>
                <p className="text-sm text-blue-100">Logado como</p>
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-sm text-blue-100">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setAuthError('');
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto p-6 lg:p-8">
        {renderDashboard()}

        <div className="bg-white rounded-xl shadow-md mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} />
              Eventos
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Ticket size={20} />
              Ingressos
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'tickets' && renderTickets()}
        </div>
      </div>

      {renderModal()}
    </div>
  );
}
