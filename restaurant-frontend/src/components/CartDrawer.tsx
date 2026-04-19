import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart, getLocalizedText } from '../contexts/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { language, t } = useLanguage();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getTotal } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) return;

    setOrdering(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 1000));
      const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
      setOrderNumber(orderNum);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setOrdering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {orderSuccess ? t('order.orderPlaced') : t('cart.yourCart')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {orderSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('order.thankYou')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('order.orderNumber')}: <span className="font-bold">{orderNumber}</span>
              </p>
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setOrderNumber('');
                  setCustomerName('');
                  onClose();
                }}
                className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {t('common.close')}
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">{t('menu.emptyCart')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getLocalizedText(item.menuItem.name, language)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.menuItem.price} {item.menuItem.currency}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!orderSuccess && items.length > 0 && (
          <div className="border-t dark:border-gray-700 p-4 space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('order.yourName')}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('order.namePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('cart.subtotal')}</span>
                <span>{getSubtotal()} TRY</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('cart.tax')} (18%)</span>
                <span>{getTax()} TRY</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-600">
                <span>{t('cart.total')}</span>
                <span>{getTotal()} TRY</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('cart.clearCart')}
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={!customerName.trim() || ordering}
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ordering ? '...' : t('order.placeOrder')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
