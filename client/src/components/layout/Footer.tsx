import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black/80 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo and Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Daveflix</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Your premium destination for the latest movies, TV shows, and exclusive original content.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="hover:text-white transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
              <li><Link href="/movies" className="hover:text-white transition-colors">Movies</Link></li>
              <li><Link href="/tv-shows" className="hover:text-white transition-colors">TV Shows</Link></li>
              <li><Link href="/new" className="hover:text-white transition-colors">New & Popular</Link></li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li><Link href="/account" className="hover:text-white transition-colors">Account</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Support Center</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>support@daveflix.com</span>
              </li>
              <li className="mt-4">
                <button className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors">
                  Subscribe to Newsletter
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {currentYear} Daveflix. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}