import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updatePhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { firstName: string; lastName: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'yeni_nefes_users';
const CURRENT_USER_KEY = 'yeni_nefes_current_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load current user from localStorage on mount
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }, []);

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'userNotFound' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'invalidPassword' };
    }
    
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string; phone: string }): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'emailExists' };
    }
    
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
    };
    
    saveUsers([...users, newUser]);
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'notLoggedIn' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, error: 'userNotFound' };
    
    if (users[userIndex].password !== currentPassword) {
      return { success: false, error: 'invalidCurrentPassword' };
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    return { success: true };
  };

  const updatePhone = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'notLoggedIn' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, error: 'userNotFound' };
    
    users[userIndex].phone = phone;
    saveUsers(users);
    
    const updatedUser = { ...user, phone };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    
    return { success: true };
  };

  const updateProfile = async (data: { firstName: string; lastName: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'notLoggedIn' };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return { success: false, error: 'userNotFound' };
    
    users[userIndex].firstName = data.firstName;
    users[userIndex].lastName = data.lastName;
    saveUsers(users);
    
    const updatedUser = { ...user, firstName: data.firstName, lastName: data.lastName };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updatePassword, updatePhone, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
