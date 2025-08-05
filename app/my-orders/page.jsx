'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Receipt from "@/components/Receipt";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const MyOrders = () => {

    const { currency } = useAppContext();
    const { getToken } = useAuth();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [loadingReceipt, setLoadingReceipt] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/order/get", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setOrders(data.orders);
                setFilteredOrders(data.orders);
            } else {
                toast.error(data.message || "Failed to load orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }

    // Filter and sort orders
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

        // Sort orders
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
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        try {
            setCancellingOrder(orderId);
            setShowCancelConfirm(null);
            const token = await getToken();
            
            const { data } = await axios.put("/api/order/cancel", 
                { orderId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success("Order cancelled successfully");
                // Refresh orders to get updated status
                await fetchOrders();
            } else {
                toast.error(data.message || "Failed to cancel order");
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order");
        } finally {
            setCancellingOrder(null);
        }
    };

    const confirmCancelOrder = (orderId) => {
        setShowCancelConfirm(orderId);
    };

    const canCancelOrder = (order) => {
        return ["order placed", "processing"].includes(order.status);
    };

    const handleViewReceipt = async (orderId) => {
        try {
            setLoadingReceipt(orderId);
            const token = await getToken();
            
            // First try to get existing receipt
            try {
                const { data } = await axios.get(`/api/receipt/get?orderId=${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success && data.receipt) {
                    setSelectedReceipt(data.receipt);
                    return;
                }
            } catch (getError) {
                // If receipt doesn't exist (404), continue to create one
                console.log("No existing receipt found, creating new one...");
            }

            // If no receipt exists, create one
            // For COD orders, use the COD-specific endpoint
            const order = orders.find(o => o._id === orderId);
            const endpoint = order?.paymentMethod === 'cod' ? '/api/receipt/generate-cod' : '/api/receipt/create';
            
            console.log(`Creating receipt using endpoint: ${endpoint}`);
            
            const createResponse = await axios.post(endpoint, 
                { orderId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (createResponse.data.success) {
                setSelectedReceipt(createResponse.data.receipt);
                toast.success("Receipt generated successfully");
            } else {
                toast.error(createResponse.data.message || "Failed to generate receipt");
            }
        } catch (error) {
            console.error("Error handling receipt:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
                console.error("Error status:", error.response.status);
            }
            toast.error("Failed to load receipt");
        } finally {
            setLoadingReceipt(null);
        }
    };

    const canViewReceipt = (order) => {
        // For Stripe payments: processing, shipped, delivered with completed payment
        if (order.paymentMethod === 'stripe') {
            return ["processing", "shipped", "delivered"].includes(order.status) && 
                   order.paymentStatus === "completed";
        }
        // For COD payments: any order that's not cancelled
        if (order.paymentMethod === 'cod') {
            return order.status !== "cancelled";
        }
        return false;
    };

        return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                        <p className="text-gray-600">Track your orders and manage your purchases</p>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Order Cancellation:</strong> You can only cancel orders that are in "Order Placed" or "Processing" status. 
                                    Once an order is shipped or delivered, it cannot be cancelled.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    {!loading && orders.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="order placed">Order Placed</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* Payment Method Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                    <select
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="cod">Cash on Delivery</option>
                                        <option value="stripe">Card Payment</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="date">Date</option>
                                        <option value="amount">Amount</option>
                                        <option value="items">Items Count</option>
                                    </select>
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="desc">Newest First</option>
                                        <option value="asc">Oldest First</option>
                                    </select>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loading />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="mx-auto h-12 w-12 text-gray-400">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match the selected filters."}
                                    </p>
                                </div>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <div key={order._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        {/* Order Header */}
                                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <Image
                                                            className="h-10 w-10 object-cover rounded-lg"
                                                            src={assets.box_icon}
                                                            alt="Order"
                                                        />
                                                    </div>
                                                    <div>
                                                                                                                 <h3 className="text-lg font-medium text-gray-900">
                                                             Order #{order._id?.slice(-8) || 'Unknown'}
                                                         </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 sm:mt-0 flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Total Amount</p>
                                                        <p className="text-lg font-bold text-gray-900">{currency}{order.amount}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                        {order.paymentStatus && (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                                                order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {order.paymentStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="px-6 py-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                {/* Products */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Products</h4>
                                                    <div className="space-y-2">
                                                        {order.items.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-600">
                                                                    {item.product?.name || 'Unknown Product'} × {item.quantity}
                                                                </span>
                                                                <span className="font-medium text-gray-900">
                                                                    {currency}{order.amount}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <p className="text-sm text-gray-500">
                                                            Total Items: <span className="font-medium">{order.items.length}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                                                                 {/* Shipping Address */}
                                                 <div>
                                                     <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h4>
                                                     <div className="text-sm text-gray-600 space-y-1">
                                                         <p className="font-medium text-gray-900">
                                                             {order.address?.fullName || 'Address not available'}
                                                         </p>
                                                         <p>
                                                             {order.address?.streetAddress || 'Street address not available'}
                                                         </p>
                                                         <p>
                                                             {order.address?.city && order.address?.state ? 
                                                                 `${order.address.city}, ${order.address.state}` : 
                                                                 (order.address?.city || order.address?.state ? 
                                                                     `${order.address.city || ''} ${order.address.state || ''}`.trim() : 
                                                                     'City/State not available')
                                                             }
                                                         </p>
                                                         <p>
                                                             {order.address?.postalCode || 'Postal code not available'}
                                                         </p>
                                                         <p>
                                                             {order.address?.phoneNumber || 'Phone number not available'}
                                                         </p>
                                                     </div>
                                                 </div>

                                                {/* Payment & Actions */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Payment & Actions</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Payment Method:</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {order.paymentMethod?.toUpperCase() || 'COD'}
                                                            </span>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="space-y-2">
                                                            {/* Cancel Order Button */}
                                                            {canCancelOrder(order) && (
                                                                <div>
                                                                    {showCancelConfirm === order._id ? (
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                onClick={() => handleCancelOrder(order._id)}
                                                                                disabled={cancellingOrder === order._id}
                                                                                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                            >
                                                                                {cancellingOrder === order._id ? 'Cancelling...' : 'Confirm'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setShowCancelConfirm(null)}
                                                                                disabled={cancellingOrder === order._id}
                                                                                className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => confirmCancelOrder(order._id)}
                                                                            disabled={cancellingOrder === order._id}
                                                                            className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                        >
                                                                            Cancel Order
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* View Receipt Button */}
                                                            {canViewReceipt(order) && (
                                                                <button
                                                                    onClick={() => handleViewReceipt(order._id)}
                                                                    disabled={loadingReceipt === order._id}
                                                                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                >
                                                                    {loadingReceipt === order._id ? 'Loading...' : 'View Receipt'}
                                                                </button>
                                                            )}

                                                            {/* Cancellation Notice */}
                                                            {order.status === 'cancelled' && (
                                                                <div className="text-center">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Order Cancelled
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Receipt Modal */}
            {selectedReceipt && (
                <Receipt 
                    receipt={selectedReceipt} 
                    onClose={() => setSelectedReceipt(null)} 
                />
            )}
            
            <Footer />
        </>
    );
};

export default MyOrders;