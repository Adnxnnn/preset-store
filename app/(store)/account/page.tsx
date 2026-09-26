"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Package, Download, LogOut, FileArchive } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setSession(session);

      // Fetch user's orders and the products inside them
      const { data } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          order_items (
            product_id,
            products (
              id,
              title,
              after_image_url,
              file_url
            )
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }
    loadData();
  }, [router]);

  async function handleDownload(fileUrl: string, productId: string) {
    setDownloadingId(productId);
    try {
      // Create a short-lived signed URL for the download
      const { data, error } = await supabase.storage
        .from('product-files')
        .createSignedUrl(fileUrl, 60); // Valid for 60 seconds
        
      if (error) throw error;
      if (data?.signedUrl) {
        // Log the download for analytics (optional)
        await supabase.from('downloads').insert([{ user_id: session.user.id, product_id: productId }]);
        // Trigger download
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate download link.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-white mb-2">My Library</h1>
            <p className="text-gray-400">Welcome back, {session?.user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="space-y-8">
          {orders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
              <Package className="w-12 h-12 text-gray-500 mb-4" />
              <h2 className="text-xl font-medium text-white mb-2">No purchases yet</h2>
              <p className="text-gray-400 mb-6">When you buy a preset, it will show up here forever.</p>
              <Link href="/store" className="h-12 px-8 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center">
                Browse Store
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6 text-sm">
                  <div className="text-gray-400">
                    Order Date: <span className="text-white">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-400">
                    Total: <span className="text-white">₹{order.total_amount}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {order.order_items.map((item: any) => {
                    const product = item.products;
                    if (!product) return null;
                    return (
                      <div key={product.id} className="flex flex-col md:flex-row gap-6 items-center bg-[#050505] rounded-2xl p-4 border border-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={product.after_image_url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'} 
                          alt={product.title}
                          className="w-full md:w-32 md:h-32 object-cover rounded-xl"
                        />
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-medium text-white mb-1">{product.title}</h3>
                          <p className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-2">
                            <FileArchive className="w-4 h-4" /> Preset Pack
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDownload(product.file_url, product.id)}
                          disabled={downloadingId === product.id}
                          className="w-full md:w-auto h-12 px-6 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {downloadingId === product.id ? "Generating Link..." : "Download Files"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
