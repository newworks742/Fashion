'use client';
import { useEffect, useState } from 'react';

export default function DataDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  useEffect(() => {
    fetch('/api/men')
      .then(async (res) => {
        try {
          return await res.json();
        } catch (e) {
          throw new Error('Invalid JSON response from API');
        }
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]);
          if (json.error) setError(json.error + ' - ' + (json.detail || ''));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center p-8">Loading...</p>;
  if (error) return <p className="text-center p-8 text-red-600">Error: {error}</p>;
  if (data.length === 0) return <p className="text-center p-8">No data found</p>;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6">Men's Collection</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentItems.map((product, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-64 bg-gradient-to-br from-purple-200 to-orange-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Product Image</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.product_name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.subcategory} • {product.type}</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">₹{product.discounted_price}</span>
                {product.discount !== '0%' && (
                  <>
                    <span className="text-sm text-gray-500 line-through">₹{product.price}</span>
                    <span className="text-sm text-green-600 font-medium">{product.discount} off</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviews})</span>
              </div>
              {product.colors && (
                <p className="text-xs text-gray-600 mb-1">Colors: {product.colors}</p>
              )}
              {product.sizes && (
                <p className="text-xs text-gray-600">Sizes: {product.sizes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-2 mt-8">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}