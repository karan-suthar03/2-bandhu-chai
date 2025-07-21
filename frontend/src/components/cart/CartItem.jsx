import { formatPrice, formatDiscount } from "../../utils/priceUtils.js";

function CartItem({ item, onQuantityUpdate, onRemove, onProductClick }) {
    return (
        <div className="p-6 hover:bg-gray-50 transition">
            <div className="flex items-center space-x-4">
                <div className="relative cursor-pointer" onClick={() => onProductClick(item.id)}>
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    />
                </div>
                <div className="flex-1">
                    <h3 
                        className="text-lg font-semibold text-[#3a1f1f] mb-1 cursor-pointer hover:text-[#e67e22] transition-colors"
                        onClick={() => onProductClick(item.id)}
                    >
                        {item.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-[#3a1f1f]">
                            ₹{formatPrice(item.price)}
                        </span>
                        {item.oldPrice && (
                            <>
                                <span className="text-sm text-gray-500 line-through">
                                    ₹{formatPrice(item.oldPrice)}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {formatDiscount(item.discount)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuantityUpdate(item.id, item.quantity - 1);
                            }}
                            disabled={item.quantity <= 1}
                            className={`p-2 transition cursor-pointer ${
                                item.quantity <= 1 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="px-4 py-2 font-semibold text-[#3a1f1f] min-w-[3rem] text-center">
                            {item.quantity}
                        </span>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuantityUpdate(item.id, item.quantity + 1);
                            }}
                            className="p-2 hover:bg-gray-100 transition text-gray-600 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-[#3a1f1f]">
                        ₹{formatPrice(item.price * item.quantity)}
                    </p>
                    {item.oldPrice && (
                        <p className="text-sm text-gray-500 line-through">
                            ₹{formatPrice(item.oldPrice * item.quantity)}
                        </p>
                    )}
                </div>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove(item.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default CartItem;
