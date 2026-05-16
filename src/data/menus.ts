import { createClient } from '@supabase/supabase-js';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  is_visible: boolean;
  is_proposed: boolean;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let menuCache: MenuItem[] | null = null;

export const fetchMenus = async (): Promise<MenuItem[]> => {
  if (menuCache) return menuCache;

  const { data, error } = await supabase
    .from('menu')
    .select('id, name, description, emoji, is_visible')
    .eq('is_visible', true);

  if (error) {
    console.error('Failed to fetch menus:', error);
    return [];
  }

  menuCache = data || [];
  return menuCache;
};

export const getTotalMenuCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('menu')
    .select('*', { count: 'exact', head: true })
    .eq('is_visible', true);

  if (error) {
    console.error('Failed to get menu count:', error);
    return 0;
  }

  return count || 0;
};

export const getRandomMenus = async (count: number): Promise<MenuItem[]> => {
  const menus = await fetchMenus();
  const shuffled = [...menus].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getRandomMenu = async (): Promise<MenuItem | null> => {
  const menus = await fetchMenus();
  if (menus.length === 0) return null;
  return menus[Math.floor(Math.random() * menus.length)];
};

export const logMenuPick = async (menu: MenuItem): Promise<boolean> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-menu-pick`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        menu_id: menu.id,
      }),
    });

    if (!response.ok) {
      console.error('Failed to log menu pick:', response.statusText);
      return false;
    }

    const data = await response.json() as { success: boolean; logged: boolean };
    return data.logged === true;
  } catch (error) {
    console.error('Error logging menu pick:', error);
    return false;
  }
};

export const getMenuEmojis = async (): Promise<string[]> => {
  const menus = await fetchMenus();
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of menus) {
    if (m.emoji && !seen.has(m.emoji)) {
      seen.add(m.emoji);
      result.push(m.emoji);
    }
  }
  return result;
};

export const suggestMenu = async (suggestion: {
  name: string;
  description?: string;
  emoji?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const id = crypto.randomUUID();
  const { error } = await supabase.from('menu').insert({
    id,
    name: suggestion.name,
    description: suggestion.description || '',
    emoji: suggestion.emoji || '🍽️',
    is_visible: false,
    is_proposed: true,
  });

  if (error) {
    console.error('Failed to suggest menu:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const logVisit = async (): Promise<void> => {
  const SESSION_KEY = 'visit_logged';
  if (sessionStorage.getItem(SESSION_KEY)) return;

  const sessionId = crypto.randomUUID();
  await supabase.from('visit_log').insert({ session_id: sessionId });
  sessionStorage.setItem(SESSION_KEY, 'true');
};

export interface MenuStats {
  menu_name: string;
  count: number;
}

const getKSTStartDate = (period: 'daily' | 'weekly' | 'monthly'): Date => {
  const nowUTC = new Date();
  const kstOffset = 9 * 60;
  const kstNow = new Date(nowUTC.getTime() + kstOffset * 60 * 1000);

  if (period === 'daily') {
    kstNow.setUTCHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    const dayOfWeek = kstNow.getUTCDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    kstNow.setUTCDate(kstNow.getUTCDate() - daysToMonday);
    kstNow.setUTCHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    kstNow.setUTCDate(1);
    kstNow.setUTCHours(0, 0, 0, 0);
  }

  return new Date(kstNow.getTime() - kstOffset * 60 * 1000);
};

export const getMenuStats = async (period: 'daily' | 'weekly' | 'monthly'): Promise<MenuStats[]> => {
  const startDate = getKSTStartDate(period);

  const { data, error } = await supabase
    .from('pick_log')
    .select('menu_id, menu:menu_id(name)')
    .gte('picked_at', startDate.toISOString());

  if (error) {
    console.error('Failed to fetch menu stats:', error);
    return [];
  }

  const counts: Record<string, number> = {};
  (data || []).forEach((pick) => {
    const name = (pick.menu as { name: string } | null)?.name ?? pick.menu_id;
    counts[name] = (counts[name] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([menu_name, count]) => ({ menu_name, count }))
    .sort((a, b) => b.count - a.count);
};
