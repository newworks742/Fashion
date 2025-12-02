'use client';
import { useEffect, useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function DataDisplay() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showFilters, setShowFilters] = useState(true);
    const itemsPerPage = 12;

    const [filters, setFilters] = useState({
        subcategory: [],
        type: [],
        minPrice: '',
        maxPrice: '',
        minRating: '',
        colors: [],
        sizes: [],
        sortBy: ''
    });

    const [filterOptions, setFilterOptions] = useState({
        subcategory: [],
        types: [],
        colors: [],
        sizes: []
    });

    const [expandedSections, setExpandedSections] = useState({
        subcategory: true,
        type: true,
        price: true,
        rating: true,
        colors: false,
        sizes: false
    });

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        fetchData();
    }, [currentPage, filters]);

    const fetchFilterOptions = async () => {
        try {
            const res = await fetch('/api/kids/filters');
            if (res.ok) {
                const options = await res.json();
                setFilterOptions(options);
            }
        } catch (err) {
            console.error('Failed to fetch filter options:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage,
                ...(filters.subcategory.length && { subcategory: filters.subcategory.join(',') }),
                ...(filters.type.length && { type: filters.type.join(',') }),
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(filters.minRating && { minRating: filters.minRating }),
                ...(filters.colors.length && { colors: filters.colors.join(',') }),
                ...(filters.sizes.length && { sizes: filters.sizes.join(',') }),
                ...(filters.sortBy && { sortBy: filters.sortBy })
            });
             const res = await fetch(`/api/kids?${queryParams}`);

            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }

            const json = await res.json();

            // Convert Buffer to base64
            if (json.data && Array.isArray(json.data)) {
                json.data = json.data.map(product => {
                    if (product.image && product.image.data && Array.isArray(product.image.data)) {
                        const base64 = btoa(
                            product.image.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        return { ...product, image: base64 };
                    }
                    return product;
                });
            }

            if (json.error) {
                setError(json.error + ' - ' + (json.detail || ''));
                setData([]);
            } else {
                setData(json.data || []);
                setTotalCount(json.total || 0);
            }
        } catch (err) {
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            if (Array.isArray(prev[filterType])) {
                const newArray = prev[filterType].includes(value)
                    ? prev[filterType].filter(v => v !== value)
                    : [...prev[filterType], value];
                return { ...prev, [filterType]: newArray };
            }
            return { ...prev, [filterType]: value };
        });
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            subcategory: [],
            type: [],
            minPrice: '',
            maxPrice: '',
            minRating: '',
            colors: [],
            sizes: [],
            sortBy: ''
        });
        setCurrentPage(1);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const activeFilterCount =
        filters.subcategory.length +
        filters.type.length +
        filters.colors.length +
        filters.sizes.length +
        (filters.minPrice ? 1 : 0) +
        (filters.maxPrice ? 1 : 0) +
        (filters.minRating ? 1 : 0);

    if (loading && data.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex gap-6 p-6">
                <div className={`${showFilters ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Filter size={20} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-black text-white text-xs rounded-full px-2 py-0.5">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </h3>
                            {activeFilterCount > 0 && (
                                <button onClick={clearFilters} className="text-sm text-black hover:text-blue-800 font-medium">
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {filterOptions.subcategory && filterOptions.subcategory.length > 0 && (
                                <div className="border-b pb-4">
                                    <button
                                        onClick={() => toggleSection('subcategory')}
                                        className="flex justify-between items-center w-full mb-3 font-semibold text-gray-800 hover:text-black"
                                    >
                                        Subcategory
                                        {expandedSections.subcategory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {expandedSections.subcategory && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {filterOptions.subcategory.map(subcategory => (
                                                <label key={subcategory} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.subcategory.includes(subcategory)}
                                                        onChange={() => handleFilterChange('subcategory', subcategory)}
                                                        className="w-4 h-4 text-black rounded focus:ring-black"
                                                    />
                                                    <span className="text-sm text-gray-700">{subcategory}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {filterOptions.types && filterOptions.types.length > 0 && (
                                <div className="border-b pb-4">
                                    <button
                                        onClick={() => toggleSection('type')}
                                        className="flex justify-between items-center w-full mb-3 font-semibold text-gray-800 hover:text-black"
                                    >
                                        Type
                                        {expandedSections.type ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {expandedSections.type && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {filterOptions.types.map(type => (
                                                <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.type.includes(type)}
                                                        onChange={() => handleFilterChange('type', type)}
                                                        className="w-4 h-4 text-black rounded focus:ring-black"
                                                    />
                                                    <span className="text-sm text-gray-700">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="border-b pb-4">
                                <button
                                    onClick={() => toggleSection('price')}
                                    className="flex justify-between items-center w-full mb-3 font-semibold text-gray-800 hover:text-black"
                                >
                                    Price Range
                                    {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {expandedSections.price && (
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min Price"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max Price"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="border-b pb-4">
                                <button
                                    onClick={() => toggleSection('rating')}
                                    className="flex justify-between items-center w-full mb-3 font-semibold text-gray-800 hover:text-black"
                                >
                                    Minimum Rating
                                    {expandedSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {expandedSections.rating && (
                                    <div className="space-y-2">
                                        {[4, 3.5, 3, 2.5, 2].map(rating => (
                                            <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    checked={filters.minRating === rating.toString()}
                                                    onChange={() => handleFilterChange('minRating', rating.toString())}
                                                    className="w-4 h-4 text-black"
                                                />
                                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                                    {rating}
                                                    <span className="text-yellow-500">★</span>
                                                    & above
                                                </span>
                                            </label>
                                        ))}
                                        {filters.minRating && (
                                            <button
                                                onClick={() => handleFilterChange('minRating', '')}
                                                className="text-xs text-black hover:text-blue-800 ml-2"
                                            >
                                                Clear rating filter
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                            >
                                <Filter size={20} className={showFilters ? 'text-black' : 'text-gray-600'} />
                            </button>
                            <h2 className="text-3xl font-bold">Kid's collection </h2>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-sm"
                            >
                                <option value="">Sort By</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="rating_high">Rating: High to Low</option>
                                <option value="rating_low">Rating: Low to High</option>
                                <option value="discount_high">Discount: High to Low</option>
                            </select>

                            <p className="text-gray-600 text-sm whitespace-nowrap">
                                {loading ? 'Loading...' : `${totalCount} products`}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-600 font-semibold">Error</p>
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && data.length === 0 && !error && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg mb-4">No products found matching your filters</p>
                            <button onClick={clearFilters} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-blue-700">
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {data.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {data.map((product, i) => (
                                    <div
                                        key={product.id || i}
                                        onClick={() => window.location.href = `/kids/${product.producturl}`}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                                    >
                                        <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                            {product.image && product.image_mime ? (
                                                <img
                                                    src={`data:${product.image_mime};base64,${product.image}`}
                                                    alt={product.product_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="absolute inset-0 bg-gradient-to-br from-purple-200 to-orange-100 flex items-center justify-center"
                                                style={{ display: product.image && product.image_mime ? 'none' : 'flex' }}
                                            >
                                                <span className="text-gray-400 text-sm">No Image</span>
                                            </div>
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

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => {
                                            setCurrentPage(p => Math.max(1, p - 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === 1 || loading}
                                        className="px-4 py-2 bg-black text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="px-4 py-2 bg-white rounded shadow">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCurrentPage(p => Math.min(totalPages, p + 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === totalPages || loading}
                                        className="px-4 py-2 bg-black text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}