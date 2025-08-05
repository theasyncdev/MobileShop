"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Receipt from "@/components/Receipt";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAdminRedirect } from "@/lib/useAdminRedirect";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ orderData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: orderData.totalAmount * 100, // Convert to cents
          currency: "usd",
        }),
      });

      const { clientSecret, error: intentError } = await response.json();

      if (intentError) {
        setError(intentError);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: orderData.customerName,
              email: orderData.customerEmail,
            },
          },
        }
      );

      if (paymentError) {
        setError(paymentError.message);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Processing Payment..." : `Pay ${orderData.currency}${orderData.totalAmount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const Checkout = () => {
  useAdminRedirect(); // This will redirect admin users to dashboard
  
  const { cartItems, products, currency, user } = useAppContext();
  const router = useRouter();
  
  const [orderData, setOrderData] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successfulReceipt, setSuccessfulReceipt] = useState(null);

  // Calculate order summary
  const calculateOrderSummary = () => {
    const items = Object.keys(cartItems).map(itemId => {
      const product = products.find(p => p._id === itemId);
      return {
        product,
        quantity: cartItems[itemId],
        subtotal: product ? (product.offerPrice || product.price) * cartItems[itemId] : 0,
        isOutOfStock: product ? product.stock <= 0 : false,
        isInsufficientStock: product ? cartItems[itemId] > product.stock : false,
        availableStock: product ? product.stock : 0
      };
    }).filter(item => item.product && item.quantity > 0);

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = 10; // Fixed shipping cost
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return { items, subtotal, shipping, tax, total };
  };

  // Check if any items have stock issues
  const hasStockIssues = () => {
    const orderSummary = calculateOrderSummary();
    return orderSummary.items.some(item => item.isOutOfStock || item.isInsufficientStock);
  };

  // Get stock issues for display
  const getStockIssues = () => {
    const orderSummary = calculateOrderSummary();
    return orderSummary.items.filter(item => item.isOutOfStock || item.isInsufficientStock);
  };

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/address/get");
      const data = await response.json();
      
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // Create order after payment success
  const createOrder = async (paymentIntentId) => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderSummary = calculateOrderSummary();
      
      const response = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderSummary.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity
          })),
          address: selectedAddress._id,
          amount: orderSummary.total,
          paymentMethod: "stripe",
          paymentIntentId: paymentIntentId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.orderId;
      } else {
        toast.error(data.message || "Failed to create order");
        return null;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Create order after successful payment
      const orderId = await createOrder(paymentIntent.id);
      
      if (orderId) {
        setPaymentSuccess(true);
        toast.success("Payment successful! Your order has been placed.");
        
        // Generate receipt for the successful order
        try {
          const receiptResponse = await fetch("/api/receipt/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          });

          const receiptData = await receiptResponse.json();
          
          if (receiptData.success) {
            setSuccessfulReceipt(receiptData.receipt);
            toast.success("Receipt generated successfully!");
          }
        } catch (receiptError) {
          console.error("Error generating receipt:", receiptError);
          // Don't show error to user as order was successful
        }
        
        // Clear cart and redirect after a delay
        setTimeout(() => {
          router.push("/my-orders");
        }, 5000); // Increased delay to allow receipt viewing
      } else {
        toast.error("Payment successful but order creation failed. Please contact support.");
      }
    } catch (error) {
      console.error("Error creating order after payment:", error);
      toast.error("Payment successful but order creation failed. Please contact support.");
    }
  };

  useEffect(() => {
    if (Object.keys(cartItems).length === 0) {
      router.push("/cart");
      return;
    }

    fetchAddresses();
    setIsLoading(false);
  }, [cartItems, router]);

  useEffect(() => {
    if (selectedAddress && !orderData) {
      // Prepare order data for payment
      const orderSummary = calculateOrderSummary();
      setOrderData({
        items: orderSummary.items,
        subtotal: orderSummary.subtotal,
        shipping: orderSummary.shipping,
        tax: orderSummary.tax,
        totalAmount: orderSummary.total,
        currency,
        customerName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Customer',
        customerEmail: user?.emailAddresses?.[0]?.emailAddress || 'customer@example.com'
      });
    }
  }, [selectedAddress]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  if (paymentSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mt-4 text-gray-800">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
            {successfulReceipt && (
              <div className="mt-4">
                <button
                  onClick={() => setSuccessfulReceipt(successfulReceipt)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Receipt
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-3">Redirecting to your orders in 5 seconds...</p>
          </div>
        </div>
        
        {/* Receipt Modal */}
        {successfulReceipt && (
          <Receipt 
            receipt={successfulReceipt} 
            onClose={() => setSuccessfulReceipt(null)} 
          />
        )}
      </>
    );
  }

  const orderSummary = calculateOrderSummary();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Summary */}
            <div className="space-y-6">
              {/* Stock Issues Warning */}
              {hasStockIssues() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-red-800 font-medium">Stock Issues Detected</span>
                  </div>
                  <div className="space-y-2">
                    {getStockIssues().map((item, index) => (
                      <div key={index} className="text-red-700 text-sm">
                        <span className="font-medium">{item.product.name}:</span>
                        {item.isOutOfStock ? (
                          <span> Out of stock</span>
                        ) : (
                          <span> Only {item.availableStock} available (requested: {item.quantity})</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => router.push('/cart')}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Update Cart
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address, index) => (
                      <label key={index} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="address"
                          value={index}
                          checked={selectedAddress === address}
                          onChange={() => setSelectedAddress(address)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-gray-600 text-sm">{address.streetAddress}</p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No addresses found</p>
                    <button
                      onClick={() => router.push("/profile")}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {orderSummary.items.map((item, index) => (
                    <div key={index} className={`flex items-center space-x-4 ${item.isOutOfStock || item.isInsufficientStock ? 'bg-red-50 p-3 rounded-lg' : ''}`}>
                      <div className="flex-shrink-0">
                        <Image
                          src={item.product.images?.[0] || assets.upload_area}
                          alt={item.product.name}
                          width={60}
                          height={60}
                          className={`rounded-md object-cover ${item.isOutOfStock ? 'grayscale' : ''}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        {(item.isOutOfStock || item.isInsufficientStock) && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-xs text-red-600 font-medium">
                              {item.isOutOfStock ? 'Out of stock' : `Only ${item.availableStock} available`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{currency}{item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{currency}{orderSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{currency}{orderSummary.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{currency}{orderSummary.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{currency}{orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
{orderData && !hasStockIssues() && (
  <>
    {/* Stripe Test Card Info */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">Stripe Test Card Details</h4>
      <p className="text-sm text-blue-700">
        Use the following card number for test payments:
      </p>
      <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
        <li><span className="font-medium">Card Number:</span> 4242 4242 4242 4242</li>
        <li><span className="font-medium">Expiry Date:</span> Any future date (MM/YY)</li>
        <li><span className="font-medium">CVC:</span> Any 3 digits</li>
        <li><span className="font-medium">ZIP:</span> Any 5 digits</li>
      </ul>
    </div>

    <Elements stripe={stripePromise}>
      <CheckoutForm orderData={orderData} onSuccess={handlePaymentSuccess} />
    </Elements>
  </>
)}

              {/* Disabled Payment Form when stock issues exist */}
              {orderData && hasStockIssues() && (
                <div className="bg-white p-6 rounded-lg border">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Checkout Disabled</h3>
                    <p className="text-gray-600 mb-4">Please resolve stock issues before proceeding with checkout.</p>
                    <button
                      onClick={() => router.push('/cart')}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Update Cart
                    </button>
                  </div>
                </div>
              )}

              {isCreatingOrder && (
                <div className="bg-white p-6 rounded-lg border">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Creating your order...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout; 