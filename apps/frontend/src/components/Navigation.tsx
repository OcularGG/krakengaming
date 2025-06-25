'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Marketplace', href: '/marketplace' },
  {
    name: 'Tools',
    href: '/tools',
    submenu: [
      { name: 'Map', href: '/tools/naval-map' }
    ]
  },
  { name: 'Port Battles', href: '/port-battles' },
  { name: 'Gallery', href: '/gallery' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleAuth = async () => {
    if (session) {
      await signOut();
    } else {
      try {
        await signIn('discord');
      } catch {
        console.warn('Discord authentication not configured');
        // For development, you could redirect to a setup page or show a message
      }
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            {/* Navigation Links - Centered, No Borders */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href));

                  if (item.submenu) {
                    return (
                      <div
                        key={item.name}
                        className="relative group"
                      >
                        <Link
                          href={item.href}
                          className={`nav-item px-4 py-2 text-sm font-medium rounded ${
                            isActive ? 'active' : ''
                          }`}
                          style={{fontFamily: 'Cinzel, serif', color: 'var(--navy-dark)'}}
                        >
                          {item.name} ↓
                        </Link>

                        <div className="absolute top-full left-0 mt-1 w-36 bg-sandstone-light/95 backdrop-blur-sm shadow-lg z-50 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-4 py-3 text-sm font-medium text-navy-dark hover:bg-transparent transition-colors first:rounded-t last:rounded-b border-b-2 border-transparent hover:border-b-2 hover:border-brass-bright"
                              style={{fontFamily: 'Cinzel, serif'}}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-item px-4 py-2 text-sm font-medium rounded ${
                        isActive ? 'active' : ''
                      }`}
                      style={{fontFamily: 'Cinzel, serif', color: 'var(--navy-dark)'}}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">            <button
              type="button"
              className="nav-item p-2 rounded"
              style={{color: 'var(--navy-dark)'}}
              aria-label="Open menu"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden mx-4 mt-2">
          <div className="bg-sail-white/95 rounded-lg shadow-lg p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-item block px-4 py-2 text-base font-medium rounded ${
                    isActive ? 'active' : ''
                  }`}
                  style={{fontFamily: 'Cinzel, serif', color: 'var(--navy-dark)'}}
                >
                  {item.name}
                </Link>
              );
            })}
            <button
              className="block w-full text-left px-4 py-2 bg-brass hover:bg-brass-bright text-navy-dark font-medium rounded transition-all duration-300 mt-4"
              style={{fontFamily: 'Cinzel, serif'}}
              onClick={handleAuth}
            >
              {session ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Login Button - Bottom Right (Top Right on Map page) */}
      <div className={`fixed z-50 hidden md:block ${
        pathname === '/tools/naval-map' ? 'top-1 right-6' : 'bottom-6 right-6'
      }`}>
        {status === 'loading' ? (
          <div className="px-4 py-2 text-navy-dark bg-sail-white rounded-full shadow-lg">Loading...</div>
        ) : (
          <button
            className="login-floating px-6 py-3 bg-brass text-navy-dark font-medium rounded-full"
            style={{fontFamily: 'Cinzel, serif'}}
            onClick={handleAuth}
          >
            {session ? 'Logout' : 'Login'}
          </button>
        )}
      </div>
    </>
  );
}
