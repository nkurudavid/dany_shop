import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const ProductSort = ({ sortBy, onSortChange, totalProducts }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{totalProducts}</span> products
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="rating">Highest Rated</option>
                </select>
            </div>
        </div>
    );
};

export default ProductSort;