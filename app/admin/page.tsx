"use client";

import { useState, useEffect } from "react";
import { Upload, Camera, Store, Plus } from "lucide-react";
import Link from "next/link";
import { addPreset, Preset } from "../lib/store";

export default function AdminDashboard() {
  const [newPreset, setNewPreset] = useState({ name: '', description: '', price: 1, beforeImg: '', afterImg: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreset.name || !newPreset.description || !newPreset.beforeImg || !newPreset.afterImg) {
      alert("Please fill all fields");
      return;
    }
    
    const success = await addPreset(newPreset);
    
    if (success) {
      setNewPreset({ name: '', description: '', price: 1, beforeImg: '', afterImg: '' });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } else {
      alert("Failed to upload preset. Check console.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Luma<span className="text-white/50">Admin</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-all hover:bg-white/5"
            >
              <Store className="w-4 h-4" /> View Store
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-4">Upload New Preset</h2>
          <p className="text-gray-400">Add a new preset to your store. This is your admin dashboard, hidden from public view.</p>
        </div>

        {isSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
            Preset uploaded successfully! You can see it in the store now.
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Preset Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="e.g. Moody Cinematic"
              value={newPreset.name}
              onChange={e => setNewPreset({...newPreset, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea 
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all h-32 resize-none"
              placeholder="Describe the aesthetic and best use cases..."
              value={newPreset.description}
              onChange={e => setNewPreset({...newPreset, description: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Price (INR)</label>
            <input 
              required
              type="number" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              placeholder="1"
              value={newPreset.price}
              onChange={e => setNewPreset({...newPreset, price: Number(e.target.value)})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Before Image URL</label>
              <input 
                required
                type="url" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                placeholder="https://..."
                value={newPreset.beforeImg}
                onChange={e => setNewPreset({...newPreset, beforeImg: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">After Image URL</label>
              <input 
                required
                type="url" 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                placeholder="https://..."
                value={newPreset.afterImg}
                onChange={e => setNewPreset({...newPreset, afterImg: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white h-14 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <Upload className="w-5 h-5" /> Publish Preset to Store
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
