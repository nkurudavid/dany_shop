import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

const ProductFilters = ({ onFilterChange, onClearFilters }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        rating: '',
    });

    const categories = [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports & Outdoors',
        'Books',
        'Beauty & Health',
        'Toys & Games',
        'Automotive',
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClear = () => {
        const emptyFilters = {
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            rating: '',
        };
        setFilters(emptyFilters);
        onClearFilters();
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden p-4 border-b">
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    fullWidth
                    icon={Filter}
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
            </div>

            {/* Filters Content */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block p-4 md:p-6 space-y-6`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </h3>
                    <button
                        onClick={handleClear}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                        Clear All
                    </button>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price Range
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Rating Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Minimum Rating
                    </label>
                    <select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Ratings</option>
                        <option value="4">4★ & above</option>
                        <option value="3">3★ & above</option>
                        <option value="2">2★ & above</option>
                        <option value="1">1★ & above</option>
                    </select>
                </div>

                {/* Stock Filter */}
                <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.inStock}
                            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;