'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import toast from 'react-hot-toast';
import SellerNavbar from '@/components/SellerNavbar';
import SimpleChart from '@/components/SimpleChart';
import { useAppContext } from '@/context/AppContext';

const SellerDashboard = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { currency } = useAppContext();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    recentOrders: [],
    ordersByStatus: {},
    paymentMethods: {},
    revenueByPayment: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Only fetch data when authentication is loaded and user is signed in
    if (isLoaded && isSignedIn) {
      fetchDashboardData();
    }
  }, [timeRange, isLoaded, isSignedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Wait for authentication to be ready
      const token = await getToken();
      console.log('Dashboard: Got token, making API call...');
      
      const response = await axios.get(`/api/seller/dashboard?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        console.error('Dashboard API error response:', response.data);
        toast.error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return `${currency} 0.00`;
    return `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Show loading while authentication is being checked
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show message if not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Please sign in</h2>
          <p className="text-gray-600 mt-2">You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Admin Welcome Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-800">Admin Dashboard</h3>
                <p className="text-blue-700">You are viewing the admin dashboard. All user features are disabled for admin accounts.</p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your store performance</p>
          </div>

          {/* Time Range Filter */}
          <div className="mb-6">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

                     {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                   </svg>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Total Orders</p>
                   <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-3 rounded-full bg-green-100 text-green-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                   </svg>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Active Revenue</p>
                   <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                   <p className="text-xs text-gray-500">Excluding cancelled</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                   <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-3 rounded-full bg-red-100 text-red-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Cancelled Orders</p>
                   <p className="text-2xl font-semibold text-gray-900">{stats.cancelledOrders}</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                   </svg>
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">Total Products</p>
                   <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                 </div>
               </div>
             </div>
           </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <p className="text-gray-600">Total Revenue ({timeRange})</p>
                </div>
              </div>
            </div>

                         {/* Orders Chart */}
             <div className="bg-white rounded-lg shadow p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Completed</span>
                   <span className="font-semibold text-green-600">{stats.completedOrders}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Pending</span>
                   <span className="font-semibold text-yellow-600">{stats.pendingOrders}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-gray-600">Cancelled</span>
                   <span className="font-semibold text-red-600">{stats.cancelledOrders}</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2">
                   <div 
                     className="bg-green-600 h-2 rounded-full" 
                     style={{ 
                       width: `${stats.completionRate || 0}%` 
                     }}
                   ></div>
                 </div>
                 <p className="text-xs text-gray-500 text-center">
                   Completion Rate: {stats.completionRate ? stats.completionRate.toFixed(1) : '0.0'}% (excluding cancelled)
                 </p>
               </div>
             </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <SimpleChart 
              data={stats.ordersByStatus} 
              title="Orders by Status" 
              type="bar" 
            />
            <SimpleChart 
              data={stats.paymentMethods} 
              title="Payment Methods" 
              type="pie" 
            />
            <SimpleChart 
              data={stats.revenueByPayment} 
              title="Revenue by Payment" 
              type="line" 
            />
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Total Items: {stats.recentOrders.reduce((sum, order) => sum + (order.totalQuantity || 0), 0)}</span>
                  <span>•</span>
                  <span>Avg Order Value: {formatCurrency(stats.recentOrders.length > 0 ? stats.recentOrders.reduce((sum, order) => sum + order.amount, 0) / stats.recentOrders.length : 0)}</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center">
                             <div className="flex-shrink-0 h-8 w-8">
                               <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                 <span className="text-sm font-medium text-orange-600">
                                   {order.customerName?.charAt(0)?.toUpperCase() || 'U'}
                                 </span>
                               </div>
                             </div>
                             <div className="ml-3">
                               <div className="text-sm font-medium text-gray-900">
                                 {order.customerName || 'Unknown Customer'}
                               </div>
                               <div className="text-sm text-gray-500">
                                 {order.userEmail || order.userId}
                               </div>
                               {order.error && (
                                 <div className="text-xs text-red-500">
                                   Error: {order.error}
                                 </div>
                               )}
                             </div>
                           </div>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order.totalQuantity || 0} items
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by creating your first product.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 