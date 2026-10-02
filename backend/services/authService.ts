import { User, UserRole } from '../../types';
import {
  getUsersAction,
  loginAction,
  logoutAction,
  getCurrentUserAction,
  changePasswordAction,
  registerAction,
  deleteUserAction,
  updateUserSpentAction,
  getLoyaltyPointsAction,
  redeemLoyaltyVoucherAction
} from '../actions/authActions';

export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const user = await getCurrentUserAction();
      if (!user) return null;
      return {
        ...user,
        role: user.role as UserRole,
        branch: user.branch || undefined,
        avatar: user.avatar || undefined,
        salary: user.salary || undefined,
        phone: user.phone || undefined,
        commissionRate: user.commissionRate || undefined
      };
    } catch (e) {
      console.error('Failed to get user from server session:', e);
      return null;
    }
  },

  getCurrentUserFromServer: async (): Promise<User | null> => {
    return authService.getCurrentUser();
  },

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

  saveCurrentUser: async (_user: User | null): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('novyn_curr_user');
  },

  login: async (email: string, password: string): Promise<User | null> => {
    const loggedInUser = await loginAction(email, password);
    return loggedInUser as any;
  },

  register: async (name: string, email: string, password: string, role: UserRole, branch?: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    return await registerAction(name, email, password, role, branch, phone);
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    return await changePasswordAction(userId, currentPassword, newPassword);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await deleteUserAction(userId);
  },

  updateUserSpent: async (userId: string, amount: number): Promise<void> => {
    await updateUserSpentAction(userId, amount);
  },

  getLoyaltyPoints: async () => {
    return await getLoyaltyPointsAction();
  },

  redeemLoyaltyVoucher: async (code: string) => {
    return await redeemLoyaltyVoucherAction(code);
  },

  logout: async (): Promise<void> => {
    await logoutAction();
    await authService.saveCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('novyn_redeemed_points');
    }
  }
};
