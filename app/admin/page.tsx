"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, Users, Package } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: customerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      const { data: orders } = await supabase.from('orders').select('total_amount, created_at, status, profiles(email)').order('created_at', { ascending: false });
      
      let totalRevenue = 0;
      const recent: any[] = [];
      const aggregated: Record<string, number> = {};

      if (orders) {
        orders.forEach(order => {
          if (order.status === 'paid') {
            totalRevenue += Number(order.total_amount) || 0;
            
            // Format for chart (e.g. "Sep 26")
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            aggregated[dateStr] = (aggregated[dateStr] || 0) + (Number(order.total_amount) || 0);
          }
          if (recent.length < 5) recent.push(order);
        });
      }

      // Convert aggregated data for Recharts
      const formattedChartData = Object.keys(aggregated).map(date => ({
        name: date,
        revenue: aggregated[date]
      })).reverse(); // Oldest to newest if we mapped it backwards

      // If empty, put dummy data for visuals
      if (formattedChartData.length === 0) {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          formattedChartData.push({
            name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: 0
          });
        }
      }

      setChartData(formattedChartData);
      setRecentOrders(recent);
      
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
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, trend: "+18.4%", isPositive: true, icon: IndianRupee },
    { title: "Total Orders", value: stats.orders.toString(), trend: "+12.2%", isPositive: true, icon: ShoppingCart },
    { title: "Total Customers", value: stats.customers.toString(), trend: "+9.8%", isPositive: true, icon: Users },
    { title: "Active Products", value: stats.products.toString(), trend: "0%", isPositive: true, icon: Package }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-serif text-white mb-2">Welcome back, Admin.</h2>
        <p className="text-gray-400">Here is what is happening with your store today.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Revenue Overview</h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Recent Orders</h3>
          <div className="flex flex-col gap-4">
            {recentOrders.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 py-20">
                <ShoppingCart className="w-8 h-8 mb-4 opacity-50" />
                <p>No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[150px]">
                      {order.profiles?.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">₹{order.total_amount}</p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      order.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
