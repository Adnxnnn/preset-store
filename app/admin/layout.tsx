"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Also check if admin bypass token exists for initial setup if configured
        const adminEmail = session?.user?.email || (typeof window !== "undefined" ? localStorage.getItem("luma_admin_email") : null);

        if (!session && !adminEmail) {
          router.replace("/admin/login");
          return;
        }

        setAdminUser(session?.user || { email: adminEmail || "admin@presetstore.com" });
        setIsChecking(false);
      } catch (err) {
        console.error("Admin Auth Error:", err);
        router.replace("/admin/login");
      }
    }
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage && typeof window !== "undefined" && !localStorage.getItem("luma_admin_email")) {
        router.replace("/admin/login");
      } else if (session) {
        setAdminUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, isLoginPage]);

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Preset Products", href: "/admin/products", icon: Package },
    { name: "Orders & Sales", href: "/admin/orders", icon: ShoppingCart },
  ];

  async function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("luma_admin_email");
      localStorage.removeItem("luma_admin_auth");
    }
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (isChecking && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Verifying Admin Authorization...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-gray-200">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#080808] flex flex-col hidden md:flex shrink-0">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/luma.png"
            alt="LUMA"
            className="h-7 w-auto object-contain"
          />
          <div>
            <span className="text-xs font-serif tracking-widest text-white font-bold block">ADMIN STUDIO</span>
            <span className="block text-[9px] text-emerald-400 uppercase tracking-wider">Control Panel</span>
          </div>
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wider transition-all ${
                  isActive 
                    ? "bg-white text-black shadow-lg" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Signed in as</p>
            <p className="text-xs text-white truncate font-medium">{adminUser?.email || "admin@presetstore.com"}</p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-base sm:text-lg font-serif text-white">
              {navItems.find(item => item.href === pathname)?.name || "Admin Panel"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              target="_blank" 
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full"
            >
              <span>Live Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#080808] border-b border-white/10 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium ${
                    isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
