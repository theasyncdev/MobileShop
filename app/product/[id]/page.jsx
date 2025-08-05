"use client";
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { useAdminRedirect } from "@/lib/useAdminRedirect";

// Import getSimilarProducts function from lib
import { getSimilarProducts } from "@/lib/getSimilarProducts";

const Product = () => {
  useAdminRedirect(); // This will redirect admin users to dashboard
  
  const { id } = useParams();
  const { products, router, addToCart, currency, isAddingToCart } = useAppContext();

  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  const fetchProductData = async () => {
    const product = products.find((product) => product._id === id);
    console.log(product)
    if (product) {
      const flatImages = product.images.flat();
      const productWithFlatImages = { ...product, images: flatImages };
      setProductData(productWithFlatImages);
      setMainImage(flatImages[0]);

      // Use imported function here
      const similar = getSimilarProducts(productWithFlatImages, products);
      setSimilarProducts(similar);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id, products.length]);

  // Stock validation
  const isOutOfStock = productData?.stock <= 0;
  const isLowStock = productData?.stock > 0 && productData?.stock <= 5;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(productData._id);
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(productData._id);
      router.push("/cart");
    }
  };

  return productData ? (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 relative">
              <Image
                src={mainImage || assets.upload_area}
                alt="Product image"
                className={`w-full h-auto object-cover mix-blend-multiply ${isOutOfStock ? 'grayscale' : ''}`}
                width={1280}
                height={720}
              />
              
              {/* Stock Status Badge */}
              {isOutOfStock && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium z-10">
                  Out of Stock
                </div>
              )}
              
              {isLowStock && !isOutOfStock && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium z-10">
                  Only {productData.stock} left
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {productData.images?.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={image || assets.upload_area}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-auto object-cover mix-blend-multiply ${isOutOfStock ? 'grayscale' : ''}`}
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {productData.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <Image key={i} className="h-4 w-4" src={assets.star_icon} alt="star" />
                ))}
                <Image className="h-4 w-4" src={assets.star_dull_icon} alt="star_dull" />
              </div>
              <p>(4.5)</p>
            </div>
            <p className="text-gray-600 mt-3">{productData.description}</p>
            <p className="text-3xl font-medium mt-6">
              {currency}{productData.offerPrice || productData.price}
              {productData.offerPrice && (
                <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                  {currency}{productData.price}
                </span>
              )}
            </p>
            
            {/* Stock Information */}
            <div className="mt-4">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">Currently out of stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">Only {productData.stock} items left</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">In stock ({productData.stock} available)</span>
                </div>
              )}
            </div>
            
            <hr className="bg-gray-600 my-6" />

            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50">{productData.brand || "Generic"}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50">Multi</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Stock</td>
                    <td className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                      {isOutOfStock ? 'Out of Stock' : `${productData.stock} units`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
                className={`w-full py-3.5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isOutOfStock 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-800/80 hover:bg-gray-200'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : isAddingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart || isOutOfStock}
                className={`w-full py-3.5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isOutOfStock 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : isAddingToCart ? "Adding..." : "Buy now"}
              </button>
            </div>
            
            {/* Stock Warning Message */}
            {isOutOfStock && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-800 font-medium">This item is currently out of stock</span>
                </div>
                <p className="text-red-700 text-sm mt-1">We'll notify you when it's back in stock.</p>
              </div>
            )}
          </div>
        </div>

        {/* Improved Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-4 mt-16">
              <p className="text-3xl font-medium">
                Recommended <span className="font-medium text-orange-600">for You</span>
              </p>
              <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
              <p className="text-gray-500 text-sm mt-2">
                Based on price, brand, and product name similarity
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
              {similarProducts.map((product, index) => (
                <ProductCard key={product._id || index} product={product} />
              ))}
            </div>
          </div>
        )}

       

        {/* Featured Products Section */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="font-medium text-orange-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products
              .filter((p) => p._id !== productData._id)
              .slice(0, 5)
              .map((product, index) => (
                <ProductCard key={product._id || index} product={product} />
              ))}
          </div>
          <button
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
            onClick={() => router.push('/all-products')}
          >
            See more
          </button>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Product;
