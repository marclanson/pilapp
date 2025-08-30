
import React, { useState, useMemo } from 'react';
import { useAppData } from './hooks/useAppData';
import DashboardScreen from './screens/DashboardScreen';
import ClientsScreen from './screens/ClientsScreen';
import TemplatesScreen from './screens/TemplatesScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import { Page } from './types';
import { Calendar, Users, ClipboardList, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const data = useAppData();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <DashboardScreen data={data} />;
      case Page.CLIENTS:
        return <ClientsScreen data={data} />;
      case Page.TEMPLATES:
        return <TemplatesScreen data={data} />;
      case Page.ATTENDANCE:
        return <AttendanceScreen data={data} />;
      default:
        return <DashboardScreen data={data} />;
    }
  };

  const navItems = useMemo(() => [
    { page: Page.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { page: Page.CLIENTS, label: 'Clients', icon: Users },
    { page: Page.TEMPLATES, label: 'Pack Templates', icon: ClipboardList },
    { page: Page.ATTENDANCE, label: 'Attendance', icon: Calendar },
  ], []);

  return (
    <div className="min-h-screen bg-secondary font-sans text-primary-dark">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-4 sm:py-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-dark mb-4 sm:mb-0">
              TicketTrack Pilates
            </h1>
            <nav>
              <ul className="flex flex-wrap justify-center items-center space-x-1 sm:space-x-2">
                {navItems.map(item => (
                  <li key={item.page}>
                    <button
                      onClick={() => setCurrentPage(item.page)}
                      className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                        currentPage === item.page
                          ? 'bg-accent/10 text-accent'
                          : 'text-slate-600 hover:bg-slate-200/60 hover:text-primary-dark'
                      }`}
                      aria-current={currentPage === item.page ? 'page' : undefined}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;