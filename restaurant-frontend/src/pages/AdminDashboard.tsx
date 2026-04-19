import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { api } from '../services/api';
import { getLocalizedText } from '../contexts/CartContext';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Grid3X3,
  BarChart3,
  LogOut,
  ChefHat,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

type TabType = 'dashboard' | 'orders' | 'menu' | 'tables' | 'analytics';

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function AdminDashboard() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'orders' || activeTab === 'dashboard') {
        const response = await api.getOrders('rest_1');
        if (response.success) {
          setOrders(response.data || []);
        }
      }
      if (activeTab === 'analytics' || activeTab === 'dashboard') {
        const response = await api.getRevenueAnalytics('rest_1');
        if (response.success) {
          setAnalytics(response.data);
        }
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const tabs = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'orders', label: t('admin.orders'), icon: ShoppingBag },
    { id: 'menu', label: t('admin.menu'), icon: UtensilsCrossed },
    { id: 'tables', label: t('admin.tables'), icon: Grid3X3 },
    { id: 'analytics', label: t('admin.analytics'), icon: BarChart3 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('admin.dashboard')}
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <LogOut className="w-4 h-4" />
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.revenue')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analytics?.total || 0} {analytics?.currency || 'TRY'}
              </p>
              {analytics?.comparison?.changePercent && (
                <p className={`text-sm mt-1 ${analytics.comparison.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analytics.comparison.changePercent >= 0 ? '+' : ''}{analytics.comparison.changePercent}%
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.todayOrders')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {orders.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.avgOrderValue')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {analytics?.averageOrderValue || 0} {analytics?.currency || 'TRY'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}
              </p>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order #</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Table</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{order.tableId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{order.total} {order.currency}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                          {getStatusIcon(order.status)}
                          {t(`order.${order.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pending">{t('order.pending')}</option>
                          <option value="confirmed">{t('order.confirmed')}</option>
                          <option value="preparing">{t('order.preparing')}</option>
                          <option value="ready">{t('order.ready')}</option>
                          <option value="completed">{t('order.completed')}</option>
                          <option value="cancelled">{t('order.cancelled')}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {t('common.noData')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && analytics && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.revenue')}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total} {analytics.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.avgOrderValue')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageOrderValue} {analytics.currency}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for Menu and Tables tabs */}
        {activeTab === 'menu' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('admin.menu')} - Full CRUD coming soon</p>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Grid3X3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('admin.tables')} - 5 tables active</p>
          </div>
        )}
      </div>
    </div>
  );
}
