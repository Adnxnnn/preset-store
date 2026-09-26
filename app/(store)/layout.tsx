import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl tracking-widest font-serif text-white">
            LUMA.
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="/store" className="hover:text-white transition-colors">Store</Link>
            <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-gray-400">
          <Link href="/account" className="hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="hover:text-white transition-colors flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-bold bg-white text-black w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-gray-400 text-sm">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif text-white mb-6">LUMA.</h2>
          <p className="max-w-sm leading-relaxed">
            Premium editing tools for photographers and digital creators. Transform your workflow and create breathtaking imagery in one click.
          </p>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4 tracking-widest text-xs uppercase">Shop</h3>
          <ul className="space-y-3">
            <li><Link href="/store" className="hover:text-white transition-colors">All Presets</Link></li>
            <li><Link href="/collections/mobile" className="hover:text-white transition-colors">Mobile Collections</Link></li>
            <li><Link href="/collections/desktop" className="hover:text-white transition-colors">Desktop Collections</Link></li>
            <li><Link href="/bundles" className="hover:text-white transition-colors">Master Bundles</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4 tracking-widest text-xs uppercase">Support</h3>
          <ul className="space-y-3">
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/install-guide" className="hover:text-white transition-colors">Installation Guide</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/admin" className="hover:text-white transition-colors">Creator Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 border-t border-white/5 pt-8">
        <p>&copy; {new Date().getFullYear()} Luma Presets. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-[#050505] text-gray-200 font-sans selection:bg-white/20">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
