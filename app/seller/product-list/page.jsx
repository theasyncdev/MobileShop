'use client';
import React, { useEffect, useState } from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import Footer from '@/components/seller/Footer';
import Loading from '@/components/Loading';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { router, getToken, user, currency } = useAppContext();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceSort, setPriceSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const productsPerPage = 6;

  // Fetch products for admin
  const fetchAdminProduct = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get('/api/products/adminlist', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);

        const uniqueBrands = [...new Set(data.products.map((p) => p.brand))].filter(Boolean);
        setBrands(uniqueBrands);
        setLoading(false);
      } else {
        toast.error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Delete a product
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || 'Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search)
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    if (priceSort === 'low-to-high') {
      filtered.sort((a, b) => a.offerPrice - b.offerPrice);
    } else if (priceSort === 'high-to-low') {
      filtered.sort((a, b) => b.offerPrice - a.offerPrice);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedBrand, priceSort]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    if (user) fetchAdminProduct();
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>

          {/* Filter Panel */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, idx) => (
                    <option key={idx} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by Price</label>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Default</option>
                  <option value="low-to-high">Low to High</option>
                  <option value="high-to-low">High to Low</option>
                </select>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBrand('');
                    setPriceSort('');
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Count Info */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {indexOfFirstProduct + 1}-
            {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto rounded-md bg-white border border-gray-300">
            <table className="min-w-full text-sm">
              <thead className="text-left font-semibold text-gray-900 border-b">
                <tr>
                  <th className="p-4 w-1/2">Product</th>
                  <th className="p-4 hidden sm:table-cell">Brand</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 hidden sm:table-cell">Stock</th>
                  <th className="p-4 hidden sm:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentProducts.map((product, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-4 flex items-center gap-3">
                      <Image
                        src={product.images?.[0] || assets.upload_area}
                        alt="Product Image"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span>{product.name}</span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">{product.brand}</td>
                    <td className="p-4">
                      {currency}
                      {product.offerPrice || product.price}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell space-x-2">
                      <button
                        onClick={() => router.push(`/product/edit/${product._id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
