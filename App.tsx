
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
    <div className="min-h-screen bg-secondary font-sans">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-20 py-4 sm:py-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 sm:mb-0">
              TicketTrack Pilates
            </h1>
            <nav>
              <ul className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
                {navItems.map(item => (
                  <li key={item.page}>
                    <button
                      onClick={() => setCurrentPage(item.page)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        currentPage === item.page
                          ? 'bg-primary-dark'
                          : 'hover:bg-primary-dark/50'
                      }`}
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
