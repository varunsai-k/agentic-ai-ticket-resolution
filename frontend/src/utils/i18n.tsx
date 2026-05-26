import React, { createContext, useContext, useState } from 'react';

// Define the shape of our translation dictionary
const translations = {
  en: {
    // Auth / Login
    'auth.welcome': 'Welcome',
    'auth.sub': 'Intelligent support copilot for customer service',
    'auth.title': 'Sign In',
    'auth.desc': 'Enter your credentials to access the panel',
    'auth.user': 'Username',
    'auth.pass': 'Password',
    'auth.placeholder.user': 'e.g. demo',
    'auth.btn': 'Sign In',
    'auth.error': 'Invalid credentials. Please try again.',
    'auth.footer': 'High Security Technical Support · Resolv.AI © 2026',

    // Sidebar & Navigation
    'nav.brand': 'Resolv.AI',
    'nav.enterprise': 'Enterprise',
    'nav.dashboard': 'Dashboard',
    'nav.tickets': 'Tickets',
    'nav.agent': 'Human Agent',
    'nav.logout': 'Sign Out',
    'nav.change_lang': 'Español',

    // Home / Dashboard
    'home.badge': 'Resolv.AI Agent Active',
    'home.title': 'Intelligent Support Copilot',
    'home.desc': 'Monitor support tickets in real-time and collaborate with the Artificial Intelligence agent to resolve complex incidents.',
    'home.btn': 'Go to Tickets',
    'home.stats.total': 'Total Tickets',
    'home.stats.total.sub': 'Registered incidents',
    'home.stats.resolved': 'Resolved',
    'home.stats.resolved.sub': 'of total tickets',
    'home.stats.review': 'In Review',
    'home.stats.review.sub': 'Require human attention',
    'home.stats.confidence': 'AI Confidence',
    'home.stats.confidence.sub': 'Average AI accuracy rate',
    'home.critical.title': 'Recent Critical Tickets',
    'home.critical.desc': 'Priority support incidents requiring immediate resolution',
    'home.critical.view_all': 'View all',
    'home.critical.empty': 'No tickets have been registered yet.',
    'home.agent_health.title': 'AI Agent Status',
    'home.agent_health.desc': 'LLM execution health and metrics',
    'home.agent_health.latency': 'Network Latency',
    'home.agent_health.latency.status': '120ms (Optimal)',
    'home.agent_health.vector': 'Vector Database',
    'home.agent_health.vector.status': 'Qdrant Active',
    'home.agent_health.autonomous': 'Autonomous Resolutions',
    'home.agent_health.escalations': 'Human Escalations',

    // Tickets List
    'tickets.title': 'Incident Tray',
    'tickets.desc': 'Manage and audit assigned or escalated tickets',
    'tickets.sync': 'Sync Data',
    'tickets.filter.all': 'All',
    'tickets.filter.pending': 'Pending',
    'tickets.filter.resolved': 'Resolved',
    'tickets.search.placeholder': 'Search by title, ID or client...',
    'tickets.empty.title': 'No incidents found',
    'tickets.empty.desc': 'Try adjusting your filters or search terms',
    'tickets.client_label': 'Client',
    'tickets.priority.high': 'High',
    'tickets.priority.medium': 'Medium',
    'tickets.priority.normal': 'Normal',

    // Ticket Detail & Chat
    'detail.title': 'Incident Details',
    'detail.client': 'Client / Submitter',
    'detail.category': 'Category',
    'detail.confidence.label': 'Agent Confidence',
    'detail.confidence.optimal': 'Optimal level. Autonomous response suggested.',
    'detail.confidence.low': 'Low level. Requires human review and approval.',
    'detail.actions': 'Quick Actions',
    'detail.actions.execute': 'Execute AI Copilot',
    'detail.actions.approve': 'Approve AI Response',
    'detail.chat.title': 'Conversation History',
    'detail.chat.desc': 'Agent Resolution & Audit',
    'detail.chat.closed': 'Ticket Closed',
    'detail.chat.active': 'Active Thread',
    'detail.chat.ai_typing': 'AI Agent analyzing reference documents...',
    'detail.chat.suggested': 'Suggested AI Response (Click to edit/copy)',
    'detail.chat.placeholder': 'Draft final resolution response...',
    'detail.chat.resolved_banner': 'This incident has been resolved and closed successfully.',
    'detail.chat.system': 'System',
    'detail.chat.agent': 'Resolv.AI',
    'detail.chat.human': 'Human Agent (You)',
    'detail.chat.error': 'Error submitting final resolution.'
  },
  es: {
    // Auth / Login
    'auth.welcome': 'Bienvenido',
    'auth.sub': 'Copiloto inteligente para soporte al cliente',
    'auth.title': 'Iniciar Sesión',
    'auth.desc': 'Ingresa tus credenciales para acceder al panel',
    'auth.user': 'Usuario',
    'auth.pass': 'Contraseña',
    'auth.placeholder.user': 'ej. demo',
    'auth.btn': 'Iniciar Sesión',
    'auth.error': 'Credenciales inválidas. Por favor intenta de nuevo.',
    'auth.footer': 'Soporte Técnico de Alta Seguridad · Resolv.AI © 2026',

    // Sidebar & Navigation
    'nav.brand': 'Resolv.AI',
    'nav.enterprise': 'Enterprise',
    'nav.dashboard': 'Dashboard',
    'nav.tickets': 'Tickets',
    'nav.agent': 'Agente Humano',
    'nav.logout': 'Cerrar Sesión',
    'nav.change_lang': 'English',

    // Home / Dashboard
    'home.badge': 'Agente Resolv.AI Activo',
    'home.title': 'Copiloto Inteligente de Soporte',
    'home.desc': 'Monitorea tickets de soporte en tiempo real y colabora con el agente de Inteligencia Artificial para resolver incidentes complejos.',
    'home.btn': 'Ir a mis Tickets',
    'home.stats.total': 'Total Tickets',
    'home.stats.total.sub': 'Incidentes registrados',
    'home.stats.resolved': 'Resueltos',
    'home.stats.resolved.sub': 'del total general',
    'home.stats.review': 'En Revisión',
    'home.stats.review.sub': 'Requieren atención humana',
    'home.stats.confidence': 'Confianza IA',
    'home.stats.confidence.sub': 'Tasa media de acierto de IA',
    'home.critical.title': 'Tickets Críticos Recientes',
    'home.critical.desc': 'Incidentes de soporte prioritarios que requieren resolución inmediata',
    'home.critical.view_all': 'Ver todos',
    'home.critical.empty': 'No se han registrado tickets aún.',
    'home.agent_health.title': 'Estado del Agente de IA',
    'home.agent_health.desc': 'Salud y métricas de ejecución del modelo LLM',
    'home.agent_health.latency': 'Latencia de Red',
    'home.agent_health.latency.status': '120ms (Óptimo)',
    'home.agent_health.vector': 'Base Vectorial',
    'home.agent_health.vector.status': 'Qdrant Activa',
    'home.agent_health.autonomous': 'Resoluciones Autónomas',
    'home.agent_health.escalations': 'Escalados a Humano',

    // Tickets List
    'tickets.title': 'Bandeja de Incidentes',
    'tickets.desc': 'Administra y revisa los tickets asignados o escalados',
    'tickets.sync': 'Sincronizar',
    'tickets.filter.all': 'Todos',
    'tickets.filter.pending': 'Pendientes',
    'tickets.filter.resolved': 'Resueltos',
    'tickets.search.placeholder': 'Buscar por título, ID o cliente...',
    'tickets.empty.title': 'No se encontraron incidentes',
    'tickets.empty.desc': 'Intenta ajustando tus filtros o términos de búsqueda',
    'tickets.client_label': 'Cliente',
    'tickets.priority.high': 'Alta',
    'tickets.priority.medium': 'Media',
    'tickets.priority.normal': 'Normal',

    // Ticket Detail & Chat
    'detail.title': 'Detalles del Incidente',
    'detail.client': 'Cliente / Solicitante',
    'detail.category': 'Categoría',
    'detail.confidence.label': 'Confianza del Agente',
    'detail.confidence.optimal': 'Nivel óptimo. Respuesta autónoma sugerida.',
    'detail.confidence.low': 'Nivel bajo. Requiere validación y aprobación humana.',
    'detail.actions': 'Acciones Rápidas',
    'detail.actions.execute': 'Ejecutar Copiloto IA',
    'detail.actions.approve': 'Aprobar Respuesta IA',
    'detail.chat.title': 'Historial de Conversación',
    'detail.chat.desc': 'Resolución y Auditoría del Agente',
    'detail.chat.closed': 'Ticket Cerrado',
    'detail.chat.active': 'Hilo Activo',
    'detail.chat.ai_typing': 'Agente de IA analizando los documentos de referencia...',
    'detail.chat.suggested': 'Respuesta IA Sugerida (Haz clic para editar/copiar)',
    'detail.chat.placeholder': 'Redactar respuesta de resolución final...',
    'detail.chat.resolved_banner': 'Este incidente ha sido resuelto y cerrado con éxito.',
    'detail.chat.system': 'Sistema',
    'detail.chat.agent': 'Resolv.AI',
    'detail.chat.human': 'Agente Humano (Tú)',
    'detail.chat.error': 'Error enviando la resolución final.'
  }
};

type Language = 'en' | 'es';

interface I18nContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('lang') as Language) || 'en'
  );

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'es' : 'en';
      localStorage.setItem('lang', next);
      return next;
    });
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
