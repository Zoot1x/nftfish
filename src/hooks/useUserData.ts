import { useEffect, useState } from 'react';
import { Gift } from '@/config/gifts';

interface UserData {
  userId: string;
  spins: number;
  inventory: Gift[];
  hasSubscribed: boolean;
  isAuthenticated: boolean;
  lastUpdated: number;
}

const STORAGE_KEY = 'userGameData';
const USER_ID_KEY = 'userId';

/**
 * Генерирует уникальный ID пользователя
 */
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Получает или создает уникальный ID пользователя
 */
const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

/**
 * Хук для управления данными пользователя с localStorage
 */
export const useUserData = () => {
  const [userId, setUserId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Инициализируем userId при монтировании
  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsLoaded(true);
  }, []);

  /**
   * Загружает данные пользователя из localStorage
   */
  const loadUserData = (): UserData | null => {
    if (!userId) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  };

  /**
   * Сохраняет данные пользователя в localStorage
   */
  const saveUserData = (data: Partial<UserData>) => {
    if (!userId) return;
    try {
      const existing = loadUserData() || getDefaultUserData(userId);
      const updated = {
        ...existing,
        ...data,
        userId,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  /**
   * Возвращает данные по умолчанию для нового пользователя
   */
  const getDefaultUserData = (id: string): UserData => ({
    userId: id,
    spins: 0,
    inventory: [],
    hasSubscribed: false,
    isAuthenticated: false,
    lastUpdated: Date.now(),
  });

  return {
    userId,
    isLoaded,
    loadUserData,
    saveUserData,
    getDefaultUserData,
  };
};

export type { UserData };
