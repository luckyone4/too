import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { MenuPage } from './pages/MenuPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Utensils, Settings } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant QR Ordering
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Multi-language restaurant ordering system with RTL support
          </p>
          <div className="space-y-4">
            <Link
              to="/menu"
              className="block w-full px-6 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Utensils className="w-5 h-5 inline-block mr-2" />
              Customer Menu
            </Link>
            <Link
              to="/admin"
              className="block w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Settings className="w-5 h-5 inline-block mr-2" />
              Admin Dashboard
            </Link>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
            Supports: English, Turkish, German, Russian, French, Arabic (RTL)
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
