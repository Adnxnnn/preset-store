"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  ExternalLink, 
  Check, 
  X, 
  Star, 
  RefreshCw,
  SlidersHorizontal,
  FileArchive
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { INITIAL_PRESETS, PresetProduct } from "../../lib/store";
import { useUI } from "../../components/UIFeedback";

export default function AdminProductsPage() {
  const { showToast, confirm } = useUI();
  const [products, setProducts] = useState<PresetProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      if (res.ok && data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts(INITIAL_PRESETS);
      }
    } catch (err) {
      console.warn("Using local presets:", err);
      setProducts(INITIAL_PRESETS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleTogglePublish(product: PresetProduct) {
    const nextStatus = !product.is_published;
    setTogglingId(product.id);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          is_published: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_published: nextStatus } : p))
      );
      showToast(`Preset "${product.title}" is now ${nextStatus ? "Published" : "Draft"}.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleToggleFeatured(product: PresetProduct) {
    const nextFeatured = !product.is_featured;
    setTogglingId(product.id);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          is_featured: nextFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update featured flag");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextFeatured } : p))
      );
      showToast(`Preset "${product.title}" featured status updated.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update featured flag", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteProduct(product: PresetProduct) {
    const confirmed = await confirm({
      title: "Delete Preset Collection",
      message: `Are you sure you want to permanently delete "${product.title}"? This action cannot be undone.`,
      confirmText: "Delete Preset",
      destructive: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not delete preset");
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Preset "${product.title}" deleted successfully.`, "success");
    } catch (err: any) {
      showToast(err.message || "Could not delete preset. It may be linked to existing orders.", "error");
    }
  }

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white">Preset Collections</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your digital products, pricing, previews, and private ZIP files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="h-10 px-3.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium border border-white/5 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link
            href="/admin/products/new"
            className="h-10 px-4 bg-white text-black font-semibold rounded-xl text-xs hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Add New Preset
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search preset products..."
            className="w-full h-10 bg-[#080808] border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-white/5 text-gray-300 font-semibold border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Preset Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Loading preset collections...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    No preset collections found. Create your first preset pack!
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                    {/* Thumbnail & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.after_image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate max-w-[220px]">
                            {product.title}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[220px] mt-0.5">
                            {product.format || ".XMP & .DNG"} &bull; {product.preset_count || 10} files
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-gray-300 text-[11px] font-medium">
                        {product.category || "Cinematic"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">
                        ₹{product.price}
                      </div>
                      {product.compare_at_price && (
                        <div className="text-[10px] text-gray-500 line-through">
                          ₹{product.compare_at_price}
                        </div>
                      )}
                    </td>

                    {/* Published Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        disabled={togglingId === product.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
                          product.is_published
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                        }`}
                      >
                        {product.is_published ? (
                          <>
                            <Check className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={togglingId === product.id}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.is_featured
                            ? "text-amber-400 hover:bg-amber-400/10"
                            : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                        }`}
                        title="Toggle Featured on Homepage"
                      >
                        <Star className={`w-4 h-4 ${product.is_featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                          title="Edit Preset Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Delete Preset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
