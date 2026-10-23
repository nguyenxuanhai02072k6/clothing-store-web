/**
 * ==============================================================================
 * NOVYN WEAR - SMART SHIPPING ENGINE (HỆ THỐNG ĐỊNH TUYẾN & TÍNH CƯỚC THÔNG MINH)
 * ==============================================================================
 * 1. Định tuyến chi nhánh phục vụ gần nhất (Nearest Branch Routing)
 * 2. Phân vùng cước theo địa lý (Zone 1: Nội thành HCM, Zone 2: Miền Nam, Zone 3: Bắc/Trung)
 * 3. Hỗ trợ 3 gói cước linh hoạt (Hỏa Tốc 2H, Giao Nhanh, Tiết Kiệm)
 * 4. Trợ giá thanh toán không tiền mặt & Miễn phí vận chuyển VIP
 * ==============================================================================
 */

import { VIETNAM_PROVINCES, findProvinceByName, findDistrictByName } from '../../data/vietnamLocations';

export interface ShippingOption {
  id: 'instant_2h' | 'express_standard' | 'economy';
  name: string;
  badge?: string;
  desc: string;
  estimatedDelivery: string;
  originalFee: number;
  discount: number;
  finalFee: number;
  carrierName: string;
}

export interface CalculateShippingParams {
  provinceName: string;
  districtName: string;
  wardName?: string;
  subtotal: number;
  totalWeightGrams?: number;
  customerTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'standard';
  paymentMethod?: 'cod' | 'transfer' | 'vnpay' | 'card';
  appliedPromoCode?: string;
}

export interface SmartShippingResult {
  recommendedBranch: 'Chi nhánh Quận 1' | 'Chi nhánh Thảo Điền';
  zone: 'ZONE_1_HCM' | 'ZONE_2_SOUTH' | 'ZONE_3_CENTRAL_NORTH';
  isInnerCity: boolean;
  totalWeightGrams: number;
  options: ShippingOption[];
  selectedOption: ShippingOption;
}

