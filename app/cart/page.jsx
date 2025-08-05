'use client'
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { useAdminRedirect } from "@/lib/useAdminRedirect";

const Cart = () => {
  useAdminRedirect(); // This will redirect admin users to dashboard

  const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount, currency, isUpdatingCart, isAddingToCart } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Details
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cartItems).map((itemId) => {
                  const product = products.find(product => product._id === itemId);

                  if (!product || cartItems[itemId] <= 0) return null;

                  const isOutOfStock = product.stock <= 0;
                  const isInsufficientStock = cartItems[itemId] > product.stock;
                  const isLowStock = product.stock <= 5 && product.stock > 0;

                  return (
                    <tr key={itemId} className={isOutOfStock ? 'bg-red-50' : ''}>
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div>
                          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2 relative">
                            <Image
                              src={product.images?.[0] || assets.upload_area}
                              alt={product.name}
                              className={`w-16 h-auto object-cover mix-blend-multiply ${isOutOfStock ? 'grayscale' : ''}`}
                              width={1280}
                              height={720}
                            />
                            {isOutOfStock && (
                              <div className="absolute top-0 left-0 bg-red-500 text-white px-1 py-0.5 text-xs rounded">
                                Out of Stock
                              </div>
                            )}
                          </div>
                          <button
                            className="md:hidden text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-sm hidden md:block">
                          <p className="text-gray-800">{product.name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => updateCartQuantity(product._id, 0)}
                          >
                            Remove
                          </button>
                          {/* Stock Status Messages */}
                          {isOutOfStock && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-xs text-red-600 font-medium">Out of stock</span>
                            </div>
                          )}
                          {isInsufficientStock && !isOutOfStock && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-xs text-orange-600 font-medium">Only {product.stock} available</span>
                            </div>
                          )}
                          {isLowStock && !isOutOfStock && !isInsufficientStock && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-xs text-orange-600 font-medium">Low stock</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{product.offerPrice || product.price}</td>
                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button 
                            onClick={() => updateCartQuantity(product._id, cartItems[itemId] - 1)}
                            disabled={isUpdatingCart || isOutOfStock}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Image
                              src={assets.decrease_arrow}
                              alt="decrease_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                          <input 
                            onChange={e => {
                              const newQuantity = Number(e.target.value);
                              if (newQuantity <= product.stock) {
                                updateCartQuantity(product._id, newQuantity);
                              }
                            }} 
                            type="number" 
                            value={cartItems[itemId]} 
                            max={product.stock}
                            className="w-8 border text-center appearance-none"
                            disabled={isUpdatingCart || isOutOfStock}
                          />
                          <button 
                            onClick={() => {
                              if (cartItems[itemId] < product.stock) {
                                addToCart(product._id);
                              }
                            }}
                            disabled={isAddingToCart || isUpdatingCart || isOutOfStock || cartItems[itemId] >= product.stock}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Image
                              src={assets.increase_arrow}
                              alt="increase_arrow"
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                        {/* Stock limit warning */}
                        {isInsufficientStock && !isOutOfStock && (
                          <div className="text-xs text-orange-600 mt-1">
                            Max: {product.stock}
                          </div>
                        )}
                      </td>
                      <td className="py-4 md:px-4 px-1 text-gray-600">{currency}{((product.offerPrice || product.price) * cartItems[itemId]).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Cart Summary with Stock Warnings */}
          {Object.keys(cartItems).some(itemId => {
            const product = products.find(p => p._id === itemId);
            return product && (product.stock <= 0 || cartItems[itemId] > product.stock);
          }) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 font-medium">Stock Issues Detected</span>
              </div>
              <p className="text-red-700 text-sm">
                Some items in your cart are out of stock or have insufficient quantity. Please review and update your cart before proceeding to checkout.
              </p>
            </div>
          )}
          
          <button onClick={()=> router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600">
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Continue Shopping
          </button>
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
