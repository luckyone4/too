import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { CartDrawer } from '../components/CartDrawer';
import { MenuItem } from '../types';
import { api } from '../services/api';
import { getLocalizedText } from '../contexts/CartContext';
import { Menu, ShoppingCart, Plus, Minus, X, Loader2 } from 'lucide-react';

export function MenuPage() {
  const { language, t, isRTL, direction } = useLanguage();
  const { items, addItem, getItemCount } = useCart();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [addingItem, setAddingItem] = useState<string | null>(null);

  const restaurantId = 'rest_1'; // Demo restaurant

  useEffect(() => {
    loadMenu();
  }, [language]);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getMenu(restaurantId, language);
      if (response.success && response.data) {
        setMenu(response.data);
        if (response.data.categories?.length > 0) {
          setSelectedCategory(response.data.categories[0].id);
        }
      } else {
        setError(response.error?.message || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: MenuItem) => {
    setAddingItem(item.id);
    try {
      // First try to add via API if session exists
      await api.addToCart('table_1', item.id, 1);
    } catch (e) {
      // Fallback to local cart
    }
    addItem(item, 1);
    setTimeout(() => setAddingItem(null), 300);
  };

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = items.find(i => i.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || t('common.error')}</p>
          <button
            onClick={loadMenu}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={direction}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {menu.restaurant.logo && (
                <img
                  src={menu.restaurant.logo}
                  alt={menu.restaurant.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {menu.restaurant.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {menu.restaurant.address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Categories Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t('menu.categories')}
              </h2>
              <nav className="space-y-2">
                {menu.categories?.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-start px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {getLocalizedText(category.name, language)}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile Categories */}
          <div className="md:hidden overflow-x-auto pb-2">
            <div className="flex gap-2">
              {menu.categories?.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {getLocalizedText(category.name, language)}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <main className="flex-1">
            {menu.categories?.map((category: any) => (
              <section
                key={category.id}
                className={`mb-8 ${selectedCategory === category.id ? 'block' : 'hidden md:block'}`}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {getLocalizedText(category.name, language)}
                </h2>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {getLocalizedText(category.description, language)}
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {category.items?.map((item: MenuItem) => {
                    const inCart = getCartItemQuantity(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {getLocalizedText(item.name, language)}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {getLocalizedText(item.description, language)}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-orange-500 ml-2">
                              {item.price} {item.currency}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={addingItem === item.id}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                          >
                            {addingItem === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : inCart > 0 ? (
                              <>
                                <Plus className="w-4 h-4" />
                                {t('menu.addToCart')} ({inCart})
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                {t('menu.addToCart')}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}
