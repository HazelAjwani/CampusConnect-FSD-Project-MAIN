import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null); // State for error message
  const notificationsButtonRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    // Fetch notifications from the backend API
    const fetchNotifications = async () => {
      try {
        const user = localStorage.getItem('user');
        const email = user ? JSON.parse(user).email_id : '';

        if (email) {
          const response = await axios.get(`http://localhost:8080/get_notifications?email=${email}`);
          console.log("Response from API:", response.data);  // Log the response for debugging

          if (response.data && Array.isArray(response.data)) {
            setNotifications(response.data);
            setError(null);  // Clear any previous error
          } else {
            console.error("Invalid response format for notifications");
            setNotifications([]);  // Clear notifications if the format is invalid
            setError("Failed to fetch notifications");
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);  // Clear notifications on error
        setError("Failed to load notifications. Please try again later.");
      }
    };

    fetchNotifications();
  }, []); // Run once on component mount or if user changes (use dependency if needed)

  return (
    <header className="z-30 fixed w-screen bg-slate-200 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row mx-auto h-16 items-center justify-between relative">
          {/* Buttons container */}
          <div className="flex space-x-2">
            {/* Show Navigation Button */}
            <button
              className="rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 px-5 py-2.5 text-sm font-medium text-slate-800 dark:text-white shadow active:bg-green-700"
              type="button"
              data-drawer-target="drawer-navigation"
              data-drawer-show="drawer-navigation"
              aria-controls="drawer-navigation"
            >
              Show Navigation
            </button>

            {/* Notifications Button */}
            <button
              ref={notificationsButtonRef}
              className="relative rounded border border-gray-800 dark:border-green-200 bg-transparent hover:bg-green-400 px-5 py-2.5 text-sm font-medium text-slate-800 dark:text-white shadow active:bg-green-700"
              type="button"
              onClick={toggleDropdown}
            >
              Notifications
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-1 text-xs">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Campus Connect Title */}
          <p className="font-bold font-mono text-teal-600 dark:text-teal-300">
            Campus Connect
          </p>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {isDropdownOpen && (
        <div
          className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50 mt-2"
          style={{
            top: notificationsButtonRef.current
              ? notificationsButtonRef.current.getBoundingClientRect().bottom
              : 0,
            left: notificationsButtonRef.current
              ? notificationsButtonRef.current.getBoundingClientRect().left
              : 0,
            width: '300px',
          }}
        >
          <ul className="space-y-2">
            {error ? (
              <li className="text-sm text-red-600 dark:text-red-400">
                {error} {/* Display the error message if there was an issue */}
              </li>
            ) : notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li key={index} className="text-sm text-gray-800 dark:text-white">
                  {notification}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400 dark:text-gray-500">
                No new notifications
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
