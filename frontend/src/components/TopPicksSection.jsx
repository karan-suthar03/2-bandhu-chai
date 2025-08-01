import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { getFeaturedProducts } from "../api/products.js";

import {formatCurrency, formatDiscount} from "../utils/priceUtils.js";
function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, isInCart, isAddingToCart } = useCart();

    const handleProductClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        await addToCart(product.id);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={handleProductClick}>
            <div className="relative h-56 sm:h-64">
                <img
                    src={product.image.mediumUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-[#3a1f1f] text-white text-xs font-medium px-3 py-1 rounded-lg">
                    {product.badge}
                </span>
            </div>

            <div className="p-5">
                <h4 className="text-lg font-semibold text-[#3a1f1f] mb-2 line-clamp-2">
                    {product.name}
                </h4>

                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-[#3a1f1f]">{formatCurrency(product.price)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.oldPrice)}</span>
                    <span className="text-xs font-medium text-[#e67e22]">{formatDiscount(product.discount)}</span>
                </div>

                <div className="flex items-center mb-4">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674h4.911c.969 0 1.371 1.24.588 1.81l-3.977 2.89 1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.89-3.977 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.674-3.977-2.89c-.784-.57-.38-1.81.588-1.81h4.911l1.518-4.674z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-2">({product.reviews})</span>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={handleAddToCart}
                        disabled={isAddingToCart(product.id)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                            isAddingToCart(product.id)
                                ? 'bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed'
                                : isInCart(product.id) 
                                ? 'bg-green-100 border-2 border-green-500 text-green-700'
                                : 'bg-white border-2 border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-white'
                        }`}
                    >
                        {isAddingToCart(product.id) 
                            ? (
                                <span className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                                    Adding...
                                </span>
                            )
                            : isInCart(product.id) 
                                ? 'In Cart' 
                                : 'Add to Cart'
                        }
                    </button>
                    <button className="flex-1 bg-[#e67e22] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#d35400] transition">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}

function TopPicksSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getFeaturedProducts();
                setProducts(data || []);
            } catch (err) {
                console.error('Failed to load featured products:', err);
                setError('Unable to load featured products. Please check your connection.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedProducts();
    }, []);

    if (!loading && products.length === 0 && !error) return null;
    return (
        <section className="bg-[#f7ebc9] py-16 px-4 sm:px-8 lg:px-24">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3a1f1f] text-center mb-12 tracking-tight">
                Our Top Picks
            </h3>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e67e22]"></div>
                    <span className="ml-4 text-[#3a1f1f]">Loading featured products...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg inline-block">
                        <p className="font-medium">⚠️ {error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default TopPicksSection;
