import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetailsAction, getProductsAction } from '@/backend/actions/productActions';
import { MOCK_PRODUCTS } from '../../../data/products';
import ProductDetailClient from '../../../components/product/ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductDetailsAction(slug)) || MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Sản phẩm không tồn tại | NOVYN WEAR',
      description: 'Mẫu thiết kế bạn tìm kiếm hiện không tồn tại hoặc đã ngừng kinh doanh.',
    };
  }

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200';
  const pageTitle = `${product.name} | NOVYN WEAR - Quiet Luxury`;
  const pageDescription = product.description.slice(0, 160);

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: `${product.name} - NOVYN WEAR`,
      description: pageDescription,
      url: `https://novynwear.com/products/${product.slug}`,
      siteName: 'NOVYN WEAR - Thời Trang Quiet Luxury',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - NOVYN WEAR`,
      description: pageDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://novynwear.com/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = (await getProductDetailsAction(slug)) || MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Fetch related products for recommendations
  const allProducts = (await getProductsAction()) || MOCK_PRODUCTS;
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // Schema.org Product Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'NOVYN WEAR',
    },
    offers: {
      '@type': 'Offer',
      url: `https://novynwear.com/products/${product.slug}`,
      priceCurrency: 'VND',
      price: product.price,
      availability: (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5,
      reviewCount: product.reviews || 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetailClient initialProduct={product} initialRelatedProducts={relatedProducts} />
    </>
  );
}
