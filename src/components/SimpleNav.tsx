'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SimpleNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-900">LIFE Financial Dashboard</h1>
            </div>
            
            {/* Navigation Links */}
            <div className="flex space-x-4">
              <Link 
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              
              <Link 
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/Login"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/Login'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Login
              </Link>
                            
              <Link
                href="/Signup"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === '/Signup'
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Signup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}