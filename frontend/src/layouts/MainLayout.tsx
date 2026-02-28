import React from 'react';
import { Outlet } from 'react-router-dom';
import NavMenu from '../components/NavMenu';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <NavMenu />
      </header>

      <main className="flex-grow">
        {children ?? <Outlet />}
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Cosmetology Booking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
