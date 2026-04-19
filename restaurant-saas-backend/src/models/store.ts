/**
 * In-memory storage for all entities
 * This simulates a database and will be replaced with actual DB integration later
 */

import { v4 as uuidv4 } from 'uuid';

// Import types
import {
  User,
  Restaurant,
  Table,
  Session,
  Category,
  MenuItem,
  Order,
  Payment,
  UserRole,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  LocalizedText,
} from '../types';

// ============================================================================
// STORAGE CONTAINERS
// ============================================================================

export const users: Map<string, User> = new Map();
export const restaurants: Map<string, Restaurant> = new Map();
export const tables: Map<string, Table> = new Map();
export const sessions: Map<string, Session> = new Map();
export const categories: Map<string, Category> = new Map();
export const menuItems: Map<string, MenuItem> = new Map();
export const orders: Map<string, Order> = new Map();
export const payments: Map<string, Payment> = new Map();

// ============================================================================
// SEED DATA GENERATORS
// ============================================================================

/**
 * Generate ID with prefix
 */
export function generateId(prefix: string): string {
  return `${prefix}_${uuidv4()}`;
}

/**
 * Get current timestamp
 */
export function now(): Date {
  return new Date();
}

/**
 * Add minutes to date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

// ============================================================================
// USER SEED DATA
// ============================================================================

export function seedUsers(): void {
  // Admin user
  const adminUser: User = {
    id: generateId('user'),
    email: 'admin@restaurant.com',
    password: 'admin123', // In production, this would be hashed
    name: 'System Admin',
    role: UserRole.ADMIN,
    restaurantId: null,
    status: UserStatus.ACTIVE,
    createdAt: now(),
    updatedAt: now(),
  };

  // Staff user for first restaurant
  const staffUser: User = {
    id: generateId('user'),
    email: 'staff@restaurant.com',
    password: 'staff123',
    name: 'Restaurant Staff',
    role: UserRole.STAFF,
    restaurantId: 'rest_1',
    status: UserStatus.ACTIVE,
    createdAt: now(),
    updatedAt: now(),
  };

  users.set(adminUser.id, adminUser);
  users.set(staffUser.id, staffUser);
}

// ============================================================================
// RESTAURANT SEED DATA
// ============================================================================

export function seedRestaurants(): void {
  const restaurant1: Restaurant = {
    id: 'rest_1',
    name: 'The Golden Fork',
    slug: 'the-golden-fork',
    description: 'Fine dining with a modern twist',
    address: '123 Main Street, Istanbul, Turkey',
    phone: '+90 212 555 0100',
    email: 'info@goldenfork.com',
    logo: '/logos/golden-fork.png',
    coverImage: '/covers/golden-fork.jpg',
    timezone: 'Europe/Istanbul',
    currency: 'TRY',
    isActive: true,
    settings: {
      orderTimeoutMinutes: 30,
      maxItemsPerOrder: 20,
      allowTips: true,
      tipOptions: [10, 15, 20, 25],
      requireCustomerName: false,
      enablePayments: true,
    },
    createdAt: now(),
    updatedAt: now(),
  };

  const restaurant2: Restaurant = {
    id: 'rest_2',
    name: 'Pizza Paradise',
    slug: 'pizza-paradise',
    description: 'Authentic Italian pizza and pasta',
    address: '456 Oak Avenue, Berlin, Germany',
    phone: '+49 30 1234 5678',
    email: 'contact@pizzaparadise.de',
    logo: '/logos/pizza-paradise.png',
    coverImage: '/covers/pizza-paradise.jpg',
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    isActive: true,
    settings: {
      orderTimeoutMinutes: 45,
      maxItemsPerOrder: 15,
      allowTips: true,
      tipOptions: [5, 10, 15],
      requireCustomerName: true,
      enablePayments: true,
    },
    createdAt: now(),
    updatedAt: now(),
  };

  restaurants.set(restaurant1.id, restaurant1);
  restaurants.set(restaurant2.id, restaurant2);
}

// ============================================================================
// TABLE SEED DATA
// ============================================================================

export function seedTables(): void {
  const tablesData = [
    { id: 'table_1', restaurantId: 'rest_1', number: 'A1', capacity: 2 },
    { id: 'table_2', restaurantId: 'rest_1', number: 'A2', capacity: 4 },
    { id: 'table_3', restaurantId: 'rest_1', number: 'B1', capacity: 4 },
    { id: 'table_4', restaurantId: 'rest_1', number: 'B2', capacity: 6 },
    { id: 'table_5', restaurantId: 'rest_1', number: 'VIP1', capacity: 8 },
    { id: 'table_6', restaurantId: 'rest_2', number: '1', capacity: 2 },
    { id: 'table_7', restaurantId: 'rest_2', number: '2', capacity: 4 },
    { id: 'table_8', restaurantId: 'rest_2', number: '3', capacity: 4 },
  ];

  tablesData.forEach((t) => {
    const table: Table = {
      id: t.id,
      restaurantId: t.restaurantId,
      number: t.number,
      capacity: t.capacity,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    tables.set(table.id, table);
  });
}

// ============================================================================
// CATEGORY SEED DATA
// ============================================================================

export function seedCategories(): void {
  const categoriesData = [
    {
      id: 'cat_1',
      restaurantId: 'rest_1',
      name: { en: 'Starters', tr: 'Başlangıçlar', de: 'Vorspeisen', ru: 'Закуски', fr: 'Entrées', ar: 'المقبلات' },
      description: { en: 'Delicious starters to begin your meal', tr: 'Yemeğinize lezzetli başlangıçlar', de: 'Leckere Vorspeisen', ru: 'Вкусные закуски', fr: 'Délicieux amuse-gueules', ar: 'مقبلات لذيذة' },
      sortOrder: 1,
    },
    {
      id: 'cat_2',
      restaurantId: 'rest_1',
      name: { en: 'Main Courses', tr: 'Ana Yemekler', de: 'Hauptgerichte', ru: 'Основные блюда', fr: 'Plats principaux', ar: 'الأطباق الرئيسية' },
      description: { en: 'Our signature main dishes', tr: 'İmza ana yemeklerimiz', de: 'Unsere Signature-Hauptgerichte', ru: 'Наши фирменные блюда', fr: 'Nos plats signatures', ar: 'أطباقنا المميزة' },
      sortOrder: 2,
    },
    {
      id: 'cat_3',
      restaurantId: 'rest_1',
      name: { en: 'Desserts', tr: 'Tatlılar', de: 'Desserts', ru: 'Десерты', fr: 'Desserts', ar: 'الحلويات' },
      description: { en: 'Sweet treats to end your meal', tr: 'Yemeğinizi tatlıyla sonlandırın', de: 'Süße Leckereien', ru: 'Сладкие угощения', fr: 'Douceurs sucrées', ar: 'حلويات لذيذة' },
      sortOrder: 3,
    },
    {
      id: 'cat_4',
      restaurantId: 'rest_1',
      name: { en: 'Beverages', tr: 'İçecekler', de: 'Getränke', ru: 'Напитки', fr: 'Boissons', ar: 'المشروبات' },
      description: { en: 'Refreshing drinks', tr: 'Serinletici içecekler', de: 'Erfrischende Getränke', ru: 'Освежающие напитки', fr: 'Boissons rafraichissantes', ar: 'مشروبات منعشة' },
      sortOrder: 4,
    },
    {
      id: 'cat_5',
      restaurantId: 'rest_2',
      name: { en: 'Pizza', tr: 'Pizza', de: 'Pizza', ru: 'Пицца', fr: 'Pizza', ar: 'بيتزا' },
      description: { en: 'Wood-fired Italian pizza', tr: 'Odun ateşinde İtalyan pizzası', de: 'Italienische Holzofen-Pizza', ru: 'Итальянская пицца на дровах', fr: 'Pizza italienne au feu de bois', ar: 'بيتزا إيطالية بفورن الخشب' },
      sortOrder: 1,
    },
    {
      id: 'cat_6',
      restaurantId: 'rest_2',
      name: { en: 'Pasta', tr: 'Makarna', de: 'Pasta', ru: 'Макароны', fr: 'Pâtes', ar: 'باستا' },
      description: { en: 'Fresh homemade pasta', tr: 'Taze ev yapımı makarna', de: 'Frische hausgemachte Pasta', ru: 'Свежая домашняя паста', fr: 'Pâtes maison fraîches', ar: 'باستا طازجة منزلية الصنع' },
      sortOrder: 2,
    },
  ];

  categoriesData.forEach((c) => {
    const category: Category = {
      ...c,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    categories.set(category.id, category);
  });
}

// ============================================================================
// MENU ITEM SEED DATA
// ============================================================================

export function seedMenuItems(): void {
  const menuItemsData = [
    // Restaurant 1 - Starters
    {
      id: 'item_1',
      restaurantId: 'rest_1',
      categoryId: 'cat_1',
      name: { en: 'Bruschetta', tr: 'Bruschetta', de: 'Bruschetta', ru: 'Брускетта', fr: 'Bruschetta', ar: 'بروشيتا' },
      description: {
        en: 'Toasted bread with fresh tomatoes, basil, and olive oil',
        tr: 'Taze domates, fesleğen ve zeytinyağı ile kızarmış ekmek',
        de: 'Getoastetes Brot mit frischen Tomaten, Basilikum und Olivenöl',
        ru: 'Тостерованный хлеб со свежими помидорами, базиликом и оливковым маслом',
        fr: 'Pain grillé aux tomates fraîches, basilic et huile d\'olive',
        ar: 'خبز محمص مع طماطم طازجة وريحان وزيت زيتون'
      },
      price: 85,
      currency: 'TRY',
      isAvailable: true,
      sortOrder: 1,
    },
    {
      id: 'item_2',
      restaurantId: 'rest_1',
      categoryId: 'cat_1',
      name: { en: 'Calamari', tr: 'Kalamar', de: 'Kalamari', ru: 'Каламари', fr: 'Calamars', ar: 'حبار' },
      description: {
        en: 'Crispy fried squid rings with garlic aioli',
        tr: 'Sarımsaklı aioli ile kızarmış kalamar halkaları',
        de: 'Knusprige gebratene Tintenfischringe mit Knoblauch-Aioli',
        ru: 'Хрустящие жареные кольца кальмара с чесночным айоли',
        fr: 'Anneaux de calamars croustillants avec aïoli à l\'ail',
        ar: 'حلقات حبار مقلية مقرمشة مع أليولي الثوم'
      },
      price: 120,
      currency: 'TRY',
      isAvailable: true,
      sortOrder: 2,
    },
    // Restaurant 1 - Main Courses
    {
      id: 'item_3',
      restaurantId: 'rest_1',
      categoryId: 'cat_2',
      name: { en: 'Grilled Salmon', tr: 'Izgara Somon', de: 'Gegrillter Lachs', ru: 'Жареный лосось', fr: 'Saumon grillé', ar: 'سلمون مشوي' },
      description: {
        en: 'Fresh Atlantic salmon with herb butter and seasonal vegetables',
        tr: 'Taze Atlantik somonu otlu tereyağı ve mevsim sebzeleri ile',
        de: 'Frischer atlantischer Lachs mit Kräuterbutter und saisonalem Gemüse',
        ru: 'Свежий атлантический лосось с травяным маслом и сезонными овощами',
        fr: 'Saumon atlantique frais au beurre aux herbes et légumes de saison',
        ar: 'سلمون أطلسي طازج مع زبدة الأعشاب والخضروات الموسمية'
      },
      price: 280,
      currency: 'TRY',
      isAvailable: true,
      preparationTime: 25,
      sortOrder: 1,
    },
    {
      id: 'item_4',
      restaurantId: 'rest_1',
      categoryId: 'cat_2',
      name: { en: 'Beef Steak', tr: 'Bonfile', de: 'Rindersteak', ru: 'Стейк из говядины', fr: 'Steak de bœuf', ar: 'شريحة لحم بقري' },
      description: {
        en: 'Prime beef steak cooked to your preference with garlic butter',
        tr: 'Sarımsaklı tereyağı ile tercih ettiğiniz şekilde pişirilmiş prime bonfile',
        de: 'Premium-Rindersteak nach Ihrem Wunsch mit Knoblauchbutter',
        ru: 'Стейк из мраморной говядины по вашему выбору с чесночным маслом',
        fr: 'Steak de bœuf prime cuit selon vos préférences au beurre à l\'ail',
        ar: 'شريحة لحم بقري طازجة مطهوة حسب رغبتك مع زبدة الثوم'
      },
      price: 350,
      currency: 'TRY',
      isAvailable: true,
      preparationTime: 30,
      sortOrder: 2,
      options: [
        {
          id: 'opt_1',
          name: { en: 'Doneness', tr: 'Pişirme', de: 'Garstufe', ru: 'Степень прожарки', fr: 'Cuisson', ar: 'درجة النضج' },
          choices: [
            { id: 'ch_1', name: { en: 'Rare', tr: 'Çiğ', de: 'Rare', ru: 'Сырой', fr: 'Saignant', ar: 'نادر' }, price: 0 },
            { id: 'ch_2', name: { en: 'Medium', tr: 'Orta', de: 'Medium', ru: 'Средний', fr: 'À point', ar: 'متوسط' }, price: 0 },
            { id: 'ch_3', name: { en: 'Well Done', tr: 'İyi pişmiş', de: 'Durch', ru: 'Хорошо прожаренный', fr: 'Bien cuit', ar: 'ناضج' }, price: 0 },
          ],
          required: true,
          multiSelect: false,
        },
      ],
    },
    // Restaurant 1 - Desserts
    {
      id: 'item_5',
      restaurantId: 'rest_1',
      categoryId: 'cat_3',
      name: { en: 'Tiramisu', tr: 'Tiramisu', de: 'Tiramisu', ru: 'Тирамису', fr: 'Tiramisu', ar: 'تيراميسو' },
      description: {
        en: 'Classic Italian coffee-flavored layered dessert',
        tr: 'Klasik İtalyan kahveli katmanlı tatlı',
        de: 'Klassisches italienisches Kaffee-Dessert',
        ru: 'Классический итальянский десерт со вкусом кофе',
        fr: 'Dessert italien classique au café',
        ar: 'حلوى إيطالية كلاسيكية بنكهة القهوة'
      },
      price: 90,
      currency: 'TRY',
      isAvailable: true,
      sortOrder: 1,
    },
    // Restaurant 1 - Beverages
    {
      id: 'item_6',
      restaurantId: 'rest_1',
      categoryId: 'cat_4',
      name: { en: 'Fresh Orange Juice', tr: 'Taze Portakal Suyu', de: 'Frischer Orangensaft', ru: 'Свежий апельсиновый сок', fr: 'Jus d\'orange frais', ar: 'عصير برتقال طازج' },
      description: {
        en: 'Freshly squeezed orange juice',
        tr: 'Taze sıkılmış portakal suyu',
        de: 'Frisch gepresster Orangensaft',
        ru: 'Свежевыжатый апельсиновый сок',
        fr: 'Jus d\'orange fraîchement pressé',
        ar: 'عصير برتقال طازج معصور'
      },
      price: 45,
      currency: 'TRY',
      isAvailable: true,
      sortOrder: 1,
    },
    // Restaurant 2 - Pizza
    {
      id: 'item_7',
      restaurantId: 'rest_2',
      categoryId: 'cat_5',
      name: { en: 'Margherita', tr: 'Margarita', de: 'Margherita', ru: 'Маргарита', fr: 'Margherita', ar: 'مارجريتا' },
      description: {
        en: 'Classic tomato sauce, mozzarella, and fresh basil',
        tr: 'Klasik domates sosu, mozzarella ve taze fesleğen',
        de: 'Klassische Tomatensauce, Mozzarella und frisches Basilikum',
        ru: 'Классический томатный соус, моцарелла и свежий базилик',
        fr: 'Sauce tomate classique, mozzarella et basilic frais',
        ar: 'صلصة طماطم كلاسيكية وموزاريلا وريحان طازج'
      },
      price: 12.99,
      currency: 'EUR',
      isAvailable: true,
      sortOrder: 1,
    },
    {
      id: 'item_8',
      restaurantId: 'rest_2',
      categoryId: 'cat_5',
      name: { en: 'Quattro Formaggi', tr: 'Dört Peynirli', de: 'Quattro Formaggi', ru: 'Четыре сыра', fr: 'Quattro Formaggi', ar: 'فورماجي' },
      description: {
        en: 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and fontina',
        tr: 'Mozzarella, gorgonzola, parmesan ve fontina ile dört peynirli pizza',
        de: 'Vier-Käse-Pizza mit Mozzarella, Gorgonzola, Parmesan und Fontina',
        ru: 'Пицца с четырьмя сырами: моцарелла, горгонзола, пармезан и фонтина',
        fr: 'Pizza aux quatre fromages : mozzarella, gorgonzola, parmesan et fontina',
        ar: 'بيتزا بأربعة أجبان: موزاريلا وجورجونزولا وبارميزان وفونتينا'
      },
      price: 15.99,
      currency: 'EUR',
      isAvailable: true,
      sortOrder: 2,
    },
    // Restaurant 2 - Pasta
    {
      id: 'item_9',
      restaurantId: 'rest_2',
      categoryId: 'cat_6',
      name: { en: 'Spaghetti Carbonara', tr: 'Spagetti Karbonara', de: 'Spaghetti Carbonara', ru: 'Спагетти Карбонара', fr: 'Spaghetti Carbonara', ar: 'سباغيتي كارونارا' },
      description: {
        en: 'Classic Roman pasta with egg, pecorino cheese, guanciale, and black pepper',
        tr: 'Yumurta, peynir, guanciale ve karabiber ile klasik Roma makarnası',
        de: 'Klassische römische Pasta mit Ei, Pecorino, Guanciale und schwarzem Pfeffer',
        ru: 'Классическая римская паста с яйцом, пекорино, гуанчале и чёрным перцем',
        fr: 'Pâte romaine classique avec œuf, pecorino, guanciale et poivre noir',
        ar: 'معكرونة رومانية كلاسيكية مع البيض وجبن البيecorino وجوانسيالي وفلفل أسود'
      },
      price: 14.99,
      currency: 'EUR',
      isAvailable: true,
      preparationTime: 15,
      sortOrder: 1,
    },
  ];

  menuItemsData.forEach((m) => {
    const menuItem: MenuItem = {
      ...m,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    menuItems.set(menuItem.id, menuItem);
  });
}

// ============================================================================
// ORDER SEED DATA
// ============================================================================

export function seedOrders(): void {
  const ordersData = [
    {
      id: 'order_1',
      restaurantId: 'rest_1',
      tableId: 'table_1',
      sessionId: 'sess_1',
      customerName: 'Ahmet Yılmaz',
      items: [
        { id: 'oi_1', orderId: 'order_1', menuItemId: 'item_1', menuItemName: 'Bruschetta', quantity: 2, unitPrice: 85, subtotal: 170 },
        { id: 'oi_2', orderId: 'order_1', menuItemId: 'item_3', menuItemName: 'Grilled Salmon', quantity: 1, unitPrice: 280, subtotal: 280 },
      ],
      subtotal: 450,
      tax: 81,
      discount: 0,
      tip: 50,
      total: 581,
      currency: 'TRY',
      status: OrderStatus.COMPLETED,
    },
    {
      id: 'order_2',
      restaurantId: 'rest_1',
      tableId: 'table_2',
      sessionId: 'sess_2',
      customerName: 'Elif Kaya',
      items: [
        { id: 'oi_3', orderId: 'order_2', menuItemId: 'item_2', menuItemName: 'Calamari', quantity: 1, unitPrice: 120, subtotal: 120 },
        { id: 'oi_4', orderId: 'order_2', menuItemId: 'item_4', menuItemName: 'Beef Steak', quantity: 2, unitPrice: 350, subtotal: 700 },
        { id: 'oi_5', orderId: 'order_2', menuItemId: 'item_5', menuItemName: 'Tiramisu', quantity: 2, unitPrice: 90, subtotal: 180 },
      ],
      subtotal: 1000,
      tax: 180,
      discount: 0,
      tip: 120,
      total: 1300,
      currency: 'TRY',
      status: OrderStatus.PREPARING,
    },
    {
      id: 'order_3',
      restaurantId: 'rest_2',
      tableId: 'table_6',
      sessionId: 'sess_3',
      customerName: 'Max Müller',
      items: [
        { id: 'oi_6', orderId: 'order_3', menuItemId: 'item_7', menuItemName: 'Margherita', quantity: 2, unitPrice: 12.99, subtotal: 25.98 },
        { id: 'oi_7', orderId: 'order_3', menuItemId: 'item_9', menuItemName: 'Spaghetti Carbonara', quantity: 1, unitPrice: 14.99, subtotal: 14.99 },
      ],
      subtotal: 40.97,
      tax: 8.19,
      discount: 0,
      tip: 5,
      total: 54.16,
      currency: 'EUR',
      status: OrderStatus.PENDING,
    },
  ];

  ordersData.forEach((o) => {
    const order: Order = {
      ...o,
      orderNumber: `ORD-${(orders.size + 1).toString().padStart(3, '0')}`,
      createdAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
      updatedAt: now(),
    };
    orders.set(order.id, order);
  });
}

// ============================================================================
// PAYMENT SEED DATA
// ============================================================================

export function seedPayments(): void {
  const paymentsData = [
    {
      id: 'pay_1',
      orderId: 'order_1',
      restaurantId: 'rest_1',
      amount: 531,
      currency: 'TRY',
      method: PaymentMethod.CARD,
      status: PaymentStatus.COMPLETED,
      transactionId: 'txn_mock_001',
    },
  ];

  paymentsData.forEach((p) => {
    const payment: Payment = {
      ...p,
      createdAt: now(),
      updatedAt: now(),
    };
    payments.set(payment.id, payment);
  });
}

// ============================================================================
// INITIALIZE ALL SEED DATA
// ============================================================================

export function initializeData(): void {
  console.log('🔄 Initializing in-memory data store...');

  seedUsers();
  seedRestaurants();
  seedTables();
  seedCategories();
  seedMenuItems();
  seedOrders();
  seedPayments();

  console.log('✅ Data store initialized with seed data');
  console.log('   - Users: ' + users.size);
  console.log('   - Restaurants: ' + restaurants.size);
  console.log('   - Tables: ' + tables.size);
  console.log('   - Categories: ' + categories.size);
  console.log('   - Menu Items: ' + menuItems.size);
  console.log('   - Orders: ' + orders.size);
  console.log('   - Payments: ' + payments.size);
}

// ============================================================================
// UTILITY FUNCTIONS FOR DATA ACCESS
// ============================================================================

/**
 * Clear all data (useful for testing)
 */
export function clearAllData(): void {
  users.clear();
  restaurants.clear();
  tables.clear();
  sessions.clear();
  categories.clear();
  menuItems.clear();
  orders.clear();
  payments.clear();
}

/**
 * Get data statistics
 */
export function getDataStats(): Record<string, number> {
  return {
    users: users.size,
    restaurants: restaurants.size,
    tables: tables.size,
    sessions: sessions.size,
    categories: categories.size,
    menuItems: menuItems.size,
    orders: orders.size,
    payments: payments.size,
  };
}