import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import StripePayment from "./StripePayment";
import { useClerk } from "@clerk/nextjs";

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, setCartItems, cartItems, getToken, user } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderId, setOrderId] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [backendAmount, setBackendAmount] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const {openSignIn} = useClerk();

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/address/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUserAddresses(data.addresses);
      } else {
        toast.error(data.message || "Unable to load your addresses. Please try again.");
      }
    } catch (error) {
      // toast.error("Unable to load your addresses. Please check your connection and try again.")
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (isPlacingOrder) {
      return; // Prevent multiple clicks
    }

    try {
      setIsPlacingOrder(true);

      if (!selectedAddress) {
        return toast.error("Please select a delivery address to continue");
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({ product: key, quantity: cartItems[key] }));
      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error("Your cart is empty. Please add some products before placing an order.");
      }

      const token = await getToken();
      const { data } = await axios.post(
        "/api/order/create",
        {
          address: selectedAddress._id,
          items: cartItemsArray,
          paymentMethod: paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setOrderId(data.orderId);
        setShowPaymentOptions(true);

        if (paymentMethod === "stripe") {
          toast.success("Order created successfully! Please complete your payment.");
          const orderRes = await axios.get(`/api/order/get?orderId=${data.orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (orderRes.data.success) {
            setBackendAmount(orderRes.data.order.amount);
          } else {
            toast.error("Unable to load payment details. Please try again.");
          }
        } else {
          toast.success("COD order created successfully! Please confirm your order.");
        }
      } else {
        toast.error(data.message || "Unable to create order. Please try again.");
      }
    } catch (error) {
      toast.error("Unable to place order. Please check your connection and try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCartItems({});
    setShowPaymentOptions(false);
    setOrderId(null);
    setBackendAmount(null);
    router.push("/order-placed");
  };

  const handlePaymentError = () => {
    setShowPaymentOptions(false);
    setOrderId(null);
    setBackendAmount(null);
  };

  useEffect(() => {
    fetchUserAddresses();
  }, []);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">Order Summary</h2>
      <hr className="border-gray-500/30 my-5" />

      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">Select Address</label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.streetAddress}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Rs.10</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (8%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {(getCartAmount() * 0.08).toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {(getCartAmount() + 10 + getCartAmount() * 0.08).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {!showPaymentOptions ? (
        user ? (
          <div className="space-y-3 mt-5">
            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-orange-600 text-white py-3 hover:bg-orange-700"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={createOrder}
              disabled={isPlacingOrder}
              className="w-full bg-gray-600 text-white py-3 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? "Creating Order..." : "Place Order (COD)"}
            </button>
          </div>
        ) : <div className="space-y-3 mt-5">
          <button onClick={openSignIn} className="w-full bg-orange-600 text-white py-3 hover:bg-orange-700" >Login to continue checkout</button></div>
      ) : (
        <div className="space-y-3 mt-5">
          {paymentMethod === "cod" ? (
            <button
              onClick={() => {
                setCartItems({});
                setShowPaymentOptions(false);
                setOrderId(null);
                router.push("/order-placed");
              }}
              className="w-full bg-orange-600 text-white py-3 hover:bg-orange-700"
            >
              Confirm COD Order
            </button>
          ) : backendAmount ? (
            <StripePayment
              orderId={orderId}
              amount={backendAmount}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          )}
          <button
            onClick={() => setShowPaymentOptions(false)}
            className="w-full bg-gray-300 text-gray-700 py-2 hover:bg-gray-400"
          >
            Back to Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
