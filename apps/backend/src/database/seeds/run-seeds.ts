import 'reflect-metadata';
import { AppDataSource } from '../../config/data-source';
import * as bcrypt from 'bcryptjs';

async function run() {
  await AppDataSource.initialize();
  console.log('🌱 Iniciando seeding...');
  console.log('✅ Conexión establecida.');

  try {
    const storeRepo = AppDataSource.getRepository('stores');
    const userRepo = AppDataSource.getRepository('users');
    const categoryRepo = AppDataSource.getRepository('categories');
    const productRepo = AppDataSource.getRepository('products');
    const customerRepo = AppDataSource.getRepository('customers');

    // Tienda
    const store = storeRepo.create({
      name: 'Tienda Principal',
      slug: 'tienda-principal',
      currency: 'PYG',
      isActive: true,
    });
    const savedStore = await storeRepo.save(store);
    console.log('✅ Tienda creada');

    // Admin
    const adminHash = await bcrypt.hash('admin123', 12);
    await userRepo.save(userRepo.create({
      firstName: 'Admin',
      lastName: 'Principal',
      email: 'admin@empresa.com',
      passwordHash: adminHash,
      role: 'store_admin',
      storeId: savedStore.id,
      isActive: true,
    }));
    console.log('✅ Admin: admin@empresa.com / admin123');

    // Cajero
    const cajeroHash = await bcrypt.hash('cajero123', 12);
    await userRepo.save(userRepo.create({
      firstName: 'Juan',
      lastName: 'Cajero',
      email: 'cajero@empresa.com',
      passwordHash: cajeroHash,
      role: 'cashier',
      storeId: savedStore.id,
      isActive: true,
    }));
    console.log('✅ Cajero: cajero@empresa.com / cajero123');

    // Categorías
    const cats = ['Bebidas', 'Snacks', 'Limpieza', 'Electrónica'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    const savedCats: any[] = [];
    for (let i = 0; i < cats.length; i++) {
      const cat = await categoryRepo.save(categoryRepo.create({
        name: cats[i],
        color: colors[i],
        storeId: savedStore.id,
        isActive: true,
      }));
      savedCats.push(cat);
    }
    console.log('✅ 4 categorías creadas');

    // Productos
    const products = [
      { name: 'Coca Cola 2L', sku: 'BEB-001', barcode: '7790001', salePrice: 12000, costPrice: 8000, taxRate: 10, stock: 50, categoryId: savedCats[0].id },
      { name: 'Agua Mineral 1.5L', sku: 'BEB-002', barcode: '7790002', salePrice: 4000, costPrice: 2500, taxRate: 10, stock: 100, categoryId: savedCats[0].id },
      { name: 'Papas Fritas', sku: 'SNA-001', barcode: '7790003', salePrice: 8000, costPrice: 5000, taxRate: 10, stock: 60, categoryId: savedCats[1].id },
      { name: 'Detergente 1L', sku: 'LIM-001', barcode: '7790004', salePrice: 15000, costPrice: 10000, taxRate: 10, stock: 25, categoryId: savedCats[2].id },
      { name: 'Cable USB-C', sku: 'TEC-001', barcode: '7790005', salePrice: 35000, costPrice: 18000, taxRate: 10, stock: 20, categoryId: savedCats[3].id },
    ];

    for (const p of products) {
      await productRepo.save(productRepo.create({
        ...p,
        storeId: savedStore.id,
        isActive: true,
        trackStock: true,
        unit: 'unidad',
        stockMin: 5,
      }));
    }
    console.log('✅ 5 productos creados');

    // Clientes
    await customerRepo.save(customerRepo.create({
      firstName: 'María',
      lastName: 'González',
      phone: '0981123456',
      document: '4567890',
      storeId: savedStore.id,
      isActive: true,
    }));
    console.log('✅ 1 cliente creado');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('Admin:  admin@empresa.com / admin123');
    console.log('Cajero: cajero@empresa.com / cajero123');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
