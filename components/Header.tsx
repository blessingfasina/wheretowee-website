'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  MapPin,
  Download,
  Info,
  Map,
  BookOpen,
  Mail,
  ChevronDown,
  Coins,
  Accessibility,
  Baby,
  Key,
  Compass,
} from 'lucide-react';

/**
 * Sub-menu items for the "Find a Toilet" dropdown.
 *
 * Surfaces the five intent-based landing pages (free / accessible /
 * Changing Places / baby change / RADAR key) plus the live map.
 * Putting these in primary navigation passes far more link equity
 * than the footer ever could — they were our biggest internal-linking
 * gap pre-May 2026.
 */
const findSubmenu: Array<{ name: string; href: string; icon: React.ElementType; blurb: string }> = [
  {
    name: 'Live map',
    href: '/map',
    icon: Map,
    blurb: 'Find the nearest toilet right now',
  },
  {
    name: 'Free public toilets',
    href: '/free-public-toilets',
    icon: Coins,
    blurb: 'No-fee public conveniences across the UK',
  },
  {
    name: 'Accessible toilets',
    href: '/accessible-toilets-uk',
    icon: Accessibility,
    blurb: 'Wheelchair access, grab rails, RADAR key',
  },
  {
    name: 'Changing Places',
    href: '/changing-places-uk',
    icon: Accessibility,
    blurb: 'Hoist + adult-changing bench facilities',
  },
  {
    name: 'Baby changing',
    href: '/baby-changing-near-me',
    icon: Baby,
    blurb: 'Baby change tables across the UK',
  },
  {
    name: 'RADAR key locations',
    href: '/radar-key-toilets-uk',
    icon: Key,
    blurb: 'Every National Key Scheme toilet we know',
  },
  {
    name: 'Browse by city',
    href: '/toilets',
    icon: MapPin,
    blurb: 'London, Manchester, Edinburgh & more',
  },
];

/// Top-level nav (left of the dropdown).
const navigation = [
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const findRef = useRef<HTMLDivElement | null>(null);

  // Close the desktop dropdown on outside-click + Esc.
  useEffect(() => {
    if (!findOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (findRef.current && !findRef.current.contains(e.target as Node)) {
        setFindOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFindOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [findOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 print:hidden">
      <nav className="container-custom" aria-label="Global">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl" role="img" aria-label="toilet">
              🚻
            </span>
            <span className="font-bold text-xl text-navy-600 group-hover:text-navy-700 transition-colors">
              Where To Wee
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Find a Toilet dropdown */}
            <div className="relative" ref={findRef}>
              <button
                type="button"
                onClick={() => setFindOpen((v) => !v)}
                onMouseEnter={() => setFindOpen(true)}
                aria-expanded={findOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 text-gray-600 hover:text-navy-600 font-medium transition-colors"
              >
                <Compass className="w-4 h-4" />
                Find a Toilet
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${findOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {findOpen && (
                <div
                  onMouseLeave={() => setFindOpen(false)}
                  className="absolute left-0 top-full mt-2 w-[min(92vw,520px)] bg-white border border-gray-100 rounded-2xl shadow-xl p-3 grid sm:grid-cols-2 gap-1"
                  role="menu"
                >
                  {findSubmenu.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setFindOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      role="menuitem"
                    >
                      <item.icon className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5 group-hover:text-mint-700" />
                      <span>
                        <span className="block font-semibold text-navy-800 group-hover:text-navy-900">
                          {item.name}
                        </span>
                        <span className="block text-xs text-gray-500">{item.blurb}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 text-gray-600 hover:text-navy-600 font-medium transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/download" className="btn btn-primary">
              <Download className="w-4 h-4" />
              Download App
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-1">
              <div className="px-4 pt-2 pb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                Find a Toilet
              </div>
              {findSubmenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-mint-600" />
                  {item.name}
                </Link>
              ))}
              <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                More
              </div>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 px-4">
                <Link
                  href="/download"
                  className="btn btn-primary w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Download className="w-4 h-4" />
                  Download App
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
