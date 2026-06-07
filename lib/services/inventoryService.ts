import { RestockRecord } from '../../types';
import {
  getBranchStockAction,
  getBranchSizeStockAction,
  getBranchColorStockAction,
  getRestockRecordsAction,
  restockBranchProductAction,
  approveRestockRequestAction,
  rejectRestockRequestAction
} from '../actions/inventoryActions';

export const inventoryService = {
  getBranchStock: async (): Promise<Record<string, Record<string, number>>> => {
    return await getBranchStockAction();
  },

  getBranchSizeStock: async (): Promise<Record<string, Record<string, Record<string, number>>>> => {
    return await getBranchSizeStockAction();
  },

  getBranchColorStock: async (): Promise<Record<string, Record<string, Record<string, number>>>> => {
    return await getBranchColorStockAction();
  },

  getRestockRecords: async (): Promise<RestockRecord[]> => {
    return await getRestockRecordsAction();
  },

  restockBranchProduct: async (
    productId: string,
    amount: number,
    size: string,
    color?: string,
    targetBranch?: string
  ): Promise<RestockRecord | null> => {
    return await restockBranchProductAction(productId, amount, size, color, targetBranch);
  },

  approveRestockRequest: async (requestId: string, approvedById?: string): Promise<void> => {
    await approveRestockRequestAction(requestId, approvedById);
  },

  rejectRestockRequest: async (requestId: string, rejectedById?: string): Promise<void> => {
    await rejectRestockRequestAction(requestId, rejectedById);
  }
};
