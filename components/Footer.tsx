import Link from 'next/link';
import { MapPin, Mail, Heart } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const footerLinks = {
  product: [
    { name: 'Find Toilets', href: '/map' },
    { name: 'Download App', href: '/download' },
    { name: 'Add a Toilet', href: '/submit' },
    { name: 'City Directory', href: '/toilets' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Press Kit', href: '/press' },
    { name: 'Contact', href: '/contact' },
  ],
  guides: [
    { name: 'RADAR Key Guide', href: '/radar-key' },
    { name: 'Toilet Tips', href: '/toilet-tips' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
  find: [
    { name: 'Free Public Toilets', href: '/free-public-toilets' },
    { name: 'Accessible Toilets UK', href: '/accessible-toilets-uk' },
    { name: 'Changing Places UK', href: '/changing-places-uk' },
    { name: 'Baby Changing Near Me', href: '/baby-changing-near-me' },
    { name: 'RADAR Key Toilets', href: '/radar-key-toilets-uk' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Content Policy', href: '/content-policy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
};

const cities = [
  'London',
  'Birmingham',
  'Manchester',
  'Leeds',
  'Glasgow',
  'Liverpool',
  'Bristol',
  'Edinburgh',
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-800 text-white print:hidden">
      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrandLogo size={36} />
              <span className="font-bold text-xl">Where To Wee</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Find clean, accessible public toilets near you across the UK. Free app with 15,000+ locations.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>United Kingdom</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Guides</h3>
            <ul className="space-y-2">
              {footerLinks.guides.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Find a Toilet — intent-based category pages */}
          <div>
            <h3 className="font-semibold text-white mb-4">Find a Toilet</h3>
            <ul className="space-y-2">
              {footerLinks.find.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-white mb-4">Popular Cities</h3>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city}>
                  <Link
                    href={`/toilets/${city.toLowerCase()}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Where To Wee. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> in the UK
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

