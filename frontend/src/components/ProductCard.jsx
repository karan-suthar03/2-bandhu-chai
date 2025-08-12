import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency, formatDiscount } from "../utils/priceUtils.js";

function ProductCard({ product, onAddToCart, onBuyNow }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const { isInCart } = useCart();
    const navigate = useNavigate();

    const handleProductClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        setLoadingAction("cart");
        onAddToCart(product).finally(() => setLoadingAction(null));
    };

    const handleBuyNowClick = (e) => {
        e.stopPropagation();
        setLoadingAction("buy");
        onBuyNow(product).finally(() => setLoadingAction(null));
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="relative h-56 sm:h-64 overflow-hidden cursor-pointer" onClick={handleProductClick}>
                <img
                    src={product.image.mediumUrl}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                
                <span className="absolute top-3 right-3 bg-[#3a1f1f] text-white text-xs font-medium px-3 py-1 rounded-lg shadow-md">
                    {product.badge}
                </span>

                {product.isNew && (
                    <span className="absolute top-3 left-3 bg-[#e67e22] text-white text-xs font-medium px-3 py-1 rounded-lg shadow-md">
                        New
                    </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Only {product.stock} left
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">Out of Stock</span>
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <h4
                        className="text-lg font-semibold text-[#3a1f1f] line-clamp-2 flex-1 cursor-pointer hover:text-[#e67e22] transition"
                        onClick={handleProductClick}
                    >
                        {product.name}
                    </h4>
                    {product.organic && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Organic
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-[#3a1f1f]">{formatCurrency(product.price)}</span>
                    {product.oldPrice && (
                        <>
                            <span className="text-sm text-gray-500 line-through">{formatCurrency(product.oldPrice)}</span>
                            {formatDiscount(product.discount) && (
                                <span className="text-xs font-medium text-[#e67e22] bg-orange-100 px-2 py-1 rounded">
                                    {formatDiscount(product.discount)}
                                </span>
                            )}
                        </>
                    )}
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674h4.911c.969 0 1.371 1.24.588 1.81l-3.977 2.89 1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.89-3.977 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.674-3.977-2.89c-.784-.57-.38-1.81.588-1.81h4.911l1.518-4.674z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-2">({product.reviews})</span>
                    </div>
                    {product.fastDelivery && (
                        <span className="text-xs text-[#e67e22] font-medium">⚡ Fast Delivery</span>
                    )}
                </div>
                <div className="flex gap-2">
                    {isInCart(product.id) ? (
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all bg-green-100 border-2 border-green-500 text-green-700"
                            disabled
                        >
                            In Cart
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleAddToCartClick}
                                disabled={product.stock === 0 || loadingAction !== null}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                    product.stock === 0
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : loadingAction === "cart"
                                        ? "bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-white border-2 border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-white hover:scale-105"
                                }`}
                            >
                                {loadingAction === "cart" ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                                        Adding...
                                    </span>
                                ) : (
                                    "Add to Cart"
                                )}
                            </button>
                            <button
                                onClick={handleBuyNowClick}
                                disabled={product.stock === 0 || loadingAction !== null}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                    product.stock === 0
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-[#e67e22] text-white hover:bg-[#d35400] hover:scale-105"
                                }`}
                            >
                                {loadingAction === "buy" ? (
                                    <span className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                                        Adding...
                                    </span>
                                ) : (
                                    "Buy Now"
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;