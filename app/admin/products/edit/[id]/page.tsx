"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  FileImage, 
  FileArchive, 
  Check, 
  Save
} from "lucide-react";
import Link from "next/link";
import { useUI } from "../../../../components/UIFeedback";
import { INITIAL_PRESETS } from "../../../../lib/store";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useUI();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [category, setCategory] = useState("Cinematic");
  const [tags, setTags] = useState("");
  const [format, setFormat] = useState(".XMP & .DNG Files");
  const [presetCount, setPresetCount] = useState("12");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  
  // Existing & New media
  const [existingBeforeUrl, setExistingBeforeUrl] = useState<string | null>(null);
  const [existingAfterUrl, setExistingAfterUrl] = useState<string>("");
  const [existingFileUrl, setExistingFileUrl] = useState<string>("");
  const [newBeforeImage, setNewBeforeImage] = useState<File | null>(null);
  const [newAfterImage, setNewAfterImage] = useState<File | null>(null);
  const [newPresetFile, setNewPresetFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        const p = data || INITIAL_PRESETS.find((x) => x.id === id);

        if (p) {
          setTitle(p.title || "");
          setDescription(p.description || "");
          setFullDescription(p.full_description || p.description || "");
          setPrice(p.price ? String(p.price) : "");
          setComparePrice(p.compare_at_price ? String(p.compare_at_price) : "");
          setCategory(p.category || "Cinematic");
          setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
          setFormat(p.format || ".XMP & .DNG Files");
          setPresetCount(p.preset_count ? String(p.preset_count) : "12");
          setIsFeatured(!!p.is_featured);
          setIsPublished(p.is_published !== false);
          setExistingBeforeUrl(p.before_image_url || null);
          setExistingAfterUrl(p.after_image_url || "");
          setExistingFileUrl(p.file_url || "");
        } else {
          showToast("Preset collection not found.", "error");
          router.push("/admin/products");
        }
      } catch (err: any) {
        console.error("Error loading product for edit:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, router, showToast]);

  async function uploadFileToServer(file: File, bucket: string, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "File upload failed");
    }

    return data;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let beforeUrl = existingBeforeUrl;
      let afterUrl = existingAfterUrl;
      let fileUrl = existingFileUrl;

      // Handle replacement files if uploaded
      if (newBeforeImage) {
        const bRes = await uploadFileToServer(newBeforeImage, "product-previews", "before");
        beforeUrl = bRes.url;
      }

      if (newAfterImage) {
        const aRes = await uploadFileToServer(newAfterImage, "product-previews", "after");
        afterUrl = aRes.url;
      }

      if (newPresetFile) {
        const fRes = await uploadFileToServer(newPresetFile, "product-files", "presets");
        fileUrl = fRes.path;
      }

      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: title.trim(),
          description: description.trim(),
          full_description: fullDescription.trim() || description.trim(),
          price: parseFloat(price),
          compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
          category,
          tags: parsedTags,
          format,
          preset_count: parseInt(presetCount, 10) || 12,
          before_image_url: beforeUrl,
          after_image_url: afterUrl,
          file_url: fileUrl,
          is_published: isPublished,
          is_featured: isFeatured,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to update preset");
      }

      showToast("Preset collection updated successfully!", "success");
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(err.message || "Failed to update preset", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading preset information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Link 
        href="/admin/products" 
        className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-[#080808] border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1 block">
            Edit Collection
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-white">Edit Preset: {title}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                Preset Title <span className="text-emerald-400">*</span>
              </label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-[#0c0c0c] border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30 cursor-pointer"
                >
                  <option value="Cinematic">Cinematic</option>
                  <option value="Film & Vintage">Film & Vintage</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Landscape">Landscape</option>
                  <option value="Urban">Urban</option>
                  <option value="Bundle">Master Bundle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                  Format / File Types
                </label>
                <input 
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                Short Description <span className="text-emerald-400">*</span>
              </label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                Full Description
              </label>
              <textarea 
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                  Price (₹ INR) <span className="text-emerald-400">*</span>
                </label>
                <input 
                  type="number" 
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                  Compare Price (Optional)
                </label>
                <input 
                  type="number" 
                  step="1"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                  Preset Count
                </label>
                <input 
                  type="number" 
                  value={presetCount}
                  onChange={(e) => setPresetCount(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                Tags (Comma separated)
              </label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Replacement Media */}
          <div className="space-y-6">
            <h3 className="text-base font-serif text-white">Update Media & Preset Files</h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Before Image */}
              <div className="bg-[#050505] border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors relative min-h-[160px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setNewBeforeImage(e.target.files?.[0] || null)} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <FileImage className="w-7 h-7 text-gray-500 mb-2" />
                <p className="text-xs font-semibold text-white">Replace RAW Before Image</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {newBeforeImage ? newBeforeImage.name : existingBeforeUrl ? "Current image active (tap to replace)" : "No before image"}
                </p>
              </div>

              {/* After Image */}
              <div className="bg-[#050505] border border-dashed border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/60 transition-colors relative min-h-[160px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setNewAfterImage(e.target.files?.[0] || null)} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <FileImage className="w-7 h-7 text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-white">Replace Edited After Image</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {newAfterImage ? newAfterImage.name : "Current image active (tap to replace)"}
                </p>
              </div>
            </div>

            {/* Replace ZIP */}
            <div className="bg-[#050505] border border-dashed border-blue-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/70 transition-colors relative min-h-[140px]">
              <input 
                type="file" 
                accept=".zip,.xmp,.dng,.cube" 
                onChange={(e) => setNewPresetFile(e.target.files?.[0] || null)} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <FileArchive className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-white">Replace Preset Package (.ZIP / .XMP)</p>
              <p className="text-xs text-gray-400 mt-1">
                {newPresetFile ? newPresetFile.name : "Current preset file linked in private storage (tap to upload new version)"}
              </p>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Visibility Controls */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
              />
              <span>Published in Store Catalog</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            disabled={saving}
            className="w-full h-14 bg-white text-black font-semibold text-base rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preset Collection</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
