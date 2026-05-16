import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { MenuItem, getRandomMenus, logMenuPick } from '../data/menus';
import MenuModal from './MenuModal';

export default function CardPicker() {
  const [cards, setCards] = useState<MenuItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<MenuItem | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      const loaded = await getRandomMenus(10);
      setCards(loaded);
    };
    loadCards();
  }, []);

  const handleShuffle = async () => {
    setIsShuffling(true);
    setSelectedCard(null);
    setTimeout(async () => {
      const loaded = await getRandomMenus(10);
      setCards(loaded);
      setIsShuffling(false);
    }, 500);
  };

  const handleCardClick = (menu: MenuItem) => {
    setSelectedCard(menu);
    setShowModal(true);
    logMenuPick(menu);
  };

  return (
    <div className="w-full p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">카드 뽑기</h2>
        <p className="text-gray-600">10개의 카드 중 하나를 선택하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {cards.map((menu) => (
          <button
            key={menu.id}
            onClick={() => handleCardClick(menu)}
            className={`relative p-5 rounded-2xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center text-center ${
              selectedCard?.id === menu.id
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-2xl scale-105'
                : 'bg-white text-gray-800 shadow-lg hover:shadow-xl'
            } ${isShuffling ? 'animate-pulse' : ''}`}
          >
            <div className="text-5xl mb-3">{menu.emoji}</div>
            <div className="font-bold text-base mb-1">{menu.name}</div>
            <div className={`text-xs line-clamp-2 leading-relaxed ${selectedCard?.id === menu.id ? 'text-white/90' : 'text-gray-500'}`}>
              {menu.description || menu.category}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <RefreshCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
          새로운 카드 뽑기
        </button>
      </div>

      {showModal && selectedCard && (
        <MenuModal
          menu={selectedCard}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