export class SmartShippingEngine {
  /**
   * Tính toán cước và định tuyến thông minh dựa trên thông tin 4 cấp
   */
  public calculate(params: CalculateShippingParams): SmartShippingResult {
    const {
      provinceName,
      districtName,
      subtotal = 0,
      totalWeightGrams = 350, // Trọng lượng tiêu chuẩn trung bình 1 sản phẩm thời trang
      customerTier = 'bronze',
      paymentMethod = 'cod',
      appliedPromoCode
    } = params;

    // 1. Phân tích địa giới hành chính
    const province = findProvinceByName(provinceName) || VIETNAM_PROVINCES[0]; // Mặc định TP.HCM nếu chưa chọn
    const district = findDistrictByName(province, districtName);

    const zone = province.zone;
    const isInnerCity = district?.isInnerCity || false;

    // 2. Định tuyến chi nhánh xuất kho tối ưu
    let recommendedBranch: 'Chi nhánh Quận 1' | 'Chi nhánh Thảo Điền' = 'Chi nhánh Quận 1';
    if (district?.preferredBranch) {
      recommendedBranch = district.preferredBranch;
    } else if (province.id === 'binhduong' || province.id === 'dongnai') {
      recommendedBranch = 'Chi nhánh Thảo Điền'; // Gần cửa ngõ phía Đông HCM
    } else {
      recommendedBranch = 'Chi nhánh Quận 1';
    }

    // 3. Phụ phí trọng lượng (Mỗi 500g vượt mức 1kg cộng thêm 5.000đ)
    let weightSurcharge = 0;
    if (totalWeightGrams > 1000) {
      const extraHalfKgs = Math.ceil((totalWeightGrams - 1000) / 500);
      weightSurcharge = extraHalfKgs * 5000;
    }

    // 4. Kiểm tra điều kiện Freeship
    const isPromoFreeship = appliedPromoCode?.toUpperCase() === 'FREESHIP';
    const isVipFreeship = customerTier === 'gold' || customerTier === 'platinum' || customerTier === 'diamond';
    const isSubtotalFreeship = subtotal >= 500000;
    const eligibleForFreeStandard = isPromoFreeship || isVipFreeship || isSubtotalFreeship;

    // Trợ giá thanh toán không tiền mặt (VNPay / VietQR giảm thêm 10.000đ)
    const isCashless = paymentMethod === 'vnpay' || paymentMethod === 'transfer';
    const cashlessDiscount = isCashless ? 10000 : 0;

    const options: ShippingOption[] = [];

    // Gói 1: Hỏa Tốc 2 Giờ (Chỉ áp dụng cho Nội thành TP.HCM quanh Q1 hoặc Thảo Điền)
    if (zone === 'ZONE_1_HCM' && isInnerCity) {
      const baseInstantFee = 50000 + weightSurcharge;
      let instantDiscount = 0;
      if (customerTier === 'diamond') instantDiscount += 25000; // VIP Diamond trợ giá 50%
      else if (customerTier === 'platinum') instantDiscount += 15000;
      if (cashlessDiscount > 0) instantDiscount += cashlessDiscount;
      instantDiscount = Math.min(baseInstantFee - 15000, instantDiscount); // Tối thiểu cước hỏa tốc 15k

      options.push({
        id: 'instant_2h',
        name: 'Hỏa Tốc 2 Giờ',
        badge: '⚡ Siêu tốc',
        desc: `Giao trực tiếp từ ${recommendedBranch} bằng xe máy`,
        estimatedDelivery: 'Nhận trong 2 giờ hôm nay',
        carrierName: 'Ahamove / GrabExpress',
        originalFee: baseInstantFee,
        discount: instantDiscount,
        finalFee: Math.max(15000, baseInstantFee - instantDiscount)
      });
    }

    // Gói 2: Giao Hàng Nhanh Tiêu Chuẩn (Express Standard 1 - 3 ngày)
    let baseStandardFee = 22000;
    let standardEta = 'Nhận ngày mai (1-2 ngày)';
    if (zone === 'ZONE_2_SOUTH') {
      baseStandardFee = 30000;
      standardEta = 'Nhận sau 1-2 ngày';
    } else if (zone === 'ZONE_3_CENTRAL_NORTH') {
      baseStandardFee = 38000;
      standardEta = 'Nhận sau 2-3 ngày đường bay';
    }
    baseStandardFee += weightSurcharge;

    let standardDiscount = 0;
    if (eligibleForFreeStandard) {
      standardDiscount = baseStandardFee; // Freeship 100%
    } else if (cashlessDiscount > 0) {
      standardDiscount = Math.min(baseStandardFee, cashlessDiscount);
    }

    options.push({
      id: 'express_standard',
      name: 'Giao Nhanh Tiêu Chuẩn',
      badge: eligibleForFreeStandard ? 'Miễn phí' : 'Phổ biến',
      desc: `Điều phối bưu cục từ ${recommendedBranch}`,
      estimatedDelivery: standardEta,
      carrierName: 'Giao Hàng Nhanh (GHN) / GHTK',
      originalFee: baseStandardFee,
      discount: standardDiscount,
      finalFee: Math.max(0, baseStandardFee - standardDiscount)
    });

    // Gói 3: Giao Tiết Kiệm (Economy 3 - 5 ngày)
    let baseEconomyFee = 16000;
    let economyEta = 'Nhận sau 2-3 ngày';
    if (zone === 'ZONE_2_SOUTH') {
      baseEconomyFee = 22000;
      economyEta = 'Nhận sau 3-4 ngày';
    } else if (zone === 'ZONE_3_CENTRAL_NORTH') {
      baseEconomyFee = 28000;
      economyEta = 'Nhận sau 4-5 ngày đường bộ';
    }
    baseEconomyFee += weightSurcharge;

    let economyDiscount = 0;
    if (eligibleForFreeStandard || subtotal >= 400000) {
      economyDiscount = baseEconomyFee;
    } else if (cashlessDiscount > 0) {
      economyDiscount = Math.min(baseEconomyFee, cashlessDiscount);
    }

    options.push({
      id: 'economy',
      name: 'Giao Tiết Kiệm',
      badge: economyDiscount === baseEconomyFee ? 'Miễn phí' : 'Tiết kiệm',
      desc: 'Tối ưu chi phí, vận chuyển đường bộ',
      estimatedDelivery: economyEta,
      carrierName: 'Viettel Post',
      originalFee: baseEconomyFee,
      discount: economyDiscount,
      finalFee: Math.max(0, baseEconomyFee - economyDiscount)
    });

    // Mặc định chọn Giao Nhanh Tiêu Chuẩn
    const selectedOption = options.find(o => o.id === 'express_standard') || options[0];

    return {
      recommendedBranch,
      zone,
      isInnerCity,
      totalWeightGrams,
      options,
      selectedOption
    };
  }
}

export const smartShippingEngine = new SmartShippingEngine();
