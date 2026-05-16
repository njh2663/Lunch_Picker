import { useState, useEffect } from 'react';
import { LogOut, Utensils, ShieldCheck } from 'lucide-react';
import AdminLogin from './AdminLogin';
import VisitChart from './VisitChart';
import SuggestedMenus from './SuggestedMenus';

interface AdminPageProps {
  onBack: () => void;
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <AdminLogin
        onLogin={() => setAuthenticated(true)}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Utensils className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-white">점메추</span>
            </div>
            <span className="text-gray-600">/</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-gray-300">관리자</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              메인으로
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <VisitChart />
        <SuggestedMenus />
      </main>
    </div>
  );
}
