'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PermissionGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  currentUser: any;
}

export default function PermissionGuard({ allowedRoles, children, currentUser }: PermissionGuardProps) {
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center select-none bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4 animate-bounce shrink-0" />
        <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-2">Không có quyền truy cập</h3>
        <p className="text-xs text-neutral-450 max-w-sm">
          Tài khoản của bạn ({currentUser?.name} - {currentUser?.role}) không được phân quyền truy cập chức năng này. Vui lòng liên hệ Admin để được cấp quyền.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
