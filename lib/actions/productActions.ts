"use server"

import { prisma } from '../db';

// Helper to map DB product to UI product structure
function mapProduct(dbProd: any) {
  const variants = dbProd.variants || [];
  
  // Extract unique colors
  const colorsMap = new Map<string, string>();
  variants.forEach((v: any) => {
    colorsMap.set(v.colorName, v.colorHex);
  });
  const colors = Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  
  // Extract unique sizes
  const sizesSet = new Set<string>();
  variants.forEach((v: any) => sizesSet.add(v.size));
  // Sort sizes in typical order S, M, L, XL
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '29', '30', '31', '32', '33'];
  const sizes = Array.from(sizesSet).sort((a, b) => {
    const idxA = sizeOrder.indexOf(a);
    const idxB = sizeOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  
  // Calculate total stock from all variants across branches
  let stock = 0;
  variants.forEach((v: any) => {
    const invItems = v.inventoryItems || [];
    invItems.forEach((i: any) => {
      stock += i.quantity;
    });
  });
  
  let images: string[] = [];
  try {
    images = JSON.parse(dbProd.images);
  } catch {
    images = [dbProd.images];
  }
  
  return {
    id: dbProd.id,
    name: dbProd.name,
    slug: dbProd.slug,
    category: dbProd.category,
    price: dbProd.price,
    oldPrice: dbProd.oldPrice || undefined,
    description: dbProd.description,
    images,
    rating: dbProd.rating,
    reviews: dbProd.reviews,
    colors,
    sizes,
    stock,
    badges: dbProd.badges ? dbProd.badges.split(',') : undefined,
    has3D: dbProd.has3D,
    modelType: dbProd.modelType || undefined,
    isActive: dbProd.isActive,
  };
}

export async function getProductsAction() {
  try {
    const dbProds = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: {
          include: {
            inventoryItems: true
          }
        }
      }
    });
    
    return dbProds.map((p: any) => mapProduct(p));
  } catch (error) {
    console.error('getProductsAction error:', error);
    return [];
  }
}

export async function getProductDetailsAction(slug: string) {
  try {
    const dbProd = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        variants: {
          include: {
            inventoryItems: true
          }
        }
      }
    });
    
    if (!dbProd) return null;
    return mapProduct(dbProd);
  } catch (error) {
    console.error('getProductDetailsAction error:', error);
    return null;
  }
}

export async function addGlobalProductAction(
  name: string,
  category: string,
  price: number,
  description: string,
  images: string[],
  colors: { name: string; hex: string }[],
  sizes: string[],
  initialStock: number = 20
) {
  try {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const productId = `prod-${Date.now()}`;
    
    // 1. Create product in DB
    const dbProd = await prisma.product.create({
      data: {
        id: productId,
        name,
        slug,
        category,
        price,
        description,
        images: JSON.stringify(images),
        rating: 5.0,
        reviews: 0,
      }
    });

    // 2. Generate variants and stock for each combination
    const colorsList = colors && colors.length > 0 ? colors : [{ name: 'Default', hex: '#CCCCCC' }];
    const sizesList = sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'];
    
    const qtyPerVariant = Math.max(1, Math.floor(initialStock / (colorsList.length * sizesList.length)));
    
    for (const color of colorsList) {
      for (const size of sizesList) {
        const cleanColorName = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSize = size.toLowerCase();
        const sku = `${slug}-${cleanColorName}-${cleanSize}`;
        
        const variant = await prisma.productVariant.create({
          data: {
            productId,
            sku,
            colorName: color.name,
            colorHex: color.hex,
            size,
          }
        });
        
        // Distribute stock between branches
        const q1Qty = Math.floor(qtyPerVariant / 2) + (qtyPerVariant % 2);
        const tdQty = Math.floor(qtyPerVariant / 2);
        
        await prisma.inventoryItem.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Quận 1',
            quantity: q1Qty
          }
        });
        
        await prisma.inventoryItem.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Thảo Điền',
            quantity: tdQty
          }
        });
        
        // Log transaction
        await prisma.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Quận 1',
            quantity: q1Qty,
            type: 'restock',
            reason: 'Tạo sản phẩm mới và nạp hàng Quận 1'
          }
        });
        
        await prisma.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Thảo Điền',
            quantity: tdQty,
            type: 'restock',
            reason: 'Tạo sản phẩm mới và nạp hàng Thảo Điền'
          }
        });
      }
    }

    // Log to Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_CREATE',
        details: `Đã tạo sản phẩm mới: ${name} (ID: ${productId})`,
      }
    });

    const fullProd = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            inventoryItems: true
          }
        }
      }
    });

    return mapProduct(fullProd);
  } catch (error) {
    console.error('addGlobalProductAction error:', error);
    throw error;
  }
}

export async function updateGlobalProductPriceAction(productId: string, newPrice: number) {
  try {
    const oldProd = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        price: newPrice,
        oldPrice: oldProd?.price
      }
    });

    // Log audit log
    await prisma.auditLog.create({
      data: {
        action: 'PRICE_CHANGE',
        details: `Đã thay đổi giá sản phẩm ID ${productId}: từ ${oldProd?.price}đ thành ${newPrice}đ`,
      }
    });
    
    return true;
  } catch (error) {
    console.error('updateGlobalProductPriceAction error:', error);
    return false;
  }
}

export async function updateGlobalProductDetailsAction(
  productId: string,
  name: string,
  description: string,
  category: string,
  price: number,
  colors?: { name: string; hex: string }[],
  sizes?: string[],
  images?: string[],
  isActive?: boolean
) {
  try {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const dataToUpdate: any = {
      name,
      slug,
      description,
      category,
      price,
    };
    
    if (images) {
      dataToUpdate.images = JSON.stringify(images);
    }
    
    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive;
    }
    
    await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate
    });

    // If colors or sizes are modified, we sync the variants
    if (colors || sizes) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true }
      });
      
      const currentVariants = (product?.variants || []) as any[];
      const colorsList = colors || Array.from(new Map(currentVariants.map((v: any) => [v.colorName, v.colorHex])).entries()).map(([name, hex]) => ({ name, hex }));
      const sizesList = sizes || Array.from(new Set(currentVariants.map((v: any) => v.size)));
      
      // We will check which variants are missing and add them
      for (const color of colorsList) {
        for (const size of sizesList) {
          const cleanColorName = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cleanSize = size.toLowerCase();
          const sku = `${slug}-${cleanColorName}-${cleanSize}`;
          
          const exists = currentVariants.some((v: any) => v.sku === sku);
          if (!exists) {
            const variant = await prisma.productVariant.create({
              data: {
                productId,
                sku,
                colorName: color.name,
                colorHex: color.hex,
                size,
              }
            });
            
            // Set 0 stock initially
            await prisma.inventoryItem.create({
              data: { variantId: variant.id, branchName: 'Chi nhánh Quận 1', quantity: 0 }
            });
            await prisma.inventoryItem.create({
              data: { variantId: variant.id, branchName: 'Chi nhánh Thảo Điền', quantity: 0 }
            });
          }
        }
      }
    }

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_UPDATE',
        details: `Đã cập nhật chi tiết sản phẩm: ${name} (ID: ${productId})`,
      }
    });

    return true;
  } catch (error) {
    console.error('updateGlobalProductDetailsAction error:', error);
    return false;
  }
}

export async function deleteGlobalProductAction(productId: string) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_DELETE',
        details: `Đã xóa (vô hiệu hóa) sản phẩm ID: ${productId}`,
      }
    });
    
    return true;
  } catch (error) {
    console.error('deleteGlobalProductAction error:', error);
    return false;
  }
}
