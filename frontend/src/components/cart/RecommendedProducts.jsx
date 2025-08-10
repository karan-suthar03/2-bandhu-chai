import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { getFeaturedProducts } from "../../api/products.js";
import { formatCurrency, formatDiscount } from "../../utils/priceUtils.js";
import { useNavigate } from "react-router-dom";

function RecommendedProducts() {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems, addToCart, isInCart, isAddingToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            try {
                setLoading(true);
                const products = await getFeaturedProducts();

                const cartProductIds = cartItems.map(item => item.id);
                const filteredProducts = products.filter(product => 
                    !cartProductIds.includes(product.id)
                ).slice(0, 2);
                
                setRecommendedProducts(filteredProducts);
            } catch (error) {
                console.error("Error fetching recommended products:", error);
                setRecommendedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedProducts();
    }, [cartItems]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        const options = {};
        if (product.defaultVariant?.id) {
            options.variantId = product.defaultVariant.id;
        }
        await addToCart(product.id, options);
    };

    if (loading) {
        return (
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-[#3a1f1f] mb-4">Recommended for you</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                        <div key={item} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg animate-pulse">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (recommendedProducts.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-[#3a1f1f] mb-4">Recommended for you</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                        onClick={() => handleProductClick(product.id)}
                    >
                        <img 
                            src={product.image?.mediumUrl || product.image?.url} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded-lg" 
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold text-[#3a1f1f] text-sm line-clamp-1">
                                {product.name}
                            </h4>
                            {product.description && (
                                <p className="text-xs text-[#5b4636] mb-1 line-clamp-1">
                                    {product.description}
                                </p>
                            )}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-[#3a1f1f]">
                                    {formatCurrency(product.price)}
                                </span>
                                {product.oldPrice && (
                                    <>
                                        <span className="text-xs text-gray-500 line-through">
                                            {formatCurrency(product.oldPrice)}
                                        </span>
                                        {formatDiscount(product.discount) && (
                                            <span className="text-xs text-[#e67e22] font-medium">
                                                {formatDiscount(product.discount)}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock === 0 || isAddingToCart(product.id)}
                            className={`text-sm font-medium cursor-pointer px-2 py-1 rounded transition ${
                                product.stock === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : isAddingToCart(product.id)
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : isInCart(product.id)
                                    ? 'text-green-600 hover:text-green-700'
                                    : 'text-[#e67e22] hover:text-[#d35400]'
                            }`}
                        >
                            {product.stock === 0 
                                ? 'Out of Stock' 
                                : isAddingToCart(product.id) 
                                    ? 'Adding...'
                                    : isInCart(product.id) 
                                        ? 'In Cart' 
                                        : 'Add'
                            }
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecommendedProducts;
