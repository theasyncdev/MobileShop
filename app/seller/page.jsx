'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AddProduct = () => {

  const{getToken, currency} = useAppContext();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('Samsung');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least one image is uploaded
    const uploadedFiles = files.filter(file => file);
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData()
    formData.append('name',name);
    formData.append('description',description);
    formData.append('brand',brand);
    formData.append('price',price);
    formData.append('offerPrice',offerPrice);
    formData.append('stock',stock);

    for(let i = 0 ; i< files.length ; i++){
      if (files[i]) {
        formData.append('images',files[i]);
      }
    }

    try {
      const token = await getToken();
      const {data} = await axios.post('/api/products/add',formData,{headers:{Authorization:`Bearer ${token}`}});
      if(data.success){
        toast.success(data.message);
        setName('');
        setDescription('')
        setBrand('Samsung')
        setPrice('')
        setOfferPrice('')
        setStock('')
        setFiles([])
        router.push('/seller/product-list');
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Product creation error:", error);
      toast.error(error?.response?.data?.message || error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }

  };

  const handleImageChange = (index, file) => {
    const updatedFiles = [...files];
    updatedFiles[index] = file;
    setFiles(updatedFiles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/seller/product-list')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Products
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push('/seller/product-list')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-product-form"
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </div>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Product Information</h2>
                <p className="mt-1 text-sm text-gray-500">Fill in the details below to add a new product</p>
              </div>
              
              <form id="add-product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required
                  />
                </div>

                {/* Product Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    required
                  ></textarea>
                </div>

                {/* Brand, Price, and Offer Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      onChange={(e) => setBrand(e.target.value)}
                      value={brand}
                    >
                      <option value="Samsung">Samsung</option>
                      <option value="Huwaie">Huwaie</option>
                      <option value="Apple">Apple</option>
                      <option value="vivo">vivo</option>
                      <option value="onePlus">Oneplus</option>
                      <option value="Redmi">Redmi</option>
                      <option value="Poco">Poco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{currency}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Price (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">{currency}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onChange={(e) => setOfferPrice(e.target.value)}
                        value={offerPrice}
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    onChange={(e) => setStock(e.target.value)}
                    value={stock}
                    required
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Product Images</h2>
                <p className="mt-1 text-sm text-gray-500">Upload up to 4 product images</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Image Upload Slots */}
                  {[...Array(4)].map((_, index) => (
                    <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                      <input
                        onChange={(e) => handleImageChange(index, e.target.files[0])}
                        type="file"
                        id={`image${index}`}
                        hidden
                        accept="image/*"
                      />
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors flex items-center justify-center">
                        {files[index] ? (
                          <div className="relative w-full h-full">
                            <Image
                              className="w-full h-full object-cover rounded-lg"
                              src={URL.createObjectURL(files[index])}
                              alt="Preview"
                              width={200}
                              height={200}
                            />
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="mt-2 text-xs text-gray-500">Upload Image</p>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Image Tips */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Image Guidelines</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Upload high-quality images (JPG, PNG)</li>
                          <li>Recommended size: 800x800 pixels</li>
                          <li>Maximum 4 images per product</li>
                          <li>First image will be the main display image</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Preview */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Preview</h2>
                <p className="mt-1 text-sm text-gray-500">How your product will appear</p>
              </div>
              
              <div className="p-6">
                <div className="border rounded-lg p-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                    {files[0] ? (
                      <Image
                        className="w-full h-full object-cover"
                        src={URL.createObjectURL(files[0])}
                        alt="Product preview"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 truncate">{name || 'Product Name'}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{description || 'Product description will appear here...'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{brand || 'Brand'}</span>
                      <div className="flex items-center space-x-2">
                        {offerPrice && (
                          <span className="text-sm text-gray-400 line-through">{currency}{price || '0'}</span>
                        )}
                        <span className="font-medium text-orange-600">{currency}{offerPrice || price || '0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Stock: {stock || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;