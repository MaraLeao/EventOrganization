import React, { useState, useEffect } from 'react';
import { Users, Calendar, Ticket, Plus, Edit2, Trash2, X, Search, TrendingUp, Clock, MapPin, UserCheck, User } from 'lucide-react';

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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: '' });
  const [accountFeedback, setAccountFeedback] = useState({ type: '', message: '' });
  const [usageCode, setUsageCode] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

  const emptyTicketType = { name: '', price: '', quantity: '' };

  const ensureTicketTypesArray = (types) => {
    if (!types || types.length === 0) {
      return [emptyTicketType];
    }
    return types.map((type) => ({
      id: type.id,
      name: type.name ?? '',
      price:
        type.price !== undefined && type.price !== null && type.price !== ''
          ? Number(type.price)
          : '',
      quantity:
        type.quantity !== undefined && type.quantity !== null && type.quantity !== ''
          ? Number(type.quantity)
          : '',
    }));
  };

  const handleTicketTypeFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const ticketTypes = ensureTicketTypesArray(prev.ticketTypes);
      ticketTypes[index] = { ...ticketTypes[index], [field]: value };
      return { ...prev, ticketTypes };
    });
  };

  const addTicketTypeRow = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...ensureTicketTypesArray(prev.ticketTypes), emptyTicketType],
    }));
  };

  const removeTicketTypeRow = (index) => {
    setFormData((prev) => {
      const ticketTypes = ensureTicketTypesArray(prev.ticketTypes);
      if (ticketTypes.length === 1) return prev;
      ticketTypes.splice(index, 1);
      return { ...prev, ticketTypes };
    });
  };

  const getTicketTypeAvailability = (type) => {
    if (!type) return 0;
    const sold = type._count?.tickets ?? 0;
    const qty = Number(type.quantity ?? 0);
    return Math.max(qty - sold, 0);
  };

  const getSelectedTicketType = () => {
    if (!selectedEvent || !selectedEvent.ticketTypes?.length) {
      return null;
    }
    const ticketTypeId = formData.ticketTypeId || selectedEvent.ticketTypes[0]?.id;
    return selectedEvent.ticketTypes.find((type) => type.id === ticketTypeId) || null;
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [activeTab, token, isAdmin]);

  useEffect(() => {
    if (currentUser) {
      setAccountForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        password: '',
      });
    } else {
      setAccountForm({ name: '', email: '', password: '' });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!token) return;
    if (!isAdmin && (activeTab === 'users' || activeTab === 'tickets')) {
      setActiveTab('events');
    }
  }, [isAdmin, activeTab, token]);

  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthData({ name: '', email: '', password: '' });
    setActiveTab('events');
    setUsers([]);
    setEvents([]);
    setTickets([]);
    setFormData({});
    setShowModal(false);
    setSelectedEvent(null);
    setAuthError('');
    setAccountFeedback({ type: '', message: '' });
  };

  const handleUnauthorized = () => {
    logout();
    setAuthError('Sua sessão expirou. Faça login novamente.');
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (isAdmin && activeTab === 'users') {
        const res = await fetch(`${API_URL}/users`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar usuários');
        }
        setUsers(await res.json());
      }

      if (activeTab === 'events') {
        const res = await fetch(`${API_URL}/events`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar eventos');
        }
        setEvents(await res.json());
      }

      const shouldFetchTickets =
        (isAdmin && activeTab === 'tickets') ||
        (!isAdmin && activeTab === 'myTickets');

      if (shouldFetchTickets) {
        const res = await fetch(`${API_URL}/tickets`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar ingressos');
        }
        setTickets(await res.json());
      }

      if (!isAdmin && activeTab === 'account' && currentUser) {
        const res = await fetch(`${API_URL}/users/${currentUser.id}`, { headers });
        if (!res.ok) {
          if (res.status === 401) return handleUnauthorized();
          throw new Error('Erro ao carregar dados do usuário');
        }
        const data = await res.json();
        setAccountForm({
          name: data.name,
          email: data.email,
          password: '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const openModal = (type, item = null, options = {}) => {
    setModalType(type);
    setEditingItem(item);
    setUsageCode('');
    setFormError('');

    if (type === 'event') {
      const ticketTypes = item
        ? ensureTicketTypesArray(item.ticketTypes)
        : ensureTicketTypesArray();
      setSelectedEvent(null);
      setFormData(
        item
          ? {
              ...item,
              maxCapacity: item.maxCapacity,
              ticketTypes,
            }
          : {
              title: '',
              description: '',
              date: '',
              location: '',
              maxCapacity: '',
              ticketTypes,
            },
      );
      setShowModal(true);
      return;
    }

    if (options.event) {
      const event = options.event;
      const availableTypes = event.ticketTypes || [];
      const defaultType =
        availableTypes.find((typeOption) => getTicketTypeAvailability(typeOption) > 0) ||
        availableTypes[0] ||
        null;
      setSelectedEvent(event);
      setFormData({
        eventId: event.id,
        ticketTypeId: defaultType?.id || '',
        quantity: 1,
      });
    } else if (item) {
      setSelectedEvent(null);
      setFormData(item);
    } else {
      setSelectedEvent(null);
      setFormData({});
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setFormError('');
    setSelectedEvent(null);
    setUsageCode('');
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
      let bodyData = formData;

      if (modalType === 'event') {
        const ticketTypes = ensureTicketTypesArray(formData.ticketTypes).map((type) => ({
          name: type.name,
          price: Number(type.price),
          quantity: Number(type.quantity),
        }));

        if (ticketTypes.some((type) => !type.name || Number.isNaN(type.price) || Number.isNaN(type.quantity))) {
          throw new Error('Preencha todos os tipos de ingresso corretamente');
        }

        bodyData = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          maxCapacity: Number(formData.maxCapacity),
          ticketTypes,
        };
      } else if (modalType === 'ticket' && !isAdmin) {
        const eventId = formData.eventId || selectedEvent?.id;
        if (!eventId) {
          throw new Error('Evento inválido para compra');
        }
        const ticketTypeId = formData.ticketTypeId;
        if (!ticketTypeId) {
          throw new Error('Selecione um tipo de ingresso');
        }
        bodyData = {
          eventId,
          ticketTypeId,
          quantity: Number(formData.quantity) > 0 ? Number(formData.quantity) : 1,
        };
      } else if (modalType === 'ticket' && isAdmin) {
        bodyData = {
          ...formData,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
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
      setActiveTab('events');
      setAccountFeedback({ type: '', message: '' });
    } catch (error) {
      console.error('Erro de autenticação:', error);
      setAuthError(error.message || 'Erro de autenticação');
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setAuthError('');
  };

  const handleBuyTicket = (event) => {
    if (!token) {
      setAuthError('Faça login para comprar ingressos.');
      return;
    }
    const availableType = event.ticketTypes?.find(type => getTicketTypeAvailability(type) > 0);
    if (!availableType) {
      setFormError('Nenhum ingresso disponível para este evento no momento.');
      return;
    }
    openModal('ticket', null, { event });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!token || !currentUser) {
      return handleUnauthorized();
    }
    setAccountFeedback({ type: '', message: '' });
    try {
      const payload = {};
      if (accountForm.name) payload.name = accountForm.name;
      if (accountForm.email) payload.email = accountForm.email;
      if (accountForm.password) payload.password = accountForm.password;

      if (Object.keys(payload).length === 0) {
        setAccountFeedback({ type: 'error', message: 'Informe ao menos um campo para atualizar.' });
        return;
      }

      const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        throw new Error(data?.error || 'Erro ao atualizar perfil');
      }

      setCurrentUser(data);
      localStorage.setItem('authUser', JSON.stringify(data));
      setAccountForm((prev) => ({ ...prev, password: '' }));
      setAccountFeedback({ type: 'success', message: 'Dados atualizados com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setAccountFeedback({ type: 'error', message: error.message || 'Erro ao atualizar perfil' });
    }
  };

  const handleUseTicket = async () => {
    if (!token || !editingItem) {
      return handleUnauthorized();
    }
    try {
      setFormError('');
      setUsageCode('');
      const response = await fetch(`${API_URL}/tickets/${editingItem.id}/use`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        throw new Error(data?.error || 'Erro ao usar ingresso');
      }
      setUsageCode(data.code);
      setEditingItem(data.ticket);
      await loadData();
    } catch (error) {
      console.error('Erro ao usar ingresso:', error);
      setFormError(error.message || 'Erro ao usar ingresso');
    }
  };

  const getStats = () => {
    const totalEvents = events.length;
    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(t => !t.isUsed).length;
    
    return {
      totalUsers: isAdmin ? users.length : null,
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

        {isAdmin && (
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
        )}

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Ingressos Comprados</p>
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
        {users
          .filter(user => {
            if (!searchTerm.trim()) return true;
            const term = searchTerm.toLowerCase();
            return (
              user.name.toLowerCase().includes(term) ||
              user.email.toLowerCase().includes(term)
            );
          })
          .map(user => (
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

  const renderEvents = () => {
    const filteredEvents = events.filter(event => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const ticketTypeMatch = event.ticketTypes?.some(type =>
        type.name?.toLowerCase().includes(term),
      );
      return (
        event.title.toLowerCase().includes(term) ||
        (event.location?.toLowerCase().includes(term) ?? false) ||
        (event.description?.toLowerCase().includes(term) ?? false) ||
        ticketTypeMatch
      );
    });

    return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Eventos</h2>
          <p className="text-gray-600">Todos os eventos cadastrados no sistema</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal('event')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
          >
            <Plus size={20} /> Novo Evento
          </button>
        )}
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
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-2xl transition-all overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-2xl text-gray-800 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  {isAdmin ? (
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
                  ) : (
                    <button
                      onClick={() => handleBuyTicket(event)}
                      disabled={!event.ticketTypes?.some(type => getTicketTypeAvailability(type) > 0)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition shadow ${
                        event.ticketTypes?.some(type => getTicketTypeAvailability(type) > 0)
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Ticket size={16} /> Comprar ingresso
                    </button>
                  )}
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

                {event.ticketTypes?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Tipos de ingresso</p>
                    <div className="space-y-2">
                      {event.ticketTypes.map(type => {
                        const remaining = getTicketTypeAvailability(type);
                        return (
                          <div
                            key={type.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white"
                          >
                            <div>
                              <p className="font-medium text-gray-800">{type.name}</p>
                              <p className="text-sm text-gray-500">
                                {remaining > 0 ? `${remaining} disponíveis` : 'Esgotado'}
                              </p>
                            </div>
                            <p className="font-semibold text-emerald-600">R$ {Number(type.price).toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
  };

  const renderTickets = (allowManage = false) => {
    const filteredTickets = tickets.filter(ticket => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const eventTitle = ticket.event?.title?.toLowerCase() ?? '';
      const userName = ticket.user?.name?.toLowerCase() ?? '';
      const userEmail = ticket.user?.email?.toLowerCase() ?? '';
      const ticketTypeName = ticket.ticketType?.name?.toLowerCase() ?? '';
      return (
        eventTitle.includes(term) ||
        userName.includes(term) ||
        userEmail.includes(term) ||
        ticketTypeName.includes(term)
      );
    });

    return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Ingressos</h2>
          <p className="text-gray-600">
            {allowManage ? 'Gerencie todos os ingressos vendidos' : 'Veja seus ingressos ativos e usados'}
          </p>
        </div>
        {allowManage && (
          <button
            onClick={() => openModal('ticket')}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 shadow-lg transition-all transform hover:scale-105"
          >
            <Plus size={20} /> Novo Ingresso
          </button>
        )}
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
        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            className={`bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden ${
              allowManage ? '' : 'cursor-pointer'
            }`}
            onClick={!allowManage ? () => openModal('ticketView', ticket) : undefined}
          >
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

                  {allowManage && (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };

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

  const renderAccount = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-100 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Minha conta</h2>
        <p className="text-gray-600">Atualize seus dados pessoais sempre que precisar.</p>
      </div>

      <form onSubmit={handleAccountSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
          <input
            type="text"
            value={accountForm.name}
            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={accountForm.email}
            onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
          <input
            type="password"
            placeholder="Deixe em branco para manter a senha atual"
            value={accountForm.password}
            onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {accountFeedback.message && (
          <div
            className={`rounded-lg px-4 py-2 text-sm ${
              accountFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {accountFeedback.message}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition shadow"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  );
  
  const tabs = isAdmin
    ? [
        { id: 'events', label: 'Eventos', icon: Calendar, activeClass: 'from-blue-600 to-blue-700' },
        { id: 'users', label: 'Usuários', icon: Users, activeClass: 'from-purple-600 to-purple-700' },
        { id: 'tickets', label: 'Ingressos', icon: Ticket, activeClass: 'from-emerald-600 to-emerald-700' },
      ]
    : [
        { id: 'events', label: 'Eventos', icon: Calendar, activeClass: 'from-blue-600 to-blue-700' },
        { id: 'myTickets', label: 'Meus ingressos', icon: Ticket, activeClass: 'from-emerald-600 to-emerald-700' },
        { id: 'account', label: 'Minha conta', icon: User, activeClass: 'from-purple-600 to-purple-700' },
      ];

  const renderModal = () => {
    const ticketTypesOptions = selectedEvent?.ticketTypes || [];
    const selectedTicketType = selectedEvent ? getSelectedTicketType() : null;
    const maxQuantityForSelectedType = selectedTicketType
      ? Math.min(20, getTicketTypeAvailability(selectedTicketType))
      : 0;
    const isSelectedTypeSoldOut = selectedTicketType ? maxQuantityForSelectedType === 0 : false;
    const ticketTotalValue = (
      (formData.quantity || 1) *
      (selectedTicketType?.price ? Number(selectedTicketType.price) : 0)
    ).toFixed(2);
    const isTicketPurchaseDisabled =
      modalType === 'ticket' && !isAdmin && (isSelectedTypeSoldOut || !formData.ticketTypeId);

    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] shadow-2xl transform transition-all flex flex-col p-6">
          <div className="flex justify-between items-center mb-6 pr-2">
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

          {modalType === 'ticketView' && editingItem ? (
            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Evento</p>
                <h3 className="text-2xl font-bold text-gray-800">{editingItem.event?.title}</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>
                    {new Date(editingItem.event?.date).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{editingItem.event?.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 uppercase">Preço</p>
                  <p className="text-xl font-semibold text-emerald-600">R$ {Number(editingItem.price).toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className={`text-xl font-semibold ${editingItem.isUsed ? 'text-gray-600' : 'text-emerald-600'}`}>
                    {editingItem.isUsed ? 'Usado' : 'Disponível'}
                  </p>
                </div>
              </div>

              {editingItem.ticketType && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 uppercase">Tipo de ingresso</p>
                  <p className="text-lg font-semibold text-gray-800">{editingItem.ticketType.name}</p>
                </div>
              )}

              {usageCode && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center">
                  <p className="text-sm text-purple-600">Código de validação</p>
                  <p className="text-2xl font-mono font-bold text-purple-700 tracking-widest mt-1">{usageCode}</p>
                </div>
              )}

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleUseTicket}
                  disabled={editingItem.isUsed}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    editingItem.isUsed
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow'
                  }`}
                >
                  {editingItem.isUsed ? 'Ingresso já utilizado' : 'Usar ingresso'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
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
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Tipos de ingresso</p>
                      <p className="text-xs text-gray-500">Defina os valores e quantidades disponíveis</p>
                    </div>
                    <button
                      type="button"
                      onClick={addTicketTypeRow}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Adicionar tipo
                    </button>
                  </div>
                  {ensureTicketTypesArray(formData.ticketTypes).map((type, index, array) => (
                    <div
                      key={type.id || index}
                      className="grid md:grid-cols-3 gap-3 border border-gray-100 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                        <input
                          type="text"
                          value={type.name}
                          onChange={e => handleTicketTypeFieldChange(index, 'name', e.target.value)}
                          placeholder="Ex: Pista"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Preço (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={type.price}
                          onChange={e =>
                            handleTicketTypeFieldChange(
                              index,
                              'price',
                              e.target.value === '' ? '' : parseFloat(e.target.value),
                            )
                          }
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                          <input
                            type="number"
                            min="0"
                            value={type.quantity}
                            onChange={e => handleTicketTypeFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                            placeholder="0"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        {array.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketTypeRow(index)}
                            className="self-end text-sm text-red-600 hover:text-red-700 px-2 py-1"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {modalType === 'ticket' && (
              <>
                {isAdmin && (
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
                  </>
                )}
                {!isAdmin && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Evento selecionado</p>
                      <p className="font-semibold text-gray-800">
                        {selectedEvent?.title || 'Selecione um evento para comprar'}
                      </p>
                      {selectedEvent && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <MapPin size={14} />
                          {selectedEvent.location}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ingresso</label>
                      <select
                        value={formData.ticketTypeId || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            ticketTypeId: e.target.value,
                            quantity: 1,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        {ticketTypesOptions.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name} - R$ {Number(type.price).toFixed(2)}
                          </option>
                        ))}
                      </select>
                      {selectedTicketType && (
                        <p className="text-sm text-gray-500 mt-1">
                          {getTicketTypeAvailability(selectedTicketType) > 0
                            ? `${getTicketTypeAvailability(selectedTicketType)} disponíveis`
                            : 'Esgotado'}
                        </p>
                      )}
                    </div>
                  </>
                )}
                {isAdmin ? (
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
                ) : (
                  <>
                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">Valor unitário</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        R$ {selectedTicketType ? Number(selectedTicketType.price).toFixed(2) : '0,00'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        max={Math.max(1, maxQuantityForSelectedType || 1)}
                        disabled={isSelectedTypeSoldOut}
                        value={formData.quantity || 1}
                        onChange={e => {
                          const value = parseInt(e.target.value, 10);
                          setFormData({
                            ...formData,
                            quantity: Number.isNaN(value) ? 1 : value,
                          });
                        }}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                          isSelectedTypeSoldOut ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                        }`}
                        required
                      />
                      {selectedTicketType && (
                        <p className="text-sm text-gray-500 mt-2">
                          Total: R$ {ticketTotalValue}
                        </p>
                      )}
                      {isSelectedTypeSoldOut && (
                        <p className="text-sm text-red-500 mt-1">Este tipo de ingresso está esgotado.</p>
                      )}
                    </div>
                  </>
                )}
                {editingItem && isAdmin && (
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
                disabled={isTicketPurchaseDisabled}
                className={`flex-1 py-3 rounded-lg font-medium shadow-lg transition-all ${
                  isTicketPurchaseDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                }`}
              >
                {editingItem ? 'Atualizar' : modalType === 'ticket' && !isAdmin ? 'Comprar' : 'Criar'}
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
          )}
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
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${tab.activeClass} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {isAdmin && activeTab === 'users' && renderUsers()}
          {activeTab === 'events' && renderEvents()}
          {isAdmin && activeTab === 'tickets' && renderTickets(true)}
          {!isAdmin && activeTab === 'myTickets' && renderTickets(false)}
          {!isAdmin && activeTab === 'account' && renderAccount()}
        </div>
      </div>

      {renderModal()}
    </div>
  );
}
