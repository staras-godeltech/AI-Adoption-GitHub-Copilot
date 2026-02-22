import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600">
              Cosmetology Booking
            </h1>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Services
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                My Appointments
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Login
              </a>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="flex-grow">
        {children}
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
