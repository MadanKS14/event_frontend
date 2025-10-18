import { useState, useEffect, useRef } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EditProfileModal } from './EditProfileModal'; // 1. Import the modal

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 2. Add state for the modal
  const dropdownRef = useRef(null);

  // Get the user's first initial
  const userInitial = user?.name ? user.name[0].toUpperCase() : '?';

  // This effect closes the dropdown when you click outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    // 3. Wrap in a React Fragment
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Icon Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          {userInitial}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
            {/* User Info Header */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="py-1">
              {/* Edit Profile Button */}
              <button
                onClick={() => {
                  setIsEditModalOpen(true); // 4. Open the modal
                  setIsOpen(false); // Close the dropdown
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon className="w-4 h-4" />
                Edit Profile
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Render the modal (it will be invisible until isOpen is true) */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};