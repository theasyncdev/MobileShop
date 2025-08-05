'use client';
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const router = useRouter();
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";

  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);

  // Fetch products
  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/products/list");
      if (data.success) {
        setProducts(data.products);
        console.log(data.products)
      } else {
        toast.error(data.message || "Unable to load products. Please try again later.");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  // Fetch user + cart data
  const fetchUserData = async () => {
    try {
      if (!user) return;

      // Check if user is admin and redirect if needed
      if (user.publicMetadata.role === "admin") {
        setIsSeller(true);
        // Redirect admin users to admin dashboard if they're on user routes
        const currentPath = window.location.pathname;
        const userRoutes = ['/', '/cart', '/checkout', '/my-orders', '/order-placed', '/payment', '/product', '/profile', '/add-address', '/all-products'];
        const isOnUserRoute = userRoutes.some(route => currentPath.startsWith(route));
        
        if (isOnUserRoute) {
          router.push('/seller/dashboard');
          return;
        }
      } else {
        // Check if regular user is trying to access admin routes
        const currentPath = window.location.pathname;
        const adminRoutes = ['/seller', '/seller/dashboard', '/seller/orders', '/seller/product-list', '/seller/edit'];
        const isOnAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));
        
        if (isOnAdminRoute) {
          router.push('/');
          return;
        }
      }

      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user || {}); // Use real user data
        setCartItems(data.user.cartItems || {});
      } else {
        toast.error(data.message || "Unable to load your account information. Please refresh the page.");
      }
    } catch (err) {
      toast.error("Unable to load your account information. Please check your connection and try again.");
    }
  };

  // Add to cart
  const addToCart = async (itemId) => {
    if (!itemId) {
      toast.error("Product information is missing. Please try again.");
      return;
    }

    if (isAddingToCart) {
      return; // Prevent multiple clicks
    }

    setIsAddingToCart(true);

    try {
      let cartData = structuredClone(cartItems);
      if (cartData[itemId]) {
        cartData[itemId] += 1;
      } else {
        cartData[itemId] = 1;
      }

      setCartItems(cartData);

      if (user) {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartItems: cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Product successfully added to your cart!");
      } else {
        toast.success("Product added to cart! Sign in to save your cart.");
      }
    } catch (err) {
      toast.error("Unable to add product to cart. Please try again.");
      console.log(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Update cart quantity
  const updateCartQuantity = async (itemId, quantity) => {
    if (isUpdatingCart) {
      return; // Prevent multiple clicks
    }

    setIsUpdatingCart(true);

    try {
      let cartData = structuredClone(cartItems);

      if (quantity <= 0) {
        delete cartData[itemId];
      } else {
        cartData[itemId] = quantity;
      }

      setCartItems(cartData);

      if (user) {
        const token = await getToken();
        await axios.post(
          "/api/cart/update",
          { cartItems: cartData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Cart quantity updated successfully!");
      }
    } catch (err) {
      toast.error("Unable to update cart quantity. Please try again.");
      console.log(err);
    } finally {
      setIsUpdatingCart(false);
    }
  };

  // Get total cart count
  const getCartCount = () =>
    Object.values(cartItems).reduce((acc, qty) => acc + qty, 0);

  // Get total cart amount
  const getCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (product && cartItems[itemId] > 0) {
                        total += (product.offerPrice || product.price) * cartItems[itemId];
      }
    }
    return Math.floor(total * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  // Add route protection for admin users
  useEffect(() => {
    if (user && user.publicMetadata.role === "admin") {
      const currentPath = window.location.pathname;
      const userRoutes = ['/', '/cart', '/checkout', '/my-orders', '/order-placed', '/payment', '/product', '/profile', '/add-address', '/all-products'];
      const isOnUserRoute = userRoutes.some(route => currentPath.startsWith(route));
      
      if (isOnUserRoute) {
        // Add a small delay to ensure authentication is complete
        setTimeout(() => {
          router.push('/seller/dashboard');
        }, 100);
      }
    } else if (user && user.publicMetadata.role !== "admin") {
      const currentPath = window.location.pathname;
      const adminRoutes = ['/seller', '/seller/dashboard', '/seller/orders', '/seller/product-list', '/seller/edit'];
      const isOnAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));
      
      if (isOnAdminRoute) {
        router.push('/');
      }
    }
  }, [user, router]);

  const contextValue = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    isAddingToCart,
    isUpdatingCart,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
