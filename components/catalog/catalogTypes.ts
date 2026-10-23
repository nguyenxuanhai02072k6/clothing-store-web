export interface CatalogFilters {
  search: string;
  category: string;
  sort: string;
  priceRange: number;
  onlySale: boolean;
  selectedSize: string;
  selectedColor: string;
  selectedForm: string;
  selectedMaterial: string;
  selectedStockStatus: string;
}

export const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'];
export const SIZES = ['All', 'S', 'M', 'L', 'XL'];
export const COLORS = ['All', 'Trắng', 'Đen', 'Beige', 'Nâu', 'Xám', 'Xanh'];
export const FORMS = [
  { value: 'All', label: 'Tất cả phom dáng' },
  { value: 'Slim', label: 'Slim Fit' },
  { value: 'Regular', label: 'Regular Fit' },
  { value: 'Oversized', label: 'Oversized / Relaxed' },
];
export const MATERIALS = [
  { value: 'All', label: 'Tất cả chất liệu' },
  { value: 'Cotton', label: 'Cotton Supima' },
  { value: 'Linen', label: 'Linen Organic' },
  { value: 'Denim', label: 'Denim / Jean' },
  { value: 'Knit', label: 'Len / Dệt Kim (Knit)' },
];
export const STOCK_STATUSES = [
  { value: 'All', label: 'Tất cả tình trạng' },
  { value: 'in-stock', label: 'Còn hàng' },
  { value: 'low-stock', label: 'Sắp hết hàng' },
];
