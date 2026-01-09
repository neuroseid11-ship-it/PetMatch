
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Gamification from './pages/Gamification';
import AdoptionLeague from './pages/AdoptionLeague';
import SolidarityMap from './pages/SolidarityMap';
import Sponsor from './pages/Sponsor';
import League from './pages/League';
import RegisterPet from './pages/RegisterPet';
import AdoptionList from './pages/AdoptionList';
import PetDetails from './pages/PetDetails';
import AdminManagementHub from './pages/AdminManagementHub';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMessages from './pages/AdminMessages';
import AdminLogs from './pages/AdminLogs';
import AdminMissions from './pages/AdminMissions';
import UserMessages from './pages/UserMessages';
import MuralFeed from './pages/MuralFeed';
import EventsCalendar from './pages/EventsCalendar';
import RegisterUser from './pages/RegisterUser';
import Store from './pages/Store';
import AdminStore from './pages/AdminStore';
import UserProfile from './pages/UserProfile';
import AdminONGs from './pages/AdminONGs';
import AdminPartners from './pages/AdminPartners';
import PartnerCompanies from './pages/PartnerCompanies';
import FAQ from './pages/FAQ';

import { supabase } from './lib/supabaseClient';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        localStorage.setItem('petmatch_user_email', session.user.email);
        // Temporary role mock until we have roles in DB
        if (session.user.email.includes('admin') || session.user.email.includes('neuroseid11')) {
          localStorage.setItem('petmatch_user_role', 'admin');
        } else {
          localStorage.setItem('petmatch_user_role', 'user');
        }
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user?.email) {
        localStorage.setItem('petmatch_user_email', session.user.email);

        // Check/Create Profile Logic could go here or be handled by the protected route wrapper
        // For now, we rely on the UserProfile component to handle the creation if accessed

        if (session.user.email.includes('admin') || session.user.email.includes('neuroseid11')) {
          localStorage.setItem('petmatch_user_role', 'admin');
        } else {
          localStorage.setItem('petmatch_user_role', 'user');
        }
      } else {
        localStorage.removeItem('petmatch_user_email');
        localStorage.removeItem('petmatch_user_role');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Only clear auth data, keeping application data (pets, logs, etc.)
    localStorage.removeItem('petmatch_user_email');
    localStorage.removeItem('petmatch_user_role');
    localStorage.removeItem('sb-access-token'); // If used directly
    localStorage.removeItem('sb-refresh-token'); // If used directly
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#fdfaf7] text-[#5d2e0a] font-black">Carregando...</div>
  }


  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/seja-um-parceiro"
          element={
            <Layout onLogout={handleLogout}>
              <RegisterUser />
            </Layout>
          }
        />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/atividades" element={<Gamification />} />
                  <Route path="/adocao" element={<AdoptionList />} />
                  <Route path="/league-fantasy" element={<AdoptionLeague />} />
                  <Route path="/mapa" element={<SolidarityMap />} />
                  <Route path="/parceiros" element={<PartnerCompanies />} />
                  <Route path="/apadrinhar" element={<Sponsor />} />
                  <Route path="/liga" element={<League />} />
                  <Route path="/cadastrar" element={<RegisterPet />} />
                  <Route path="/editar/:id" element={<RegisterPet />} />
                  <Route path="/pet/:id" element={<PetDetails />} />
                  <Route path="/mural" element={<MuralFeed />} />
                  <Route path="/mensagens" element={<UserMessages />} />
                  <Route path="/eventos" element={<EventsCalendar />} />
                  <Route path="/loja" element={<Store />} />
                  <Route path="/perfil" element={<UserProfile />} />
                  <Route path="/perfil/:id" element={<UserProfile />} />
                  <Route path="/admin" element={<AdminManagementHub />} />
                  <Route path="/admin/pets" element={<AdminDashboard />} />
                  <Route path="/admin/ongs" element={<AdminONGs />} />
                  <Route path="/admin/parceiros" element={<AdminPartners />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/messages" element={<AdminMessages />} />
                  <Route path="/admin/logs" element={<AdminLogs />} />
                  <Route path="/admin/missions" element={<AdminMissions />} />
                  <Route path="/admin/loja" element={<AdminStore />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
