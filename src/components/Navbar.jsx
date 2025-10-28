import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileDropdown } from './ProfileDropdown';
import {
  Moon,
  Sun,
  Bot,
  LayoutGrid,
  Users,
  Search,
  Menu,
  X,
  LogOut,
} from 'lucide-react';


export const Navbar = ({ role, searchTerm, onSearchChange, onToggleAI }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = role === 'admin';
  const userInitial = user?.name ? user.name[0].toUpperCase() : '?';
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Event Manager
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Welcome, {user?.name} {isAdmin ? '(Admin)' : ''}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={onSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}
          {!isAdmin && <div className="hidden md:flex flex-1 max-w-lg mx-4"></div>}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAdmin && (
              <Link
                to="/admin/users"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                title="Manage Users"
              >
                <Users className="w-5 h-5" />
                <span className="hidden lg:inline">Users</span>
              </Link>
            )}
            <button
              onClick={onToggleAI}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              title="AI Assistant"
            >
              <Bot className="w-5 h-5" />
              <span className="hidden lg:inline">AI Assistant</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
            <ProfileDropdown />
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Open main menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-lg z-30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAdmin && (
              <div className="relative px-2 pb-3 pt-1">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" placeholder="Search events..." value={searchTerm} onChange={onSearchChange} className="block w-full pl-10 ..." />
              </div>
            )}
            {isAdmin && (
              <Link to="/admin/users" onClick={closeMobileMenu} className="flex items-center gap-3 px-3 py-2 ...">
                <Users className="w-5 h-5" /> Manage Users
              </Link>
            )}
            <button
              onClick={() => { onToggleAI(); closeMobileMenu(); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Bot className="w-5 h-5" /> AI Assistant
            </button>
            <button
              onClick={() => { toggleTheme(); closeMobileMenu(); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              Toggle Theme
            </button>

            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold">
                  {userInitial}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => { logout(); closeMobileMenu(); }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};