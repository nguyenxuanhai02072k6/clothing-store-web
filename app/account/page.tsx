'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '@/lib/utils';
import { authService } from '@/backend/services/authService';
import { VoucherQrViewModal } from '../../components/common/VoucherQrViewModal';
import AccountAuthForm from '../../components/account/AccountAuthForm';
import AccountSidebar from '../../components/account/AccountSidebar';
import AccountProfileTab from '../../components/account/AccountProfileTab';
import AccountWishlistTab from '../../components/account/AccountWishlistTab';
import AccountOrderHistoryTab from '../../components/account/AccountOrderHistoryTab';
import AccountMembershipTab from '../../components/account/AccountMembershipTab';
import AccountAddressBookTab from '../../components/account/AccountAddressBookTab';

export default function AccountPage() {
  const {
    currentUser,
    login,
    register,
    changePassword,
    logout,
    refreshUser,
    allOrders
  } = useAuth();

  const { showToast } = useToast();
  const { wishlist, addDynamicPromoCode } = useCart();
  const router = useRouter();

  // Navigation / Tabs inside Dashboard
  const [activeTab, setActiveTab] = useState('profile');

  // Handle OAuth callback status from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get('oauth');
    const oauthError = params.get('oauth_error');

    if (oauthStatus === 'success') {
      refreshUser();
      showToast('Đăng nhập thành công! Chào mừng bạn quay lại.', 'success');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauthError) {
      showToast(decodeURIComponent(oauthError) || 'Đăng nhập mạng xã hội thất bại!', 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshUser, showToast]);

  // Loyalty Points State
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [qrVoucherModal, setQrVoucherModal] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      authService.getLoyaltyPoints().then((res) => {
        if (isMounted && res.success) {
          setRedeemedPoints(res.redeemedPoints);
        }
      });
    } else {
      setRedeemedPoints(0);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleRedeemVoucher = async (cost: number, value: number, code: string) => {
    try {
      const res = await authService.redeemLoyaltyVoucher(code);
      if (!res.success) {
        showToast(res.message || 'Số điểm tích lũy của bạn không đủ để đổi voucher này!', 'error');
        return;
      }

      setRedeemedPoints(res.redeemedPoints ?? (redeemedPoints + cost));
      addDynamicPromoCode(code, 'fixed', value, `Voucher Loyalty VIP đổi từ điểm thưởng - Giảm ${formatPrice(value)}`);
      showToast(`Đổi điểm thành công! Đã tạo mã ${code} giảm ${formatPrice(value)} vào giỏ hàng.`, 'success');
      setQrVoucherModal({
        code,
        value,
        type: 'fixed',
        description: `Voucher VIP Loyalty đổi từ điểm thưởng - Giảm ${formatPrice(value)}`
      });
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đổi điểm thưởng!', 'error');
    }
  };

  // Redirect internal staff to /internal with full page navigation to ensure session cookie is sent
  useEffect(() => {
    if (currentUser && currentUser.role !== 'customer') {
      window.location.href = '/internal';
    }
  }, [currentUser]);

  // Address Book states
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      try {
        const stored = localStorage.getItem(`novyn_addresses_${currentUser.id}`);
        if (stored) {
          setAddresses(JSON.parse(stored));
        } else {
          setAddresses([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  // Order Tracking states
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Filter orders for the logged-in customer
  const customerOrders = useMemo(() => {
    if (!currentUser || !allOrders) return [];
    return allOrders.filter((ord: any) => {
      const emailMatch = ord.customerInfo.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
      const phoneMatch = currentUser.phone && ord.customerInfo.phone.trim() === currentUser.phone.trim();
      return emailMatch || phoneMatch;
    });
  }, [allOrders, currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <AccountAuthForm
            login={login}
            register={register}
            showToast={showToast}
            onSuccessRedirect={(email) => {
              if (email !== 'customer@novynwear.com') {
                window.location.href = '/internal';
              }
            }}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Profile & Menu Card (Sidebar) */}
            <AccountSidebar
              currentUser={currentUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              wishlistCount={wishlist.length}
              addressesCount={addresses.length}
              logout={logout}
              onNavigateOrders={() => {
                setTrackingOrderId(null);
                setActiveTab('orders');
              }}
              onNavigateAddresses={() => {
                setTrackingOrderId(null);
                setActiveTab('addresses');
              }}
            />

            {/* Right Main Display Panel */}
            <div className="lg:col-span-9 bg-white border border-brand-border rounded-2xl shadow-sm p-6 sm:p-8 min-h-[500px]">
              {activeTab === 'profile' && (
                <AccountProfileTab
                  currentUser={currentUser}
                  changePassword={changePassword}
                  showToast={showToast}
                />
              )}

              {activeTab === 'wishlist' && (
                <AccountWishlistTab wishlist={wishlist} />
              )}

              {activeTab === 'orders' && (
                <AccountOrderHistoryTab
                  customerOrders={customerOrders}
                  trackingOrderId={trackingOrderId}
                  setTrackingOrderId={setTrackingOrderId}
                />
              )}

              {activeTab === 'membership' && (
                <AccountMembershipTab
                  currentUser={currentUser}
                  redeemedPoints={redeemedPoints}
                  handleRedeemVoucher={handleRedeemVoucher}
                  setQrVoucherModal={setQrVoucherModal}
                />
              )}

              {activeTab === 'addresses' && (
                <AccountAddressBookTab
                  addresses={addresses}
                  setAddresses={setAddresses}
                  currentUser={currentUser}
                  showToast={showToast}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loyalty Voucher QR Modal */}
      <VoucherQrViewModal
        isOpen={!!qrVoucherModal}
        onClose={() => setQrVoucherModal(null)}
        voucher={qrVoucherModal}
      />
    </div>
  );
}
