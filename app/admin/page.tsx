"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, Users, Package, LineChart } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0
  });

  useEffect(() => {
    async function loadStats() {
      // In a real app, these would be aggregations from Supabase RPC or complex queries
      // For now, we'll fetch raw counts for simplicity
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: customerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      // Calculate revenue (mocked sum for now, should be server-side aggregation)
      const { data: orders } = await supabase.from('orders').select('total_amount').eq('status', 'paid');
      const totalRevenue = orders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

      setStats({
        revenue: totalRevenue,
        orders: orderCount || 0,
        customers: customerCount || 0,
        products: productCount || 0
      });
    }
    loadStats();
  }, []);

  const kpis = [
    {
      title: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      trend: "+18.4%",
      isPositive: true,
      icon: IndianRupee
    },
    {
      title: "Total Orders",
      value: stats.orders.toString(),
      trend: "+12.2%",
      isPositive: true,
      icon: ShoppingCart
    },
    {
      title: "Total Customers",
      value: stats.customers.toString(),
      trend: "+9.8%",
      isPositive: true,
      icon: Users
    },
    {
      title: "Active Products",
      value: stats.products.toString(),
      trend: "0%",
      isPositive: true,
      icon: Package
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-serif text-white mb-2">Welcome back, Admin.</h2>
        <p className="text-gray-400">Here is what is happening with your store today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-300" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {kpi.trend}
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">{kpi.title}</h3>
              <p className="text-3xl font-medium text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder for Charts / Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-2xl p-6 min-h-[400px]">
          <h3 className="text-lg font-medium text-white mb-6">Revenue Overview</h3>
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl py-20">
            <LineChart className="w-8 h-8 mb-4 opacity-50" />
            <p>Chart component goes here</p>
            <p className="text-sm">(Recharts or Chart.js integration)</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Recent Orders</h3>
          <div className="flex flex-col gap-4">
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl py-20">
              <ShoppingCart className="w-8 h-8 mb-4 opacity-50" />
              <p>No recent orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
