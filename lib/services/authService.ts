import { User, UserRole } from '../../types';
import {
  getUsersAction,
  loginAction,
  changePasswordAction,
  registerAction,
  deleteUserAction,
  updateUserSpentAction
} from '../actions/authActions';

const CURR_USER_KEY = 'novyn_curr_user';

export const authService = {
  getUsers: async (): Promise<User[]> => {
    const users = await getUsersAction();
    return users.map(u => ({
      ...u,
      role: u.role as UserRole,
      branch: u.branch || undefined,
      avatar: u.avatar || undefined,
      salary: u.salary || undefined,
      phone: u.phone || undefined,
      commissionRate: u.commissionRate || undefined
    }));
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CURR_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  saveCurrentUser: async (user: User | null): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(CURR_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURR_USER_KEY);
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const loggedInUser = await loginAction(email, password);
    if (loggedInUser) {
      await authService.saveCurrentUser(loggedInUser as any);
      return loggedInUser as any;
    }
    return null;
  },

  register: async (name: string, email: string, password: string, role: UserRole, branch?: string, phone?: string): Promise<boolean> => {
    const result = await registerAction(name, email, password, role, branch, phone);
    return result.success;
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    return await changePasswordAction(userId, currentPassword, newPassword);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await deleteUserAction(userId);
  },

  updateUserSpent: async (userId: string, amount: number): Promise<void> => {
    await updateUserSpentAction(userId, amount);
  }
};
