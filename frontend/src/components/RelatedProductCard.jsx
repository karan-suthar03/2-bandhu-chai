import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency, formatDiscount } from "../utils/priceUtils.js";

function RelatedProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, isInCart, isAddingToCart } = useCart();

    const handleProductClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        const options = {};
        if (product.defaultVariant?.id) {
            options.variantId = product.defaultVariant.id;
        }
        await addToCart(product.id, options);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleProductClick}>
            <div className="relative h-48">
                <img
                    src={product.image?.mediumUrl || product.image?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {product.badge && (
                    <span className="absolute top-3 right-3 bg-[#3a1f1f] text-white text-xs font-medium px-3 py-1 rounded-lg">
                        {product.badge}
                    </span>
                )}
                {product.organic && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Organic
                    </span>
                )}
            </div>

            <div className="p-4">
                <h4 className="font-semibold text-[#3a1f1f] mb-2 line-clamp-2">
                    {product.name}
                </h4>
                
                {product.description && (
                    <p className="text-sm text-[#5b4636] mb-2 line-clamp-2">
                        {product.description}
                    </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-[#3a1f1f]">
                        {formatCurrency(product.price)}
                    </span>
                    {product.oldPrice && (
                        <>
                            <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.oldPrice)}
                            </span>
                            {formatDiscount(product.discount) && (
                                <span className="text-xs font-medium text-[#e67e22] bg-orange-100 px-2 py-1 rounded">
                                    {formatDiscount(product.discount)}
                                </span>
                            )}
                        </>
                    )}
                </div>

                {product.rating > 0 && (
                    <div className="flex items-center mb-3">
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
                        <span className="text-xs text-gray-600 ml-1">
                            ({product.reviews || 0})
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || isAddingToCart(product.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                            product.stock === 0
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : isAddingToCart(product.id)
                                ? 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                                : isInCart(product.id)
                                ? 'bg-green-100 border border-green-500 text-green-700'
                                : 'bg-[#e67e22] text-white hover:bg-[#d35400]'
                        }`}
                    >
                        {product.stock === 0 
                            ? 'Out of Stock' 
                            : isAddingToCart(product.id) 
                                ? 'Adding...'
                                : isInCart(product.id) 
                                    ? 'In Cart' 
                                    : 'Add to Cart'
                        }
                    </button>
                    
                    {product.fastDelivery && (
                        <span className="text-xs text-[#e67e22] font-medium">⚡ Fast</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RelatedProductCard;
