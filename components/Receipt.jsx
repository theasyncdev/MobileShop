import React from 'react';
import { useAppContext } from '@/context/AppContext';

const Receipt = ({ receipt, onClose }) => {
    const { currency } = useAppContext();

    const formatCurrency = (amount) => {
        return `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!receipt) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
                            <p className="text-gray-600 mt-1">Thank you for your purchase!</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div className="p-6">
                    {/* Receipt Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt Details</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><span className="font-medium">Receipt #:</span> {receipt.receiptNumber}</p>
                                <p><span className="font-medium">Date:</span> {formatDate(receipt.receiptDate)}</p>
                                <p><span className="font-medium">Payment Method:</span> {receipt.paymentDetails.paymentMethod.toUpperCase()}</p>
                                <p><span className="font-medium">Status:</span> 
                                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                                        receipt.paymentDetails.paymentStatus === 'completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {receipt.paymentDetails.paymentStatus}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing Information</h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p className="font-medium">{receipt.billingInfo.customerName}</p>
                                <p>{receipt.billingInfo.customerEmail}</p>
                                <div className="mt-2">
                                    <p className="font-medium">Billing Address:</p>
                                    <p>{receipt.billingInfo.billingAddress.fullName}</p>
                                    <p>{receipt.billingInfo.billingAddress.streetAddress}</p>
                                    <p>{receipt.billingInfo.billingAddress.city}, {receipt.billingInfo.billingAddress.state} {receipt.billingInfo.billingAddress.postalCode}</p>
                                    <p>{receipt.billingInfo.billingAddress.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {receipt.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {item.productName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {formatCurrency(item.totalPrice)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(receipt.financialSummary.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping:</span>
                                <span className="font-medium">{formatCurrency(receipt.financialSummary.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax:</span>
                                <span className="font-medium">{formatCurrency(receipt.financialSummary.tax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(receipt.financialSummary.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    {receipt.paymentDetails.paymentIntentId && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Details</h4>
                            <div className="text-sm text-gray-600">
                                <p><span className="font-medium">Transaction ID:</span> {receipt.paymentDetails.paymentIntentId}</p>
                                <p><span className="font-medium">Payment Method:</span> {receipt.paymentDetails.paymentMethod.toUpperCase()}</p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Thank you for shopping with MobileShop!</p>
                        <p className="mt-1">For any questions, please contact our support team.</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Receipt; 