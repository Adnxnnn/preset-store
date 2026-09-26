"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileImage, FileArchive } from "lucide-react";
import Link from "next/link";

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  
  // File State
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [presetFile, setPresetFile] = useState<File | null>(null);

  async function uploadFile(file: File, bucket: string, folder: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
      
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { path: data.path, publicUrl };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!afterImage || !presetFile) {
      alert("Please provide at least an After Image and the Preset File.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Images to Public Bucket
      let beforeUrl = "";
      let afterUrl = "";
      
      if (beforeImage) {
        const res = await uploadFile(beforeImage, 'product-previews', 'before');
        beforeUrl = res.publicUrl;
      }
      
      const afterRes = await uploadFile(afterImage, 'product-previews', 'after');
      afterUrl = afterRes.publicUrl;

      // 2. Upload Preset File to Private Bucket
      const fileRes = await uploadFile(presetFile, 'product-files', 'presets');

      // 3. Save Product to Database
      const { error } = await supabase.from('products').insert([
        {
          title,
          description,
          price: parseFloat(price),
          compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
          before_image_url: beforeUrl || null,
          after_image_url: afterUrl,
          file_url: fileRes.path,
          is_published: true
        }
      ]);

      if (error) throw error;

      router.push('/admin/products');
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
        <h1 className="text-2xl font-serif text-white mb-8">Add New Preset</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preset Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-white/30"
                placeholder="e.g. Moody Cinema LUT"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 resize-none"
                placeholder="Describe your preset..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-white/30"
                  placeholder="29.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Compare at Price (Optional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-white/30"
                  placeholder="49.00"
                />
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Media & Files</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before Image */}
              <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-colors relative h-48">
                <input type="file" accept="image/*" onChange={(e) => setBeforeImage(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <FileImage className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-sm font-medium text-white">Before Image (Optional)</p>
                <p className="text-xs text-gray-500 mt-1">{beforeImage ? beforeImage.name : "Used for comparison slider"}</p>
              </div>

              {/* After Image */}
              <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 transition-colors relative h-48">
                <input type="file" accept="image/*" required onChange={(e) => setAfterImage(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <FileImage className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-sm font-medium text-white">After Image (Required)</p>
                <p className="text-xs text-gray-500 mt-1">{afterImage ? afterImage.name : "The final edited look"}</p>
              </div>
            </div>

            {/* Preset File */}
            <div className="bg-[#050505] border border-dashed border-blue-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/60 transition-colors relative">
              <input type="file" accept=".zip,.xmp,.dng,.cube" required onChange={(e) => setPresetFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <FileArchive className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-sm font-medium text-white">Upload Preset File (Required)</p>
              <p className="text-xs text-gray-500 mt-1">{presetFile ? presetFile.name : "ZIP, XMP, DNG, or CUBE format (Hidden from public)"}</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black font-medium text-lg rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Uploading to Cloud..." : "Publish Preset"}
          </button>
        </form>
      </div>
    </div>
  );
}
