'use client';

import React from 'react';
import MultiCartPOS from './pos/MultiCartPOS';
import VariantStockMatrix from './warehouse/VariantStockMatrix';
import { StockerTransferSubsystem } from './subsystems/StockerTransferSubsystem';
import { DamagedGoodsSubsystem } from './subsystems/DamagedGoodsSubsystem';
import { AccountantPayrollSubsystem } from './subsystems/AccountantPayrollSubsystem';
import { CSKHCRMSubsystem } from './subsystems/CSKHCRMSubsystem';
import FinanceReconSubsystem from './subsystems/FinanceReconSubsystem';
import AICopilotSubsystem from './subsystems/AICopilotSubsystem';
import { OmnichannelSubsystem } from './subsystems/OmnichannelSubsystem';
import { ProductsDatabaseSubsystem } from './subsystems/ProductsDatabaseSubsystem';
import { CouponsManagementSubsystem } from './subsystems/CouponsManagementSubsystem';
import { SettingsSubsystem } from './subsystems/SettingsSubsystem';

export interface ERPSubsystemsProps {
  activeTab: string;
  currentUser: any;
  usersList: any[];
  productsList: any[];
  branchStock: any;
  restockBranchProduct: any;
  refreshInventoryStocks?: () => Promise<void>;
  onSwitchToTransferTab?: () => void;
  allOrders: any[];
  createOrder: any;
  payrollRecords: any[];
  paySalary: any;
  expensesList: any[];
  addExpense: any;
  deleteExpense: any;
  addPayrollRecord: any;
  restockRecords: any[];
  attendanceLogs: any[];
  shiftRequests: any[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  
  // POS States & Setters
  posSearchQuery?: string;
  setPosSearchQuery?: (v: string) => void;
  posBarcodeScan?: string;
  setPosBarcodeScan?: (v: string) => void;
  posCart?: any[];
  setPosCart?: (v: any[]) => void;
  posCustomerPhone?: string;
  setPosCustomerPhone?: (v: string) => void;
  posSelectedCustomer?: any | null;
  setPosSelectedCustomer?: (v: any) => void;
  posPaymentMethod?: 'cash' | 'transfer' | 'wallet';
  setPosPaymentMethod?: (v: 'cash' | 'transfer' | 'wallet') => void;
  posPromoCode?: string;
  setPosPromoCode?: (v: string) => void;
  posPromoDiscount?: number;
  setPosPromoDiscount?: (v: number) => void;
  posPrintedReceipt?: any | null;
  setPosPrintedReceipt?: (v: any) => void;
  posReceiptMail?: string;
  setPosReceiptMail?: (v: string) => void;
  posHistory: any[];
  setPosHistory: (v: any[]) => void;

  // Inventory & Transfer States & Setters
  transfers: any[];
  setTransfers: (v: any[]) => void;
  newTransferProductId?: string;
  setNewTransferProductId?: (v: string) => void;
  newTransferSize?: string;
  setNewTransferSize?: (v: string) => void;
  newTransferColor?: string;
  setNewTransferColor?: (v: string) => void;
  newTransferQty?: number;
  setNewTransferQty?: (v: number) => void;
  newTransferFrom?: string;
  setNewTransferFrom?: (v: string) => void;
  newTransferTo?: string;
  setNewTransferTo?: (v: string) => void;

  damagedGoods: any[];
  setDamagedGoods: (v: any[]) => void;
  newDamageProductId?: string;
  setNewDamageProductId?: (v: string) => void;
  newDamageSize?: string;
  setNewDamageSize?: (v: string) => void;
  newDamageColor?: string;
  setNewDamageColor?: (v: string) => void;
  newDamageQty?: number;
  setNewDamageQty?: (v: number) => void;
  newDamageIssue?: string;
  setNewDamageIssue?: (v: string) => void;

  // CRM & Tickets States & Setters
  crmClients: any[];
  setCrmClients: (v: any[]) => void;
  cskhTickets: any[];
  setCskhTickets: (v: any[]) => void;
  newTicketCustomerName?: string;
  setNewTicketCustomerName?: (v: string) => void;
  newTicketCategory?: 'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ';
  setNewTicketCategory?: (v: 'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ') => void;
  newTicketDesc?: string;
  setNewTicketDesc?: (v: string) => void;

  // Cash Reconciliation
  cashReconciliations: any[];
  setCashReconciliations: (v: any[]) => void;
  posReconciliationExpected?: number;
  setPosReconciliationExpected?: (v: number) => void;
  posReconciliationActual?: number;
  setPosReconciliationActual?: (v: number) => void;
  posReconciliationNotes?: string;
  setPosReconciliationNotes?: (v: string) => void;

  // AI states
  aiSEOProductAttributes?: any;
  setAiSEOProductAttributes?: (v: any) => void;
  aiGeneratedSEODesc?: string;
  setAiGeneratedSEODesc?: (v: string) => void;
  aiGeneratedCaption?: string;
  setAiGeneratedCaption?: (v: string) => void;
  aiSelectedChannel?: 'facebook' | 'tiktok' | 'instagram';
  setAiSelectedChannel?: (v: 'facebook' | 'tiktok' | 'instagram') => void;
  aiSelectedTone?: 'trendy' | 'elegant' | 'minimalist';
  setAiSelectedTone?: (v: 'trendy' | 'elegant' | 'minimalist') => void;
  aiCannedReplyOutput?: string;
  setAiCannedReplyOutput?: (v: string) => void;
  aiGenerating?: boolean;
  setAiGenerating?: (v: boolean) => void;

  updateGlobalProductDetails?: (
    productId: string,
    name: string,
    description: string,
    category: string,
    price: number,
    colors?: { name: string; hex: string }[],
    sizes?: string[],
    images?: string[],
    isActive?: boolean
  ) => void;
  addGlobalProduct?: (
    name: string,
    category: string,
    price: number,
    description: string,
    images: string[],
    colors: { name: string; hex: string }[],
    sizes: string[],
    initialStock?: number
  ) => void;
  deleteGlobalProduct?: (productId: string) => void;
}

export const ERPSubsystems: React.FC<ERPSubsystemsProps> = (props) => {
  const { activeTab } = props;

  switch (activeTab) {
    case 'pos-sales':
      return (
        <MultiCartPOS
          currentUser={props.currentUser}
          productsList={props.productsList}
          branchStock={props.branchStock}
          crmClients={props.crmClients}
          setCrmClients={props.setCrmClients}
          showToast={props.showToast}
          onSwitchToTransferTab={props.onSwitchToTransferTab}
          restockBranchProduct={props.restockBranchProduct}
          posHistory={props.posHistory}
          setPosHistory={props.setPosHistory}
        />
      );

    case 'stocker-inventory':
      return (
        <VariantStockMatrix
          currentUser={props.currentUser}
          productsList={props.productsList}
          branchStock={props.branchStock}
          restockBranchProduct={props.restockBranchProduct}
          refreshInventoryStocks={props.refreshInventoryStocks}
          onSwitchToTransferTab={props.onSwitchToTransferTab}
          transfers={props.transfers}
          setTransfers={props.setTransfers}
          showToast={props.showToast}
        />
      );

    case 'stocker-transfer':
      return (
        <StockerTransferSubsystem
          currentUser={props.currentUser}
          productsList={props.productsList}
          branchStock={props.branchStock}
          restockBranchProduct={props.restockBranchProduct}
          transfers={props.transfers}
          setTransfers={props.setTransfers}
          showToast={props.showToast}
        />
      );

    case 'damaged-goods':
      return (
        <DamagedGoodsSubsystem
          currentUser={props.currentUser}
          productsList={props.productsList}
          damagedGoods={props.damagedGoods}
          setDamagedGoods={props.setDamagedGoods}
          showToast={props.showToast}
        />
      );

    case 'accountant-kpi-payroll':
    case 'finance-payroll':
      return (
        <AccountantPayrollSubsystem
          usersList={props.usersList}
          posHistory={props.posHistory}
          shiftRequests={props.shiftRequests}
          attendanceLogs={props.attendanceLogs}
          showToast={props.showToast}
        />
      );

    case 'cskh-customers':
    case 'cskh-customers-vip':
    case 'customers-list':
    case 'cskh-hub':
    case 'customers':
    case 'returns-exchange':
      return (
        <CSKHCRMSubsystem
          activeTab={activeTab}
          crmClients={props.crmClients}
          cskhTickets={props.cskhTickets}
          setCskhTickets={props.setCskhTickets}
          allOrders={props.allOrders}
          showToast={props.showToast}
        />
      );

    case 'accountant-finance-recon':
    case 'finance-recon':
    case 'recon':
      return (
        <FinanceReconSubsystem
          currentUser={props.currentUser}
          allOrders={props.allOrders}
          posHistory={props.posHistory}
          expensesList={props.expensesList}
          restockRecords={props.restockRecords}
          payrollRecords={props.payrollRecords}
          usersList={props.usersList}
          cashReconciliations={props.cashReconciliations}
          setCashReconciliations={props.setCashReconciliations}
          showToast={props.showToast}
        />
      );

    case 'ai-copilot':
      return <AICopilotSubsystem showToast={props.showToast} />;

    case 'omnichannel':
      return <OmnichannelSubsystem />;

    case 'products-database':
      return (
        <ProductsDatabaseSubsystem
          currentUser={props.currentUser}
          productsList={props.productsList}
          updateGlobalProductDetails={props.updateGlobalProductDetails}
          addGlobalProduct={props.addGlobalProduct}
          deleteGlobalProduct={props.deleteGlobalProduct}
          showToast={props.showToast}
        />
      );

    case 'coupons-management':
      return (
        <CouponsManagementSubsystem
          currentUser={props.currentUser}
          showToast={props.showToast}
        />
      );

    case 'settings-tab':
    case 'settings':
      return <SettingsSubsystem />;

    default:
      return null;
  }
};
