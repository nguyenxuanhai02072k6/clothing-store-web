/**
 * ==============================================================================
 * NOVYN WEAR - DỮ LIỆU ĐỊA GIỚI HÀNH CHÍNH CHUẨN VIỆT NAM (VIETNAM LOCATIONS DATA)
 * ==============================================================================
 * Cấu trúc phân cấp 3 tầng: Tỉnh/Thành phố -> Quận/Huyện -> Phường/Xã
 * Kèm phân loại Zone để tính toán cước vận chuyển và tự động định tuyến kho gần nhất.
 * ==============================================================================
 */

export interface Ward {
  name: string;
}

export interface District {
  name: string;
  isInnerCity?: boolean; // Nội thành (hỗ trợ giao Hỏa Tốc 2H)
  preferredBranch?: 'Chi nhánh Quận 1' | 'Chi nhánh Thảo Điền';
  wards: string[];
}

export interface Province {
  id: string;
  name: string;
  region: 'south' | 'central' | 'north';
  zone: 'ZONE_1_HCM' | 'ZONE_2_SOUTH' | 'ZONE_3_CENTRAL_NORTH';
  districts: District[];
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    region: 'south',
    zone: 'ZONE_1_HCM',
    districts: [
      {
        name: 'Quận 1',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định']
      },
      {
        name: 'TP. Thủ Đức',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường Thảo Điền', 'Phường An Phú', 'Phường An Khánh', 'Phường Bình An', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Linh Trung', 'Phường Linh Chiểu', 'Phường Phước Long B', 'Phường Tăng Nhơn Phú A']
      },
      {
        name: 'Quận 3',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường Võ Thị Sáu', 'Phường 9', 'Phường 11', 'Phường 12', 'Phường 14']
      },
      {
        name: 'Quận Bình Thạnh',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28']
      },
      {
        name: 'Quận 4',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18']
      },
      {
        name: 'Quận 5',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14']
      },
      {
        name: 'Quận 7',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 'Phường Tân Kiểng', 'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Phú Thuận']
      },
      {
        name: 'Quận 10',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15']
      },
      {
        name: 'Quận Phú Nhuận',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17']
      },
      {
        name: 'Quận Tân Bình',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15']
      },
      {
        name: 'Quận Gò Vấp',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17']
      },
      {
        name: 'Quận 12',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường Thạnh Xuân', 'Phường Thạnh Lộc', 'Phường Hiệp Thành', 'Phường Thới An', 'Phường Tân Chánh Hiệp', 'Phường An Phú Đông', 'Phường Tân Thới Hiệp', 'Phường Trung Mỹ Tây', 'Phường Tân Hưng Thuận', 'Phường Đông Hưng Thuận', 'Phường Tân Thới Nhất']
      },
      {
        name: 'Quận Bình Tân',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Bình Hưng Hòa', 'Phường Bình Hưng Hòa A', 'Phường Bình Hưng Hòa B', 'Phường Bình Trị Đông', 'Phường Bình Trị Đông A', 'Phường Bình Trị Đông B', 'Phường Tân Tạo', 'Phường Tân Tạo A', 'Phường An Lạc', 'Phường An Lạc A']
      },
      {
        name: 'Huyện Bình Chánh',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng', 'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quy Đức', 'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B']
      },
      {
        name: 'Huyện Hóc Môn',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Đông Thạnh', 'Xã Nhị Bình', 'Xã Tân Hiệp', 'Xã Tân Thới Nhì', 'Xã Tân Xuân', 'Xã Thới Tam Thôn', 'Xã Trung Chánh', 'Xã Xuân Thới Đông', 'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng']
      },
      {
        name: 'Huyện Nhà Bè',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc']
      },
      {
        name: 'Huyện Củ Chi',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Thị trấn Củ Chi', 'Xã An Nhơn Tây', 'Xã An Phú', 'Xã Bình Mỹ', 'Xã Nhuận Đức', 'Xã Phạm Văn Cội', 'Xã Phú Hòa Đông', 'Xã Tân An Hội', 'Xã Tân Thông Hội', 'Xã Trung An']
      },
      {
        name: 'Huyện Cần Giờ',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Thị trấn Cần Thạnh', 'Xã An Thới Đông', 'Xã Bình Khánh', 'Xã Long Hòa', 'Xã Lý Nhơn', 'Xã Tam Thôn Hiệp', 'Xã Thạnh An']
      }
    ]
  },
  {
    id: 'hn',
    name: 'Hà Nội',
    region: 'north',
    zone: 'ZONE_3_CENTRAL_NORTH',
    districts: [
      {
        name: 'Quận Hoàn Kiếm',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Hàng Bạc', 'Phường Hàng Bồ', 'Phường Hàng Bông', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân', 'Phường Tràng Tiền', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh']
      },
      {
        name: 'Quận Ba Đình',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc']
      },
      {
        name: 'Quận Cầu Giấy',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa']
      },
      {
        name: 'Quận Đống Đa',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu']
      },
      {
        name: 'Quận Hai Bà Trưng',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Bạch Đằng', 'Phường Bách Khoa', 'Phường Bạch Mai', 'Phường Cầu Dền', 'Phường Đống Mác', 'Phường Đồng Nhân', 'Phường Đồng Tâm', 'Phường Lê Đại Hành', 'Phường Minh Khai', 'Phường Nguyễn Du', 'Phường Phạm Đình Hổ', 'Phường Phố Huế', 'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Thanh Lương', 'Phường Thanh Nhàn', 'Phường Trương Định', 'Phường Vĩnh Tuy']
      },
      {
        name: 'Quận Tây Hồ',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An', 'Phường Thụy Khuê', 'Phường Tứ Liên', 'Phường Xuân La', 'Phường Yên Phụ']
      },
      {
        name: 'Quận Thanh Xuân',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung', 'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình']
      },
      {
        name: 'Quận Nam Từ Liêm',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Cầu Diễn', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Mễ Trì', 'Phường Trung Văn', 'Phường Đại Mỗ', 'Phường Tây Mỗ', 'Phường Phương Canh', 'Phường Xuân Phương']
      },
      {
        name: 'Quận Bắc Từ Liêm',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đông Ngạc', 'Phường Đức Thắng', 'Phường Liên Mạc', 'Phường Minh Khai', 'Phường Phú Diễn', 'Phường Phúc Diễn', 'Phường Tây Tựu', 'Phường Thượng Cát', 'Phường Thụy Phương', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo']
      },
      {
        name: 'Quận Hà Đông',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Quang Trung', 'Phường Yết Kiêu', 'Phường Nguyễn Trãi', 'Phường Văn Quán', 'Phường Mộ Lao', 'Phường Hà Cầu', 'Phường Vạn Phúc', 'Phường La Khê', 'Phường Phú La', 'Phường Kiến Hưng', 'Phường Yên Nghĩa', 'Phường Phú Lương', 'Phường Phú Lãm', 'Phường Dương Nội', 'Phường Biên Giang', 'Phường Đồng Mai']
      }
    ]
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    region: 'central',
    zone: 'ZONE_3_CENTRAL_NORTH',
    districts: [
      {
        name: 'Quận Hải Châu',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Bình Thuận', 'Phường Bình Hiên', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam']
      },
      {
        name: 'Quận Thanh Khê',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Tam Thuận', 'Phường Thanh Khê Tây', 'Phường Thanh Khê Đông', 'Phường Xuân Hà', 'Phường Tân Chính', 'Phường Chính Gián', 'Phường Vĩnh Trung', 'Phường Thạc Gián', 'Phường An Khê', 'Phường Hòa Khê']
      },
      {
        name: 'Quận Sơn Trà',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang']
      },
      {
        name: 'Quận Ngũ Hành Sơn',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải']
      },
      {
        name: 'Quận Cẩm Lệ',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Khuê Trung', 'Phường Hòa Phát', 'Phường Hòa An', 'Phường Hòa Thọ Tây', 'Phường Hòa Thọ Đông', 'Phường Hòa Xuân']
      }
    ]
  },
  {
    id: 'binhduong',
    name: 'Bình Dương',
    region: 'south',
    zone: 'ZONE_2_SOUTH',
    districts: [
      {
        name: 'TP. Thủ Dầu Một',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa', 'Phường Phú Thọ', 'Phường Phú Hòa', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Định Hòa', 'Phường Hiệp An', 'Phường Tân An', 'Phường Tương Bình Hiệp', 'Phường Chánh Mỹ', 'Phường Hòa Phú', 'Phường Phú Tân']
      },
      {
        name: 'TP. Thuận An',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường Lái Thiêu', 'Phường An Phú', 'Phường Bình Hòa', 'Phường An Thạnh', 'Phường Thuận Giao', 'Phường Hưng Định', 'Phường Bình Nhâm', 'Phường Bình Chuẩn', 'Xã An Sơn']
      },
      {
        name: 'TP. Dĩ An',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường Dĩ An', 'Phường Tân Đông Hiệp', 'Phường Tân Bình', 'Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng', 'Phường Đông Hòa']
      }
    ]
  },
  {
    id: 'dongnai',
    name: 'Đồng Nai',
    region: 'south',
    zone: 'ZONE_2_SOUTH',
    districts: [
      {
        name: 'TP. Biên Hòa',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường An Bình', 'Phường Bình Đa', 'Phường Bửu Hòa', 'Phường Bửu Long', 'Phường Hòa Bình', 'Phường Hố Nai', 'Phường Long Bình', 'Phường Long Bình Tân', 'Phường Quang Vinh', 'Phường Quyết Thắng', 'Phường Tam Hiệp', 'Phường Tam Hòa', 'Phường Tân Biên', 'Phường Tân Hạnh', 'Phường Tân Hòa', 'Phường Tân Hiệp', 'Phường Tân Mai', 'Phường Tân Phong', 'Phường Tân Tiến', 'Phường Tân Vạn', 'Phường Thanh Bình', 'Phường Thống Nhất', 'Phường Trảng Dài', 'Phường Trung Dũng']
      },
      {
        name: 'TP. Long Khánh',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Thảo Điền',
        wards: ['Phường Xuân An', 'Phường Xuân Bình', 'Phường Xuân Hòa', 'Phường Xuân Lập', 'Phường Xuân Tân', 'Phường Xuân Thanh', 'Phường Xuân Trung', 'Phường Bàu Sen', 'Phường Phú Bình', 'Phường Suối Tre']
      }
    ]
  },
  {
    id: 'cantho',
    name: 'Cần Thơ',
    region: 'south',
    zone: 'ZONE_2_SOUTH',
    districts: [
      {
        name: 'Quận Ninh Kiều',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường An Bình', 'Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh']
      },
      {
        name: 'Quận Cái Răng',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Lê Bình', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Ba Láng', 'Phường Phú Thứ', 'Phường Tân Phú']
      }
    ]
  },
  {
    id: 'haiphong',
    name: 'Hải Phòng',
    region: 'north',
    zone: 'ZONE_3_CENTRAL_NORTH',
    districts: [
      {
        name: 'Quận Hồng Bàng',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Hạ Lý', 'Phường Hoàng Văn Thụ', 'Phường Hùng Vương', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Quán Toan', 'Phường Sở Dầu', 'Phường Thượng Lý', 'Phường Trại Chuối']
      },
      {
        name: 'Quận Ngô Quyền',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Cầu Đất', 'Phường Cầu Tre', 'Phường Đằng Giang', 'Phường Đông Khê', 'Phường Đổng Quốc Bình', 'Phường Gia Viên', 'Phường Lạc Viên', 'Phường Lạch Tray', 'Phường Lê Lợi', 'Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ']
      }
    ]
  },
  {
    id: 'khanhhoa',
    name: 'Khánh Hòa',
    region: 'central',
    zone: 'ZONE_3_CENTRAL_NORTH',
    districts: [
      {
        name: 'TP. Nha Trang',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường Lộc Thọ', 'Phường Phương Sài', 'Phường Phương Sơn', 'Phường Phước Hải', 'Phường Phước Hòa', 'Phường Phước Tiến', 'Phường Phước Tân', 'Phường Tân Lập', 'Phường Vạn Thắng', 'Phường Vạn Thạnh', 'Phường Vĩnh Hải', 'Phường Vĩnh Hòa', 'Phường Vĩnh Phước', 'Phường Vĩnh Thọ', 'Phường Xương Huân']
      }
    ]
  },
  {
    id: 'lamdong',
    name: 'Lâm Đồng',
    region: 'central',
    zone: 'ZONE_3_CENTRAL_NORTH',
    districts: [
      {
        name: 'TP. Đà Lạt',
        isInnerCity: true,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12']
      }
    ]
  },
  {
    id: 'other',
    name: 'Tỉnh/Thành khác',
    region: 'central',
    zone: 'ZONE_3_CENTRAL_NORTH',
    districts: [
      {
        name: 'Khu vực Trung tâm Tỉnh / Thành phố',
        isInnerCity: false,
        preferredBranch: 'Chi nhánh Quận 1',
        wards: ['Khu vực Phường 1', 'Khu vực Phường 2', 'Khu vực Trung tâm Thị xã', 'Khu vực Xã Ngoại thành']
      }
    ]
  }
];

/**
 * Tra cứu thông tin Tỉnh/Thành theo tên
 */
export function findProvinceByName(name: string): Province | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return VIETNAM_PROVINCES.find(p => 
    p.name.toLowerCase() === clean || 
    clean.includes(p.name.toLowerCase()) || 
    p.name.toLowerCase().includes(clean)
  );
}

/**
 * Tra cứu Quận/Huyện theo Tỉnh và tên Quận
 */
export function findDistrictByName(province: Province, districtName: string): District | undefined {
  if (!province || !districtName) return undefined;
  const clean = districtName.trim().toLowerCase().replace(/^thành phố\s+/i, 'tp. ').replace(/\s+/g, ' ');
  return province.districts.find(d => {
    const dName = d.name.toLowerCase().replace(/^thành phố\s+/i, 'tp. ').replace(/\s+/g, ' ');
    return (
      dName === clean || 
      clean.includes(dName) || 
      dName.includes(clean) ||
      (clean.includes('thủ đức') && dName.includes('thủ đức')) ||
      (clean.includes('quận 2') && dName.includes('thủ đức'))
    );
  });
}
