export interface Hotspot {
  id: string;
  productId: string;
  top: string;  // absolute percentage e.g. "30%"
  left: string; // absolute percentage e.g. "45%"
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
}

export interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  hotspots: Hotspot[];
}
