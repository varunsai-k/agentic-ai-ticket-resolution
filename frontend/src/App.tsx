import { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Tickets } from './pages/Tickets';
import { TicketDetail } from './pages/TicketDetail';
import { getCurrentUserData } from './utils/api';

interface Ticket {
  ticket_id: string;
  user_id: string;
  username: string;
  category: string;
  title_query: string;
  ticket_description: string;
  status: string;
  priority: string;
  resolution_state: string;
  created_at: string;
  ai_response?: string;
  ai_confidence?: number;
  final_response?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [currentUser, setCurrentUser] = useState<{ username: string; id: string } | null>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'tickets'>('home');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Sync token state and pull token profile data
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      const userProfile = getCurrentUserData();
      setCurrentUser(userProfile);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setCurrentUser(null);
    }
  }, [token, username]);

  const handleLoginSuccess = (userToken: string, userLogin: string) => {
    setUsername(userLogin);
    setToken(userToken);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    setSelectedTicket(null);
    setActiveTab('home');
  };

  // If unauthorized, redirect directly to the login portal
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setSelectedTicket(null);
        setActiveTab(tab);
      }}
      username={username}
      onLogout={handleLogout}
    >
      {selectedTicket ? (
        <TicketDetail
          ticket={selectedTicket}
          currentUser={currentUser}
          onBack={() => setSelectedTicket(null)}
        />
      ) : activeTab === 'home' ? (
        <Home onViewTickets={() => setActiveTab('tickets')} />
      ) : (
        <Tickets onSelectTicket={(ticket) => setSelectedTicket(ticket)} />
      )}
    </Layout>
  );
}
