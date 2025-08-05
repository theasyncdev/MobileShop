'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import SellerNavbar from "@/components/SellerNavbar";

const statusOptions = [
    "order placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];

const Orders = () => {
    const { currency } = useAppContext();
    const { getToken } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchSellerOrders = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/order/get?all=true", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setOrders(data.orders);
                setFilteredOrders(data.orders);
            } else {
                toast.error(data.message || "Failed to load orders");
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortOrders = () => {
        let filtered = [...orders];
        
        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        // Filter by payment method
        if (paymentMethodFilter !== 'all') {
            filtered = filtered.filter(order => order.paymentMethod === paymentMethodFilter);
        }
        
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'items':
                    aValue = a.items.length;
                    bValue = b.items.length;
                    break;
                default:
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        setFilteredOrders(filtered);
    };

    useEffect(() => {
        filterAndSortOrders();
    }, [orders, statusFilter, paymentMethodFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchSellerOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = await getToken();
            const { data } = await axios.patch(`/api/order/status`, 
                { orderId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success("Order status updated");
                fetchSellerOrders();
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SellerNavbar />
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Orders</h2>
                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                                                         <div className="flex items-center gap-2">
                                 <label className="text-sm font-medium text-gray-700">Status:</label>
                                 <select
                                     value={statusFilter}
                                     onChange={e => setStatusFilter(e.target.value)}
                                     className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 >
                                     <option value="all">All Orders</option>
                                     {statusOptions.map(opt => (
                                         <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                     ))}
                                 </select>
                             </div>
                             <div className="flex items-center gap-2">
                                 <label className="text-sm font-medium text-gray-700">Payment:</label>
                                 <select
                                     value={paymentMethodFilter}
                                     onChange={e => setPaymentMethodFilter(e.target.value)}
                                     className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 >
                                     <option value="all">All Methods</option>
                                     <option value="cod">Cash on Delivery</option>
                                     <option value="stripe">Card Payment</option>
                                 </select>
                             </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date">Date</option>
                                    <option value="amount">Amount</option>
                                    <option value="items">Items Count</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Order:</label>
                                <select
                                    value={sortOrder}
                                    onChange={e => setSortOrder(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            {filteredOrders.length} of {orders.length} orders
                        </div>
                    </div>
                </div>
                <div className="max-w-4xl rounded-md">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">{orders.length === 0 ? "No orders found" : "No orders match the selected filters"}</p>
                        </div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <div key={order._id || index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                                <div className="flex-1 flex gap-5 max-w-80">
                                    <Image
                                        className="max-w-16 max-h-16 object-cover"
                                        src={assets.box_icon}
                                        alt="box_icon"
                                    />
                                    <p className="flex flex-col gap-3">
                                        <span className="font-medium">
                                            {order.items.map((item) => item.product?.name ? `${item.product.name} x ${item.quantity}` : `Product x ${item.quantity}`).join(", ")}
                                        </span>
                                        <span>Items : {order.items.length}</span>
                                    </p>
                                </div>
                                <div>
                                    <p>
                                        <span className="font-medium">{order.address?.fullName || 'N/A'}</span>
                                        <br />
                                        <span>{order.address?.area || 'N/A'}</span>
                                        <br />
                                        <span>{order.address?.city && order.address?.state ? `${order.address.city}, ${order.address.state}` : 'N/A'}</span>
                                        <br />
                                        <span>{order.address?.phoneNumber || 'N/A'}</span>
                                    </p>
                                </div>
                                <p className="font-medium my-auto">{currency}{order.amount}</p>
                                                                                                                 <div>
                                                                                           <p className="flex flex-col">
                                                  <span>Method : {order.paymentMethod?.toUpperCase() || 'COD'}</span>
                                                  <span>Date : {new Date(order.date).toLocaleDateString()}</span>
                                                  <span className="flex items-center gap-2">
                                                      Status : 
                                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                          'bg-gray-100 text-gray-800'
                                                      }`}>
                                                          {order.status}
                                                      </span>
                                                      <select
                                                          value={order.status}
                                                          onChange={e => handleStatusChange(order._id, e.target.value)}
                                                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                                                          className={`ml-2 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none ${
                                                              order.status === 'delivered' || order.status === 'cancelled' 
                                                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                                  : ''
                                                          }`}
                                                      >
                                                          {statusOptions.map(opt => (
                                                              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                                          ))}
                                                      </select>
                                                  </span>
                                                  {order.paymentStatus && (
                                                      <span className="flex items-center gap-2">
                                                          Payment : 
                                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                              order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                                              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                              'bg-yellow-100 text-yellow-800'
                                                          }`}>
                                                              {order.paymentStatus}
                                                          </span>
                                                      </span>
                                                  )}
                                              </p>
                                         </div>
                            </div>
                        ))
                    )}
                </div>
            </div>}
            <Footer />
        </div>
    );
};

export default Orders;