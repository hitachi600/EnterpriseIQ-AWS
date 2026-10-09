import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Department, Classification } from '../types';
import { DEMO_USERS } from '../mock/mockData';

interface AuthContextType {
  currentUser: User;
  switchPersona: (userId: string) => void;
  allPersonas: User[];
  isAdmin: boolean;
  clearanceLevels: Classification[];
  activeDepartment: Department;
  isCustomAuth: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'enterpriseiq_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = DEMO_USERS.find(u => u.id === parsed.id);
        if (match) return match;
      }
    } catch (e) {
      console.warn('Failed to load user from localStorage:', e);
    }
    return DEMO_USERS[0]; // Default: Gautham (Engineering Lead)
  });

  const [isCustomAuth, setIsCustomAuth] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Failed to persist user to localStorage:', e);
    }
  }, [currentUser]);

  const switchPersona = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsCustomAuth(false);
    }
  };

  const logout = () => {
    // Reset to default guest or first user
    setCurrentUser(DEMO_USERS[0]);
  };

  const isAdmin = currentUser.role === 'Admin' || currentUser.department === 'All Departments';
  const clearanceLevels = currentUser.clearanceLevel;
  const activeDepartment = currentUser.department;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchPersona,
        allPersonas: DEMO_USERS,
        isAdmin,
        clearanceLevels,
        activeDepartment,
        isCustomAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
