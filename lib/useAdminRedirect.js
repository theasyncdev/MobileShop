'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAdminRedirect = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.publicMetadata.role === "admin") {
      const currentPath = window.location.pathname;
      const userRoutes = ['/', '/cart', '/checkout', '/my-orders', '/order-placed', '/payment', '/product', '/profile', '/add-address', '/all-products'];
      const isOnUserRoute = userRoutes.some(route => currentPath.startsWith(route));
      
      if (isOnUserRoute) {
        //small delay to ensure authentication is complete
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

  return { user, router };
}; 