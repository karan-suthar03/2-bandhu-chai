import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

function ProductCard({ product, onAddToCart, onBuyNow, onQuickView }) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();

    const handleProductClick = () => {
        navigate(`/product/1`);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="relative h-56 sm:h-64 overflow-hidden" onClick={handleProductClick}>
                <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
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

                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsInWishlist(!isInWishlist);
                        }}
                        className={`p-2 rounded-full shadow-md transition-colors ${
                            isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
                        }`}
                    >
                        <svg className="w-4 h-4" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickView(product);
                        }}
                        className="p-2 bg-white text-gray-600 hover:text-[#e67e22] rounded-full shadow-md transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
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
                    <h4 className="text-lg font-semibold text-[#3a1f1f] line-clamp-2 flex-1 cursor-pointer hover:text-[#e67e22] transition" onClick={handleProductClick}>
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
                    <span className="text-xl font-bold text-[#3a1f1f]">{product.price}</span>
                    {product.oldPrice && (
                        <>
                            <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                            <span className="text-xs font-medium text-[#e67e22] bg-orange-100 px-2 py-1 rounded">
                                {product.discount}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
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
                    {product.fastDelivery && (
                        <span className="text-xs text-[#e67e22] font-medium">⚡ Fast Delivery</span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            product.stock === 0 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white border-2 border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-white hover:scale-105'
                        }`}
                    >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onBuyNow(product);
                        }}
                        disabled={product.stock === 0}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            product.stock === 0
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-[#e67e22] text-white hover:bg-[#d35400] hover:scale-105'
                        }`}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}

function QuickViewModal({ product, onClose, onAddToCart, onBuyNow }) {
    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <div className="md:flex">
                        <div className="md:w-1/2">
                            <img src={product.image} alt={product.name} className="w-full h-64 md:h-96 object-cover" />
                        </div>
                        
                        <div className="md:w-1/2 p-6">
                            <h3 className="text-2xl font-bold text-[#3a1f1f] mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-4">{product.description}</p>
                            
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl font-bold text-[#3a1f1f]">{product.price}</span>
                                {product.oldPrice && (
                                    <>
                                        <span className="text-lg text-gray-500 line-through">{product.oldPrice}</span>
                                        <span className="text-sm font-medium text-[#e67e22] bg-orange-100 px-2 py-1 rounded">
                                            {product.discount}
                                        </span>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex items-center mb-4">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674h4.911c.969 0 1.371 1.24.588 1.81l-3.977 2.89 1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.89-3.977 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.674-3.977-2.89c-.784-.57-.38-1.81.588-1.81h4.911l1.518-4.674z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
                            </div>
                            
                            {product.features && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-[#3a1f1f] mb-2">Features:</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="flex gap-3 mt-6">
                                <button 
                                    onClick={() => {
                                        onAddToCart(product);
                                        onClose();
                                    }}
                                    className="flex-1 bg-white border-2 border-[#e67e22] text-[#e67e22] py-3 rounded-lg font-medium hover:bg-[#e67e22] hover:text-white transition"
                                >
                                    Add to Cart
                                </button>
                                <button 
                                    onClick={() => {
                                        onBuyNow(product);
                                        onClose();
                                    }}
                                    className="flex-1 bg-[#e67e22] text-white py-3 rounded-lg font-medium hover:bg-[#d35400] transition"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Success message auto-hide
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const products = [
        {
            id: 1,
            name: "Organic Assam Black Tea - 250g",
            price: "₹699",
            oldPrice: "₹899",
            discount: "22% Off",
            rating: 4.2,
            reviews: 124,
            badge: "Top Seller",
            image: logo,
            category: "black-tea",
            description: "Premium organic black tea from the gardens of Assam with rich malty flavor",
            stock: 15,
            organic: true,
            fastDelivery: true,
            isNew: false,
            features: ["100% Organic", "Rich Antioxidants", "Bold Flavor", "Single Estate"]
        },
        {
            id: 2,
            name: "Premium Green Tea - 500g",
            price: "₹849",
            oldPrice: "₹999",
            discount: "15% Off",
            rating: 4.0,
            reviews: 98,
            badge: "Pure Bliss",
            image: logo,
            category: "green-tea",
            description: "Fresh green tea leaves with natural antioxidants for daily wellness",
            stock: 8,
            organic: true,
            fastDelivery: true,
            isNew: false,
            features: ["High in Antioxidants", "Fresh Leaves", "Weight Management", "Heart Healthy"]
        },
        {
            id: 3,
            name: "Herbal Fusion Tea - 300g",
            price: "₹599",
            oldPrice: "₹749",
            discount: "20% Off",
            rating: 4.1,
            reviews: 74,
            badge: "Few Left",
            image: logo,
            category: "herbal-tea",
            description: "Aromatic blend of herbs and spices for natural wellness",
            stock: 3,
            organic: true,
            fastDelivery: false,
            isNew: false,
            features: ["Caffeine Free", "Natural Herbs", "Digestive Aid", "Stress Relief"]
        },
        {
            id: 4,
            name: "Earl Grey Tea - 200g",
            price: "₹549",
            oldPrice: "₹699",
            discount: "21% Off",
            rating: 4.3,
            reviews: 156,
            badge: "Classic",
            image: logo,
            category: "black-tea",
            description: "Classic Earl Grey with bergamot oil for an elegant tea experience",
            stock: 12,
            organic: false,
            fastDelivery: true,
            isNew: false,
            features: ["Bergamot Oil", "Classic Blend", "Afternoon Tea", "Aromatic"]
        },
        {
            id: 5,
            name: "Chamomile Tea - 150g",
            price: "₹449",
            oldPrice: "₹549",
            discount: "18% Off",
            rating: 4.4,
            reviews: 89,
            badge: "Relaxing",
            image: logo,
            category: "herbal-tea",
            description: "Soothing chamomile flowers for relaxation and better sleep",
            stock: 20,
            organic: true,
            fastDelivery: true,
            isNew: true,
            features: ["Sleep Aid", "Calming", "Pure Flowers", "Bedtime Tea"]
        },
        {
            id: 6,
            name: "Masala Chai - 400g",
            price: "₹799",
            oldPrice: "₹999",
            discount: "20% Off",
            rating: 4.5,
            reviews: 203,
            badge: "Best Seller",
            image: logo,
            category: "masala-chai",
            description: "Traditional Indian spiced tea blend with authentic flavors",
            stock: 25,
            organic: false,
            fastDelivery: true,
            isNew: false,
            features: ["Traditional Spices", "Authentic Recipe", "Warming", "Energy Boost"]
        },
        {
            id: 7,
            name: "White Tea - 100g",
            price: "₹1299",
            oldPrice: "₹1599",
            discount: "19% Off",
            rating: 4.6,
            reviews: 67,
            badge: "Premium",
            image: logo,
            category: "white-tea",
            description: "Delicate white tea with subtle flavors and maximum health benefits",
            stock: 5,
            organic: true,
            fastDelivery: false,
            isNew: true,
            features: ["Highest Antioxidants", "Delicate Flavor", "Premium Quality", "Hand Picked"]
        },
        {
            id: 8,
            name: "Oolong Tea - 250g",
            price: "₹899",
            oldPrice: "₹1099",
            discount: "18% Off",
            rating: 4.2,
            reviews: 91,
            badge: "Traditional",
            image: logo,
            category: "oolong-tea",
            description: "Semi-fermented tea with complex flavors and health benefits",
            stock: 0,
            organic: true,
            fastDelivery: false,
            isNew: false,
            features: ["Complex Flavors", "Traditional Process", "Weight Loss", "Metabolism Boost"]
        },
        {
            id: 9,
            name: "Jasmine Green Tea - 200g",
            price: "₹699",
            oldPrice: "₹849",
            discount: "18% Off",
            rating: 4.1,
            reviews: 112,
            badge: "Fragrant",
            image: logo,
            category: "green-tea",
            description: "Green tea scented with jasmine flowers for aromatic experience",
            stock: 18,
            organic: true,
            fastDelivery: true,
            isNew: false,
            features: ["Floral Aroma", "Green Tea Benefits", "Scented", "Evening Tea"]
        }
    ];

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

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const price = parseInt(product.price.replace(/[₹,]/g, ''));
        let matchesPrice = true;
        
        if (priceRange !== "all") {
            if (priceRange === "0-500") matchesPrice = price < 500;
            else if (priceRange === "500-800") matchesPrice = price >= 500 && price <= 800;
            else if (priceRange === "800-1000") matchesPrice = price >= 800 && price <= 1000;
            else if (priceRange === "1000+") matchesPrice = price > 1000;
        }
        
        return matchesCategory && matchesSearch && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "price-low") return parseInt(a.price.replace(/[₹,]/g, '')) - parseInt(b.price.replace(/[₹,]/g, ''));
        if (sortBy === "price-high") return parseInt(b.price.replace(/[₹,]/g, '')) - parseInt(a.price.replace(/[₹,]/g, ''));
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "reviews") return b.reviews - a.reviews;
        return 0;
    });

    const handleAddToCart = (product) => {
        const existingItem = cartItems.find(item => item.id === product.id);
        if (existingItem) {
            setCartItems(cartItems.map(item => 
                item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
        setShowSuccessMessage(true);
        console.log("Added to cart:", product);
    };

    const handleBuyNow = (product) => {
        console.log("Buy now:", product);
    };

    const handleQuickView = (product) => {
        setQuickViewProduct(product);
    };

    const closeQuickView = () => {
        setQuickViewProduct(null);
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
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white appearance-none pr-10 font-medium"
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
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white appearance-none pr-10 font-medium"
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
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e67e22] bg-white appearance-none pr-10 font-medium"
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
                                Showing {sortedProducts.length} of {products.length} products
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
                                            onClick={() => setSearchTerm("")}
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
                        {sortedProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-[#3a1f1f] mb-2">No products found</h3>
                                <p className="text-[#5b4636]">Try adjusting your search or filter criteria</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {sortedProducts.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        onAddToCart={handleAddToCart}
                                        onBuyNow={handleBuyNow}
                                        onQuickView={handleQuickView}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {quickViewProduct && (
                    <QuickViewModal 
                        product={quickViewProduct}
                        onClose={closeQuickView}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                    />
                )}

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
