import { useState } from 'react';
import { Utensils, Settings } from 'lucide-react';
import CardPicker from './components/CardPicker';
import SlotMachine from './components/SlotMachine';
import MenuStats from './components/MenuStats';
import MenuList from './components/MenuList';
import MenuSuggest from './components/MenuSuggest';
import AdminPage from './components/admin/AdminPage';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Utensils className="w-12 h-12 text-orange-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              점메추
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            빨리 골라야 빨리 쉽니다!
          </p>
        </header>

        <main className="space-y-12 mb-12">
          <div>
            <SlotMachine />
          </div>
          <div>
            <CardPicker />
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <MenuStats />
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <MenuList />
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <MenuSuggest />
          </div>
        </main>

        <footer className="text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-3">
            <p>made by namjaeng</p>
            <button
              onClick={() => setShowAdmin(true)}
              className="inline-flex items-center gap-1 text-gray-300 hover:text-gray-500 transition-colors text-xs border border-gray-200 hover:border-gray-300 rounded-lg px-2 py-1"
            >
              <Settings className="w-3 h-3" />
              관리자 페이지
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
