'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '../../data/products';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';
import ProductGallery from './detail/ProductGallery';
import ProductDetailForm from './detail/ProductDetailForm';
import ProductAccordionSection from './detail/ProductAccordionSection';
import ProductRelatedSection from './detail/ProductRelatedSection';
import ProductStickyBuyBar from './detail/ProductStickyBuyBar';
import ProductFitFinderModal from './detail/ProductFitFinderModal';

interface ProductDetailClientProps {
  initialProduct: Product;
  initialRelatedProducts?: Product[];
}

export default function ProductDetailClient({
  initialProduct,
  initialRelatedProducts = [],
}: ProductDetailClientProps) {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { productsList, branchStock, branchSizeStock, branchColorStock } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  // Find product by slug or fallback to initialProduct
  const product = useMemo(() => {
    return activeProducts.find((p) => p.slug === (slug || initialProduct.slug)) || initialProduct;
  }, [slug, activeProducts, initialProduct]);

  const isLoved = product ? isInWishlist(product.id) : false;
  const { showToast } = useToast();

  // Fit Finder states
  const [showFitFinder, setShowFitFinder] = useState(false);
  const [userHeight, setUserHeight] = useState('');
  const [userWeight, setUserWeight] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  // Recently Viewed states
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Reviews states
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [showWriteReview, setShowWriteReview] = useState(false);

  // Product interaction states
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || { name: '', hex: '' });
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || 'F');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('desc');
  const [view3D, setView3D] = useState(false);
  const [modelSize, setModelSize] = useState<'S' | 'XL'>('S');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Sync initial color and size when product loads
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || { name: '', hex: '' });
      setSelectedSize(product.sizes[0] || 'F');
      setQuantity(1);
      setActiveImageIdx(0);
      setView3D(false);
      setModelSize('S');
    }
  }, [product]);

  // Track window scroll to toggle Sticky Add-to-Cart Bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 550) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Lock when AI Fit Finder modal is open
  useEffect(() => {
    if (showFitFinder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFitFinder]);

  // Track and Save Recently Viewed Items
  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('novyn_recently_viewed');
      let ids: string[] = [];
      if (stored) {
        ids = JSON.parse(stored);
      }
      ids = ids.filter((id) => id !== product.id);
      ids.unshift(product.id);
      ids = ids.slice(0, 8);
      localStorage.setItem('novyn_recently_viewed', JSON.stringify(ids));

      const items = ids
        .map((id) => activeProducts.find((p) => p.id === id))
        .filter((p): p is Product => !!p && p.id !== product.id);
      setRecentlyViewed(items);
    } catch (e) {
      console.error(e);
    }
  }, [product, activeProducts]);

  // Load reviews from localStorage or defaults
  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem(`novyn_reviews_${product.id}`);
      if (stored) {
        setReviewsData(JSON.parse(stored));
      } else {
        const colorName = product.colors[0]?.name || 'Đen';
        const sizeName = product.sizes[0] || 'M';
        const defaultReviews = [
          {
            name: 'Hoàng Minh Trí',
            avatarColor: 'bg-neutral-105 text-neutral-550 border border-neutral-200',
            rating: 5,
            date: '2 ngày trước',
            variant: `Màu: ${colorName} | Size: ${sizeName}`,
            comment: 'Đường may vô cùng sắc sảo và chỉn chu, chất vải rủ nhẹ vừa phải đúng chất Quiet Luxury. Form mặc lên chuẩn như đo ni đóng giày, cực kỳ tôn dáng và sang trọng. Sẽ ủng hộ shop thêm nhiều sản phẩm khác!',
            verified: true,
            helpfulCount: 8,
          },
          {
            name: 'Lê Khánh An',
            avatarColor: 'bg-neutral-105 text-neutral-550 border border-neutral-200',
            rating: 5,
            date: '1 tuần trước',
            variant: `Màu: ${colorName} | Size: ${sizeName}`,
            comment: 'Đóng gói sản phẩm siêu đẹp bằng hộp giấy kraft bảo vệ môi trường, có cả thiệp cảm ơn viết tay rất tinh tế. Chất vải mát mẻ, sờ mướt tay, mặc đi làm hay đi cà phê cuối tuần đều lịch sự và thoải mái.',
            verified: true,
            helpfulCount: 5,
          },
          {
            name: 'Nguyễn Bích Ngọc',
            avatarColor: 'bg-neutral-105 text-neutral-550 border border-neutral-200',
            rating: 4,
            date: '2 tuần trước',
            variant: `Màu: ${colorName} | Size: ${sizeName}`,
            comment: 'Chất lượng vải xuất sắc vượt mong đợi, form dáng rộng rãi hiện đại. Điểm cộng lớn cho nhân viên CSKH hỗ trợ tư vấn size cực kỳ nhiệt tình và có tâm. Giao hàng Hà Nội chỉ mất 1 ngày rưỡi.',
            verified: true,
            helpfulCount: 3,
          }
        ];
        setReviewsData(defaultReviews);
      }
    } catch (e) {
      console.error(e);
    }
  }, [product]);

  // Dynamic calculations for reviews
  const dynamicRating = useMemo(() => {
    if (!product) return 0;
    if (reviewsData.length === 0) return product.rating;
    const total = reviewsData.reduce((sum, r) => sum + r.rating, 0);
    return parseFloat((total / reviewsData.length).toFixed(1));
  }, [reviewsData, product]);

  const dynamicReviewsCount = useMemo(() => {
    return reviewsData.length;
  }, [reviewsData]);

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.floor(r.rating))) as 5 | 4 | 3 | 2 | 1;
      counts[star]++;
    });
    const total = reviewsData.length || 1;
    return [
      { stars: 5, pct: Math.round((counts[5] / total) * 100), count: counts[5] },
      { stars: 4, pct: Math.round((counts[4] / total) * 100), count: counts[4] },
      { stars: 3, pct: Math.round((counts[3] / total) * 100), count: counts[3] },
      { stars: 2, pct: Math.round((counts[2] / total) * 100), count: counts[2] },
      { stars: 1, pct: Math.round((counts[1] / total) * 100), count: counts[1] },
    ];
  }, [reviewsData]);

  // AI Fit Finder calculation
  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const height = parseFloat(userHeight);
    const weight = parseFloat(userWeight);
    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
      showToast('Vui lòng nhập chiều cao và cân nặng hợp lệ.', 'error');
      return;
    }

    let size = 'M';
    if (weight < 50) {
      size = 'S';
    } else if (weight >= 50 && weight < 62) {
      size = height > 170 ? 'M' : 'S';
    } else if (weight >= 62 && weight < 73) {
      size = height > 175 ? 'L' : 'M';
    } else if (weight >= 73 && weight < 83) {
      size = height > 180 ? 'XL' : 'L';
    } else {
      size = 'XL';
    }

    if (product.sizes.includes(size)) {
      setRecommendedSize(size);
    } else {
      const available = product.sizes;
      if (available.length > 0) {
        if (size === 'S' && available.includes('M')) setRecommendedSize('M');
        else if (size === 'XL' && available.includes('L')) setRecommendedSize('L');
        else setRecommendedSize(available[0]);
      } else {
        setRecommendedSize(size);
      }
    }
  };

  const handleApplyRecommendedSize = () => {
    if (recommendedSize) {
      setSelectedSize(recommendedSize);
      setShowFitFinder(false);
      showToast(`Đã áp dụng kích cỡ gợi ý: Size ${recommendedSize}`, 'success');
    }
  };

  // Submit dynamic review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      showToast('Vui lòng điền đầy đủ tên và bình luận của bạn.', 'error');
      return;
    }
    const newRev = {
      name: newReviewName,
      avatarColor: 'bg-neutral-105 text-neutral-550 border border-neutral-200',
      rating: newReviewRating,
      date: 'Vừa xong',
      variant: `Màu: ${selectedColor.name} | Size: ${selectedSize}`,
      comment: newReviewComment,
      verified: true,
      helpfulCount: 0,
    };
    const updated = [newRev, ...reviewsData];
    setReviewsData(updated);
    try {
      localStorage.setItem(`novyn_reviews_${product.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setShowWriteReview(false);
    showToast('Cảm ơn bạn đã gửi nhận xét đánh giá!', 'success');
  };

  // Compute displayed images based on Model Size selection ("View on Model")
  const displayedImages = useMemo(() => {
    if (!product) return [];
    if (modelSize === 'XL') {
      return [
        product.images[1] || product.images[0],
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        product.images[0],
      ];
    }
    return product.images;
  }, [product, modelSize]);

  // Related products (4 products in same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return initialRelatedProducts;
    const filtered = activeProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    return filtered.length > 0 ? filtered : initialRelatedProducts;
  }, [product, activeProducts, initialRelatedProducts]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-neutral-400 mb-8">Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link
          href="/products"
          className="bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    router.push('/cart');
  };

  const toggleAccordion = (tab: string) => {
    setActiveAccordion((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Breadcrumbs */}
      <nav className="text-xs text-neutral-400 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-neutral-700 transition-colors">Sản phẩm</Link>
        <span>/</span>
        <span className="text-neutral-600 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
        {/* Left Column: Image Gallery */}
        <ProductGallery
          product={product}
          displayedImages={displayedImages}
          activeImageIdx={activeImageIdx}
          setActiveImageIdx={setActiveImageIdx}
          view3D={view3D}
          setView3D={setView3D}
          modelSize={modelSize}
          setModelSize={setModelSize}
          selectedColorHex={selectedColor.hex}
        />

        {/* Right Column: Product Detail Form */}
        <ProductDetailForm
          product={product}
          dynamicRating={dynamicRating}
          dynamicReviewsCount={dynamicReviewsCount}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          quantity={quantity}
          handleDecreaseQty={handleDecreaseQty}
          handleIncreaseQty={handleIncreaseQty}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          toggleWishlist={toggleWishlist}
          isLoved={isLoved}
          setShowFitFinder={setShowFitFinder}
          setRecommendedSize={setRecommendedSize}
          branchStock={branchStock}
          branchSizeStock={branchSizeStock}
          branchColorStock={branchColorStock}
        />
      </div>

      {/* Accordion detail tab section */}
      <ProductAccordionSection
        product={product}
        activeAccordion={activeAccordion}
        toggleAccordion={toggleAccordion}
        dynamicRating={dynamicRating}
        dynamicReviewsCount={dynamicReviewsCount}
        ratingDistribution={ratingDistribution}
        reviewsData={reviewsData}
        showWriteReview={showWriteReview}
        setShowWriteReview={setShowWriteReview}
        handleSubmitReview={handleSubmitReview}
        newReviewName={newReviewName}
        setNewReviewName={setNewReviewName}
        newReviewRating={newReviewRating}
        setNewReviewRating={setNewReviewRating}
        newReviewComment={newReviewComment}
        setNewReviewComment={setNewReviewComment}
      />

      {/* Related Products & Recently Viewed */}
      <ProductRelatedSection
        relatedProducts={relatedProducts}
        recentlyViewed={recentlyViewed}
      />

      {/* Sticky Mobile Add-to-Cart Bar */}
      <ProductStickyBuyBar
        showStickyBar={showStickyBar}
        product={product}
        displayedImages={displayedImages}
        activeImageIdx={activeImageIdx}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        handleAddToCart={handleAddToCart}
      />

      {/* AI FIT FINDER SIZE SUGGESTION MODAL */}
      <ProductFitFinderModal
        showFitFinder={showFitFinder}
        setShowFitFinder={setShowFitFinder}
        handleCalculateSize={handleCalculateSize}
        userHeight={userHeight}
        setUserHeight={setUserHeight}
        userWeight={userWeight}
        setUserWeight={setUserWeight}
        recommendedSize={recommendedSize}
        setRecommendedSize={setRecommendedSize}
        handleApplyRecommendedSize={handleApplyRecommendedSize}
      />
    </div>
  );
}
