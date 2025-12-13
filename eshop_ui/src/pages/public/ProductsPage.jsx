import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { SHOP_PUBLIC_ENDPOINTS } from '../../api/endpoints';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSort from '../../components/products/ProductSort';
import ProductQuickView from '../../components/products/ProductQuickView';

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        rating: '',
    });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [products, filters, sortBy, searchParams]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(SHOP_PUBLIC_ENDPOINTS.PRODUCTS);
            setProducts(data.results || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let result = [...products];

        // Apply search filter
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
            result = result.filter(product =>
                product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (filters.category) {
            result = result.filter(product =>
                product.category_name === filters.category
            );
        }

        // Apply price filter
        if (filters.minPrice) {
            result = result.filter(product =>
                parseFloat(product.price) >= parseFloat(filters.minPrice)
            );
        }
        if (filters.maxPrice) {
            result = result.filter(product =>
                parseFloat(product.price) <= parseFloat(filters.maxPrice)
            );
        }

        // Apply stock filter
        if (filters.inStock) {
            result = result.filter(product => product.in_stock);
        }

        // Apply rating filter
        if (filters.rating) {
            result = result.filter(product =>
                parseFloat(product.average_rating || 0) >= parseFloat(filters.rating)
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name-asc':
                result.sort((a, b) => a.product_name.localeCompare(b.product_name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.product_name.localeCompare(a.product_name));
                break;
            case 'rating':
                result.sort((a, b) =>
                    parseFloat(b.average_rating || 0) - parseFloat(a.average_rating || 0)
                );
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredProducts(result);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            rating: '',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {searchParams.get('search')
                            ? `Search Results for "${searchParams.get('search')}"`
                            : searchParams.get('category')
                                ? searchParams.get('category')
                                : 'All Products'}
                    </h1>
                    <p className="text-gray-600">
                        Discover amazing products at unbeatable prices
                    </p>
                </div>

                {/* Sort Bar */}
                <div className="mb-6">
                    <ProductSort
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        totalProducts={filteredProducts.length}
                    />
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <ProductFilters
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        <ProductGrid
                            products={filteredProducts}
                            loading={loading}
                            onQuickView={setSelectedProduct}
                        />
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <ProductQuickView
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
};

export default ProductsPage;