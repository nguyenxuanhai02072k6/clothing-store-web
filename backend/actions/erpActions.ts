/**
 * ERP Server Actions (Aggregator & Re-export)
 * 
 * Domain-driven modular decomposition:
 * - erpRoles: Role access control arrays (STAFF_ROLES, FINANCIAL_ROLES, AUDIT_ROLES)
 * - crmTicketActions: Customer CRM & CSKH Support Tickets
 * - inventoryTransferActions: Inter-branch inventory transfers & atomic tracking
 * - damagedGoodsActions: Damaged goods recording & inventory write-offs
 * - accountingActions: Cash drawer reconciliation & Corporate Tax settlement
 */

export * from './erp/erpRoles';
export * from './erp/crmTicketActions';
export * from './erp/inventoryTransferActions';
export * from './erp/damagedGoodsActions';
export * from './erp/accountingActions';
