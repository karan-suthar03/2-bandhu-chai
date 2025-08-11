import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { getProducts } from "../api/products.js";
import ProductCard from "../components/ProductCard.jsx";
import { useNavigate } from "react-router-dom";

function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Debounce search term - delay API calls by 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(()=>{
        const fetchProducts = async () => {
            try {
                setError(null);
                // Show search loading only if it's not the initial load
                if (products.length > 0) {
                    setSearchLoading(true);
                } else {
                    setLoading(true);
                }

                const data = await getProducts({
                    sortBy,
                    priceRange,
                    searchTerm: debouncedSearchTerm,
                    selectedCategory
                });
                
                setProducts(data || []);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setError('Unable to load products. Please check your connection.');
                setProducts([]);
            } finally {
                setLoading(false);
                setSearchLoading(false);
            }
        };

        fetchProducts();
    },[priceRange, debouncedSearchTerm, selectedCategory, sortBy])

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const categories = [
        { id: "all", name: "All Teas" },
        { id: "black-tea", name: "Black Tea" },
        { id: "green-tea", name: "Green Tea" },
        { id: "herbal-tea", name: "Herbal Tea" },
        { id: "masala-chai", name: "Masala Chai" },
        { id: "white-tea", name: "White Tea" },
        { id: "oolong-tea", name: "Oolong Tea" }
    ];

    const priceRanges = [
        { id: "all", name: "All Prices" },
        { id: "0-500", name: "Under ₹500" },
        { id: "500-800", name: "₹500 - ₹800" },
        { id: "800-1000", name: "₹800 - ₹1000" },
        { id: "1000+", name: "Above ₹1000" }
    ];

    const sortOptions = [
        { id: "name", name: "Name (A-Z)" },
        { id: "price-low", name: "Price: Low to High" },
        { id: "price-high", name: "Price: High to Low" },
        { id: "rating", name: "Rating" },
        { id: "reviews", name: "Most Reviews" }
    ];



    const handleAddToCart = async (product) => {
        const options = {};
        if (product.defaultVariant?.id) {
            options.variantId = product.defaultVariant.id;
        }
        
        const success = await addToCart(product.id, options);
        if (success) {
            setShowSuccessMessage(true);
        }
    };

    const handleBuyNow = async (product) => {
        const options = {};
        if (product.defaultVariant?.id) {
            options.variantId = product.defaultVariant.id;
        }
        const success = await addToCart(product.id, options);
        if(success){
            navigate("/cart")
        }
    };

    return (
        <>
            <main className="min-h-screen pt-20 bg-gray-50">
                {showSuccessMessage && (
                    <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-pulse">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added to cart successfully!
                    </div>
                )}
                <section className="bg-gradient-to-r from-[#f7ebc9] via-[#e8d5a3] to-[#f7ebc9] py-16 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="w-full h-full bg-repeat" style={{
                            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d4af37\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-15c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                        }}></div>
                    </div>
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <h1 className="text-4xl md:text-6xl font-bold text-[#3a1f1f] mb-4 leading-tight">
                            Premium Tea Collection
                        </h1>
                        <p className="text-lg md:text-xl text-[#5b4636] max-w-3xl mx-auto mb-8 leading-relaxed">
                            Discover our carefully curated selection of premium teas from around the world. 
                            Each blend tells a story of tradition, quality, and exceptional taste.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div className="flex items-center text-[#3a1f1f] font-medium">
                                <svg className="w-5 h-5 mr-2 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                                Free shipping on orders over ₹999
                            </div>
                            <div className="flex items-center text-[#3a1f1f] font-medium">
                                <svg className="w-5 h-5 mr-2 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                                100% Authentic & Fresh
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-8 px-4 border-b shadow-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search teas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent transition-all"
                                />
                                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        disabled={loading || searchLoading}
                                        className={`px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white appearance-none pr-10 font-medium cursor-pointer ${
                                            loading || searchLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                
                                <div className="relative">
                                    <select
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        disabled={loading || searchLoading}
                                        className={`px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white appearance-none pr-10 font-medium cursor-pointer ${
                                            loading || searchLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {priceRanges.map(range => (
                                            <option key={range.id} value={range.id}>{range.name}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        disabled={loading || searchLoading}
                                        className={`px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white appearance-none pr-10 font-medium cursor-pointer ${
                                            loading || searchLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.id} value={option.id}>{option.name}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {(selectedCategory !== "all" || priceRange !== "all" || searchTerm !== "") && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("all");
                                            setPriceRange("all");
                                            setSearchTerm("");
                                            setDebouncedSearchTerm("");
                                        }}
                                        className="px-4 py-3 text-[#e67e22] border border-[#e67e22] rounded-lg hover:bg-[#e67e22] hover:text-white transition-colors font-medium"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="text-sm text-[#5b4636] font-medium">
                                Showing {products.length} products
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {selectedCategory !== "all" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e67e22] text-white">
                                        {categories.find(c => c.id === selectedCategory)?.name}
                                        <button
                                            onClick={() => setSelectedCategory("all")}
                                            className="ml-2 hover:text-gray-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {priceRange !== "all" && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e67e22] text-white">
                                        {priceRanges.find(p => p.id === priceRange)?.name}
                                        <button
                                            onClick={() => setPriceRange("all")}
                                            className="ml-2 hover:text-gray-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e67e22] text-white">
                                        Search: "{searchTerm}"
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setDebouncedSearchTerm("");
                                            }}
                                            className="ml-2 hover:text-gray-200"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                        <div className="h-56 bg-gray-200"></div>
                                        <div className="p-5">
                                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                                                <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : searchLoading ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                        <div className="h-56 bg-gray-200"></div>
                                        <div className="p-5">
                                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                                                <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="bg-red-100 border border-red-400 text-red-800 px-6 py-4 rounded-lg inline-block max-w-md">
                                    <div className="flex items-center mb-2">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="font-semibold">Connection Error</h3>
                                    </div>
                                    <p className="mb-4">{error}</p>
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-[#3a1f1f] mb-2">No products found</h3>
                                <p className="text-[#5b4636]">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        onAddToCart={handleAddToCart}
                                        onBuyNow={handleBuyNow}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="bg-[#f7ebc9] py-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-[#3a1f1f] mb-4">
                            Stay Updated with Our Latest Blends
                        </h2>
                        <p className="text-lg text-[#5b4636] mb-8">
                            Subscribe to our newsletter and be the first to know about new tea arrivals, exclusive offers, and brewing tips.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:border-transparent"
                            />
                            <button className="bg-[#e67e22] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d35400] transition">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default ShopPage;
