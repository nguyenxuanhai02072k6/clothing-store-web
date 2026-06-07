import { Product } from '../../types';
import {
  getProductsAction,
  getProductDetailsAction,
  addGlobalProductAction,
  updateGlobalProductPriceAction,
  updateGlobalProductDetailsAction,
  deleteGlobalProductAction
} from '../actions/productActions';

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return await getProductsAction();
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    return await getProductDetailsAction(slug);
  },

  addGlobalProduct: async (
    name: string,
    category: string,
    price: number,
    description: string,
    images: string[],
    colors: { name: string; hex: string }[],
    sizes: string[],
    initialStock: number = 20
  ): Promise<Product> => {
    return await addGlobalProductAction(name, category, price, description, images, colors, sizes, initialStock);
  },

  updateGlobalProductPrice: async (productId: string, newPrice: number): Promise<boolean> => {
    return await updateGlobalProductPriceAction(productId, newPrice);
  },

  updateGlobalProductDetails: async (
    productId: string,
    name: string,
    description: string,
    category: string,
    price: number,
    colors?: { name: string; hex: string }[],
    sizes?: string[],
    images?: string[],
    isActive?: boolean
  ): Promise<boolean> => {
    return await updateGlobalProductDetailsAction(productId, name, description, category, price, colors, sizes, images, isActive);
  },

  deleteGlobalProduct: async (productId: string): Promise<boolean> => {
    return await deleteGlobalProductAction(productId);
  }
};
