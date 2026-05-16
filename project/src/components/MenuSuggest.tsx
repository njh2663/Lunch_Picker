import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { suggestMenu, getMenuEmojis } from '../data/menus';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function MenuSuggest() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [emojiOptions, setEmojiOptions] = useState<string[]>([]);

  useEffect(() => {
    getMenuEmojis().then(setEmojiOptions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    const result = await suggestMenu({
      name: name.trim(),
      description: description.trim(),
      emoji: emoji || '🍽️',
    });

    if (result.success) {
      setStatus('success');
      setName('');
      setDescription('');
      setEmoji('');
    } else {
      setStatus('error');
      setErrorMsg(result.error || '제안 중 오류가 발생했습니다.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMsg('');
  };

  if (status === 'success') {
    return (
      <div className="w-full p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">메뉴 제안하기</h3>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mb-3" />
          <p className="text-lg font-bold text-gray-800 mb-1">제안해 주셔서 감사합니다!</p>
          <p className="text-sm text-gray-500 mb-6">검토 후 메뉴풀에 추가될 예정입니다.</p>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            다른 메뉴 제안하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-5 h-5 text-orange-400" />
        <h3 className="text-2xl font-bold text-gray-800">메뉴 제안하기</h3>
      </div>
      <p className="text-sm text-gray-400 mb-5">원하는 메뉴가 없다면 직접 제안해 주세요. 검토 후 추가됩니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            메뉴 이름 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) 부대찌개, 파스타, 스시..."
            maxLength={30}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">이모지 (선택)
</label>
          <div className="flex gap-2 flex-wrap">
            {emojiOptions.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e === emoji ? '' : e)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  emoji === e
                    ? 'bg-orange-100 ring-2 ring-orange-400 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 메뉴에 대한 간단한 설명을 입력해 주세요."
            rows={2}
            maxLength={100}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition resize-none"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim() || status === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {status === 'loading' ? '제출 중...' : '제안하기'}
        </button>
      </form>
    </div>
  );
}
