"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  FileImage, 
  FileArchive, 
  Check, 
  Sparkles,
  Tag,
  DollarSign,
  Video,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useUI } from "../../../components/UIFeedback";

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [category, setCategory] = useState("Cinematic");
  const [tags, setTags] = useState("Lightroom, Cinematic, Mobile, Desktop");
  const [format, setFormat] = useState(".XMP & .DNG Files");
  const [presetCount, setPresetCount] = useState("12");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  
  // File State
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [presetFile, setPresetFile] = useState<File | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!afterImage || !presetFile) {
      showToast("Please upload an After image and the preset ZIP file.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Images to Public Bucket
      let beforeUrl = null;
      if (beforeImage) {
        const beforeUpload = await uploadFileToServer(beforeImage, "product-previews", "before");
        beforeUrl = beforeUpload.url;
      }
      
      const afterUpload = await uploadFileToServer(afterImage, "product-previews", "after");
      const afterUrl = afterUpload.url;

      // 2. Upload Preset File to PRIVATE Bucket
      const fileUpload = await uploadFileToServer(presetFile, "product-files", "presets");
      const filePath = fileUpload.path;

      // 3. Save Product to Supabase Database
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          preview_video_url: previewVideoUrl.trim() || null,
          file_url: filePath,
          is_published: isPublished,
          is_featured: isFeatured,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to create preset product");
      }

      showToast("Preset collection created and published successfully!", "success");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Product upload error:", error);
      showToast(error.message || "Failed to create preset product", "error");
    } finally {
      setLoading(false);
    }
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
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-white">Add New Preset Collection</h1>
          <p className="text-xs text-gray-400 mt-1">
            Fill in the details, upload comparison previews, and store the private preset files.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Info */}
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
                placeholder="e.g. Moody Cyberpunk Tokyo"
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
                  placeholder=".XMP & .DNG Files"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                Short Description (Catalog & Card preview) <span className="text-emerald-400">*</span>
              </label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the mood, colors, and ideal lighting for this preset pack..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                Full Description (Product detail page)
              </label>
              <textarea 
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="In-depth breakdown of color grading, skin tone preservation, and technical workflow..."
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
                  placeholder="499"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-300 mb-2">
                  Compare Price (Optional Discount)
                </label>
                <input 
                  type="number" 
                  step="1"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="999"
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
                  placeholder="12"
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
                placeholder="Lightroom, Cinematic, Moody, Night, Urban"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Media & Files Section */}
          <div className="space-y-6">
            <h3 className="text-base font-serif text-white">Media Previews & Private Preset File</h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Before Image */}
              <div className="bg-[#050505] border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors relative min-h-[180px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setBeforeImage(e.target.files?.[0] || null)} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <FileImage className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-xs font-semibold text-white">RAW Before Image (Optional)</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {beforeImage ? beforeImage.name : "Used for comparison slider"}
                </p>
              </div>

              {/* After Image */}
              <div className="bg-[#050505] border border-dashed border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/60 transition-colors relative min-h-[180px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  required 
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAfterImage(f);
                    if (f) setAfterImagePreview(URL.createObjectURL(f));
                  }} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <FileImage className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-white">Edited After Image (Required)</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {afterImage ? afterImage.name : "Showcases the preset's final look"}
                </p>
              </div>
            </div>

            {/* Private Preset File (.ZIP) */}
            <div className="bg-[#050505] border border-dashed border-blue-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/70 transition-colors relative min-h-[160px]">
              <input 
                type="file" 
                accept=".zip,.xmp,.dng,.cube" 
                required 
                onChange={(e) => setPresetFile(e.target.files?.[0] || null)} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <FileArchive className="w-9 h-9 text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-white">Upload Preset Package (.ZIP / .XMP / .DNG)</p>
              <p className="text-xs text-gray-400 mt-1">
                {presetFile ? presetFile.name : "Stored securely in private bucket 'product-files' (Never publicly visible)"}
              </p>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Publishing Options */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
              />
              <span>Publish in Store Immediately</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0"
              />
              <span>Feature on Homepage Hero/Catalog</span>
            </label>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black font-semibold text-base rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Uploading & Securing Preset...</span>
              </div>
            ) : (
              <span>Publish Preset Collection</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
