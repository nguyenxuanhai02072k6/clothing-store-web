import { useState, useEffect } from 'react';
import {
  getCRMClientsAction,
  getCSKHTicketsAction,
  getInventoryTransfersAction,
  getDamagedGoodsAction,
  getCashReconciliationsAction,
} from '@/backend/actions/erpActions';

export function useInternalSubsystemsState() {
  // POS States
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posBarcodeScan, setPosBarcodeScan] = useState('');
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posSelectedCustomer, setPosSelectedCustomer] = useState<any | null>(null);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'cash' | 'transfer' | 'wallet'>('cash');
  const [posPromoCode, setPosPromoCode] = useState('');
  const [posPromoDiscount, setPosPromoDiscount] = useState(0);
  const [posPrintedReceipt, setPosPrintedReceipt] = useState<any | null>(null);
  const [posReceiptMail, setPosReceiptMail] = useState('');
  const [posHistory, setPosHistory] = useState<any[]>([]);

  // Transfer States
  const [transfers, setTransfers] = useState<any[]>([]);
  const [newTransferProductId, setNewTransferProductId] = useState('');
  const [newTransferSize, setNewTransferSize] = useState('S');
  const [newTransferColor, setNewTransferColor] = useState('');
  const [newTransferQty, setNewTransferQty] = useState(5);
  const [newTransferFrom, setNewTransferFrom] = useState('Chi nhánh Quận 1');
  const [newTransferTo, setNewTransferTo] = useState('Chi nhánh Thảo Điền');

  // Damaged Goods States
  const [damagedGoods, setDamagedGoods] = useState<any[]>([]);
  const [newDamageProductId, setNewDamageProductId] = useState('');
  const [newDamageSize, setNewDamageSize] = useState('S');
  const [newDamageColor, setNewDamageColor] = useState('');
  const [newDamageQty, setNewDamageQty] = useState(1);
  const [newDamageIssue, setNewDamageIssue] = useState('Rách vải');

  // CRM & CSKH Ticket States
  const [crmClients, setCrmClients] = useState<any[]>([]);
  const [cskhTickets, setCskhTickets] = useState<any[]>([]);
  const [newTicketCustomerName, setNewTicketCustomerName] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ'>('Đổi size');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  // Cash Reconciliation States
  const [cashReconciliations, setCashReconciliations] = useState<any[]>([]);
  const [posReconciliationExpected, setPosReconciliationExpected] = useState(3850000);
  const [posReconciliationActual, setPosReconciliationActual] = useState(3850000);
  const [posReconciliationNotes, setPosReconciliationNotes] = useState('');

  // AI Assist & Marketing States
  const [aiSEOProductAttributes, setAiSEOProductAttributes] = useState({
    material: 'Linen Cao Cấp',
    fit: 'Relaxed Fit',
    color: 'Oatmeal',
    season: 'Summer 2026',
  });
  const [aiGeneratedSEODesc, setAiGeneratedSEODesc] = useState('');
  const [aiGeneratedCaption, setAiGeneratedCaption] = useState('');
  const [aiSelectedChannel, setAiSelectedChannel] = useState<'facebook' | 'tiktok' | 'instagram'>('facebook');
  const [aiSelectedTone, setAiSelectedTone] = useState<'trendy' | 'elegant' | 'minimalist'>('elegant');
  const [aiCannedReplyOutput, setAiCannedReplyOutput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Sync / Load Effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCrm = localStorage.getItem('novyn_crm_clients');
      if (storedCrm) setCrmClients(JSON.parse(storedCrm));

      const storedTickets = localStorage.getItem('novyn_cskh_tickets');
      if (storedTickets) setCskhTickets(JSON.parse(storedTickets));

      const storedTransfers = localStorage.getItem('novyn_stock_transfers');
      if (storedTransfers) setTransfers(JSON.parse(storedTransfers));

      const storedDamages = localStorage.getItem('novyn_damaged_goods');
      if (storedDamages) setDamagedGoods(JSON.parse(storedDamages));

      const storedRecon = localStorage.getItem('novyn_cash_reconciliation');
      if (storedRecon) setCashReconciliations(JSON.parse(storedRecon));

      const storedPosHist = localStorage.getItem('novyn_pos_history');
      if (storedPosHist) setPosHistory(JSON.parse(storedPosHist));

      (async () => {
        try {
          const [crmRes, ticketsRes, transfersRes, damagesRes, reconsRes] = await Promise.all([
            getCRMClientsAction(),
            getCSKHTicketsAction(),
            getInventoryTransfersAction(),
            getDamagedGoodsAction(),
            getCashReconciliationsAction(),
          ]);

          if (crmRes.success && crmRes.data && crmRes.data.length > 0) {
            setCrmClients(crmRes.data);
            localStorage.setItem('novyn_crm_clients', JSON.stringify(crmRes.data));
          }
          if (ticketsRes.success && ticketsRes.data && ticketsRes.data.length > 0) {
            setCskhTickets(ticketsRes.data);
            localStorage.setItem('novyn_cskh_tickets', JSON.stringify(ticketsRes.data));
          }
          if (transfersRes.success && transfersRes.data && transfersRes.data.length > 0) {
            setTransfers(transfersRes.data);
            localStorage.setItem('novyn_stock_transfers', JSON.stringify(transfersRes.data));
          }
          if (damagesRes.success && damagesRes.data && damagesRes.data.length > 0) {
            setDamagedGoods(damagesRes.data);
            localStorage.setItem('novyn_damaged_goods', JSON.stringify(damagesRes.data));
          }
          if (reconsRes.success && reconsRes.data && reconsRes.data.length > 0) {
            setCashReconciliations(reconsRes.data);
            localStorage.setItem('novyn_cash_reconciliation', JSON.stringify(reconsRes.data));
          }
        } catch (error) {
          console.error('Failed to sync ERP records from DB:', error);
        }
      })();
    }
  }, []);

  return {
    // POS
    posSearchQuery,
    setPosSearchQuery,
    posBarcodeScan,
    setPosBarcodeScan,
    posCart,
    setPosCart,
    posCustomerPhone,
    setPosCustomerPhone,
    posSelectedCustomer,
    setPosSelectedCustomer,
    posPaymentMethod,
    setPosPaymentMethod,
    posPromoCode,
    setPosPromoCode,
    posPromoDiscount,
    setPosPromoDiscount,
    posPrintedReceipt,
    setPosPrintedReceipt,
    posReceiptMail,
    setPosReceiptMail,
    posHistory,
    setPosHistory,
    // Transfers
    transfers,
    setTransfers,
    newTransferProductId,
    setNewTransferProductId,
    newTransferSize,
    setNewTransferSize,
    newTransferColor,
    setNewTransferColor,
    newTransferQty,
    setNewTransferQty,
    newTransferFrom,
    setNewTransferFrom,
    newTransferTo,
    setNewTransferTo,
    // Damaged Goods
    damagedGoods,
    setDamagedGoods,
    newDamageProductId,
    setNewDamageProductId,
    newDamageSize,
    setNewDamageSize,
    newDamageColor,
    setNewDamageColor,
    newDamageQty,
    setNewDamageQty,
    newDamageIssue,
    setNewDamageIssue,
    // CRM & Tickets
    crmClients,
    setCrmClients,
    cskhTickets,
    setCskhTickets,
    newTicketCustomerName,
    setNewTicketCustomerName,
    newTicketCategory,
    setNewTicketCategory,
    newTicketDesc,
    setNewTicketDesc,
    // Cash Reconciliation
    cashReconciliations,
    setCashReconciliations,
    posReconciliationExpected,
    setPosReconciliationExpected,
    posReconciliationActual,
    setPosReconciliationActual,
    posReconciliationNotes,
    setPosReconciliationNotes,
    // AI Marketing
    aiSEOProductAttributes,
    setAiSEOProductAttributes,
    aiGeneratedSEODesc,
    setAiGeneratedSEODesc,
    aiGeneratedCaption,
    setAiGeneratedCaption,
    aiSelectedChannel,
    setAiSelectedChannel,
    aiSelectedTone,
    setAiSelectedTone,
    aiCannedReplyOutput,
    setAiCannedReplyOutput,
    aiGenerating,
    setAiGenerating,
  };
}
