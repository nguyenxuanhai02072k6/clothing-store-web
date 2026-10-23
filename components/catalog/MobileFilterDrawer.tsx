import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProductFilterSidebar } from './ProductFilterSidebar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  setCategory: (cat: string) => void;
  priceRange: number;
  setPriceRange: (price: number) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedForm: string;
  setSelectedForm: (form: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (mat: string) => void;
  selectedStockStatus: string;
  setSelectedStockStatus: (status: string) => void;
  onlySale: boolean;
  setOnlySale: (sale: boolean) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  selectedForm,
  setSelectedForm,
  selectedMaterial,
  setSelectedMaterial,
  selectedStockStatus,
  setSelectedStockStatus,
  onlySale,
  setOnlySale,
  onResetFilters,
  totalFilteredCount,
}: MobileFilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-xs cursor-pointer"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xs bg-white h-full z-10 p-6 overflow-y-auto flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-brand-border mb-6">
                <h3 className="text-sm font-bold text-brand-text uppercase">Bộ lọc</h3>
                <button onClick={onClose} className="p-1 text-brand-muted hover:text-brand-text cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilterSidebar
                category={category}
                setCategory={setCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedForm={selectedForm}
                setSelectedForm={setSelectedForm}
                selectedMaterial={selectedMaterial}
                setSelectedMaterial={setSelectedMaterial}
                selectedStockStatus={selectedStockStatus}
                setSelectedStockStatus={setSelectedStockStatus}
                onlySale={onlySale}
                setOnlySale={setOnlySale}
                onResetFilters={onResetFilters}
              />
            </div>

            <div className="pt-6 border-t border-brand-border mt-8">
              <button
                onClick={onClose}
                className="w-full bg-brand-accent text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Xem kết quả ({totalFilteredCount})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
