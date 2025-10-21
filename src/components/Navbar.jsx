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
  Menu, // Hamburger icon
  X,      // Close icon
} from 'lucide-react';

// Reusable Navbar component
export const Navbar = ({ role, searchTerm, onSearchChange }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const isAdmin = role === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Logo and Welcome */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Event Manager
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {/* Show (Admin) only if admin */}
                Welcome, {user?.name} {isAdmin ? '(Admin)' : ''}
              </p>
            </div>
          </div>

          {/* Middle: Search Bar (Only for Admin on Desktop) */}
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
                  onChange={onSearchChange} // Use handler from props
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Right Side: Desktop Controls (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isAdmin && ( // User Management link only for Admin
              <Link
                to="/admin/users"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                title="Manage Users"
              >
                <Users className="w-5 h-5" />
                <span className="hidden lg:inline">Users</span> {/* Show text on large screens */}
              </Link>
            )}
            {/* AI Assistant, Theme Toggle, Profile Dropdown */}
            <button
              onClick={() => { /* Need to pass setShowAI function via props */ alert('AI Assistant needs prop drill'); }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            >
              <Bot className="w-5 h-5" />
              <span className="hidden lg:inline">AI Assistant</span> {/* Show text on large screens */}
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

          {/* Mobile Menu Button (Visible only on Mobile) */}
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

      {/* Mobile Menu Dropdown (Conditionally Rendered) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-lg z-30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {/* Search Bar for Admin in Mobile Menu */}
             {isAdmin && (
                <div className="relative px-2 pb-2">
                   <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
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
              )}
            {/* Links */}
            {isAdmin && (
              <Link
                to="/admin/users"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Users className="w-5 h-5" /> Manage Users
              </Link>
            )}
            <button
              onClick={() => { /* Need to pass setShowAI function via props */ alert('AI Assistant needs prop drill'); setIsMobileMenuOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Bot className="w-5 h-5" /> AI Assistant
            </button>
            <button
              onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              Toggle Theme
            </button>
            {/* Profile Dropdown might be complex here, maybe just show user info + logout? */}
            {/* Simplified for mobile: */}
             <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
               <div className="flex items-center px-5">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold">
                   {user?.name ? user.name[0].toUpperCase() : '?'}
                 </div>
                 <div className="ml-3">
                   <div className="text-base font-medium text-gray-800 dark:text-white">{user?.name}</div>
                   <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                 </div>
               </div>
               <div className="mt-3 px-2 space-y-1">
                 {/* Add Edit Profile link/button if needed */}
                 <button
                   onClick={() => { /* Need logout func */ alert('Logout needs context'); setIsMobileMenuOpen(false); }}
                   className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                 >
                   Logout
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
};