import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLogout={onLogout} />

      <main className="flex-1 p-4 md:p-10 max-w-[1400px] mx-auto w-full">
        {children}
      </main>

      <div className="grass-footer-container">
        <div className="grass-layer grass-layer-back"></div>
        <div className="grass-layer grass-layer-front"></div>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
