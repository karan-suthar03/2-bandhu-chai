import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import productImage from "../assets/product.jpg";

function ProductPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [reviews, setReviews] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);

    const productData = {
        1: {
            id: 1,
            name: "Organic Assam Black Tea",
            price: "₹699",
            oldPrice: "₹899",
            discount: "22% Off",
            rating: 4.2,
            reviews: 124,
            badge: "Top Seller",
            images: [productImage, productImage, productImage, productImage],
            category: "black-tea",
            description: "Experience the rich, malty flavors of our premium organic Assam black tea. Sourced directly from the renowned tea gardens of Assam, this full-bodied tea delivers a robust taste with hints of honey and a lingering finish. Perfect for morning brewing or afternoon tea time.",
            longDescription: "Our Organic Assam Black Tea is carefully handpicked from single-estate gardens in the Brahmaputra Valley. The unique terroir of Assam, combined with traditional processing methods, creates a tea that's both bold and smooth. This FTGFOP (Finest Tippy Golden Flowery Orange Pekoe) grade tea contains golden tips that add sweetness and complexity to every cup.",
            stock: 15,
            organic: true,
            fastDelivery: true,
            isNew: false,
            sizes: [
                { size: "100g", price: "₹349", oldPrice: "₹449" },
                { size: "250g", price: "₹699", oldPrice: "₹899" },
                { size: "500g", price: "₹1299", oldPrice: "₹1699" }
            ],
            features: [
                "100% Organic Certified",
                "Single Estate Tea",
                "Rich in Antioxidants",
                "Bold Malty Flavor",
                "FTGFOP Grade",
                "Handpicked Leaves"
            ],
            specifications: {
                "Tea Type": "Black Tea",
                "Origin": "Assam, India",
                "Grade": "FTGFOP",
                "Caffeine Level": "High",
                "Brewing Time": "3-5 minutes",
                "Water Temperature": "95-100°C",
                "Shelf Life": "2 years from manufacturing"
            },
            brewingInstructions: [
                "Use 1 teaspoon (2-3g) per cup",
                "Heat water to 95-100°C",
                "Steep for 3-5 minutes",
                "Add milk and sugar as desired",
                "Enjoy hot for best flavor"
            ]
        }
    };

    const reviewsData = [
        {
            id: 1,
            name: "Rajesh Kumar",
            rating: 5,
            date: "2 days ago",
            comment: "Excellent quality tea! The aroma is fantastic and the taste is rich and full-bodied. Highly recommended for tea lovers.",
            verified: true
        },
        {
            id: 2,
            name: "Priya Sharma",
            rating: 4,
            date: "1 week ago",
            comment: "Very good tea. The packaging is also premium. The taste is authentic and strong. Will order again.",
            verified: true
        },
        {
            id: 3,
            name: "Amit Patel",
            rating: 5,
            date: "2 weeks ago",
            comment: "Best Assam tea I've had in years. The organic certification gives me confidence in the quality. Fast delivery too!",
            verified: true
        }
    ];

    useEffect(() => {
        const fetchProduct = () => {
            const productInfo = productData[productId];
            if (productInfo) {
                setProduct(productInfo);
                setSelectedSize(productInfo.sizes[1].size);
                setReviews(reviewsData);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [productId]);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const handleAddToCart = () => {
        console.log("Adding to cart:", { product, quantity, size: selectedSize });
        setShowSuccessMessage(true);
    };

    const handleBuyNow = () => {
        console.log("Buy now:", { product, quantity, size: selectedSize });
    };

    const handleWishlist = () => {
        setIsInWishlist(!isInWishlist);
    };

    if (!product) {
        return (
            <>
                <div className="min-h-screen pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e67e22] mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-[#3a1f1f] mb-2">Loading Product...</h2>
                        <p className="text-[#5b4636]">Please wait while we fetch the product details.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <main className="min-h-screen pt-20 bg-gray-50">
                {}
                {showSuccessMessage && (
                    <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-pulse">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added to cart successfully!
                    </div>
                )}

                {}
                <section className="bg-white py-4 px-4 border-b">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center space-x-2 text-sm text-[#5b4636]">
                            <Link to="/" className="hover:text-[#e67e22] transition">Home</Link>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <Link to="/shop" className="hover:text-[#e67e22] transition">Shop</Link>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[#3a1f1f] font-medium">{product.name}</span>
                        </nav>
                    </div>
                </section>

                {}
                <section className="py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {}
                            <div className="space-y-4">
                                {}
                                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group">
                                    <img
                                        src={product.images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-96 md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.badge && (
                                        <span className="absolute top-4 left-4 bg-[#3a1f1f] text-white px-3 py-1 rounded-lg font-medium">
                                            {product.badge}
                                        </span>
                                    )}
                                    {product.organic && (
                                        <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg font-medium">
                                            Organic
                                        </span>
                                    )}
                                </div>

                                {}
                                <div className="flex space-x-4">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === index
                                                    ? "border-[#e67e22] shadow-lg"
                                                    : "border-gray-200 hover:border-[#e67e22]"
                                            }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#3a1f1f] mb-2">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex items-center">
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
                                            <span className="ml-2 text-sm text-[#5b4636]">
                                                {product.rating} ({product.reviews} reviews)
                                            </span>
                                        </div>
                                        <span className="text-green-600 text-sm font-medium">
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>

                                {}
                                <div className="flex items-center space-x-4">
                                    <span className="text-4xl font-bold text-[#3a1f1f]">
                                        {product.sizes.find(s => s.size === selectedSize)?.price || product.price}
                                    </span>
                                    {product.oldPrice && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">
                                                {product.sizes.find(s => s.size === selectedSize)?.oldPrice || product.oldPrice}
                                            </span>
                                            <span className="bg-[#e67e22] text-white px-3 py-1 rounded-lg font-medium">
                                                {product.discount}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {}
                                <div>
                                    <p className="text-[#5b4636] text-lg leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                {}
                                <div>
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mb-3">Size</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {product.sizes.map((sizeOption) => (
                                            <button
                                                key={sizeOption.size}
                                                onClick={() => setSelectedSize(sizeOption.size)}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    selectedSize === sizeOption.size
                                                        ? "border-[#e67e22] bg-[#e67e22]/10 text-[#e67e22]"
                                                        : "border-gray-200 hover:border-[#e67e22] text-[#3a1f1f]"
                                                }`}
                                            >
                                                <div className="font-semibold">{sizeOption.size}</div>
                                                <div className="text-sm">{sizeOption.price}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {}
                                <div>
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mb-3">Quantity</h3>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border-2 border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-3 py-2 text-[#3a1f1f] hover:bg-gray-100 transition"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-2 font-semibold">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-3 py-2 text-[#3a1f1f] hover:bg-gray-100 transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-sm text-[#5b4636]">
                                            Only {product.stock} items left
                                        </span>
                                    </div>
                                </div>

                                {}
                                <div>
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mb-3">Key Features</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.features.map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-[#5b4636]">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                                            product.stock === 0
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-white border-2 border-[#e67e22] text-[#e67e22] hover:bg-[#e67e22] hover:text-white hover:scale-105'
                                        }`}
                                    >
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                        className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                                            product.stock === 0
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-[#e67e22] text-white hover:bg-[#d35400] hover:scale-105'
                                        }`}
                                    >
                                        Buy Now
                                    </button>
                                    <button
                                        onClick={handleWishlist}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            isInWishlist
                                                ? 'border-red-500 bg-red-50 text-red-500'
                                                : 'border-gray-200 hover:border-red-500 hover:text-red-500'
                                        }`}
                                    >
                                        <svg className="w-6 h-6" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>

                                {}
                                <div className="flex items-center space-x-6 pt-4 border-t">
                                    {product.fastDelivery && (
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 000 2v9a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 000-2H6z" />
                                            </svg>
                                            <span className="text-sm text-[#5b4636]">Fast Delivery</span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-[#5b4636]">Quality Guaranteed</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-[#e67e22]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-[#5b4636]">Easy Returns</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section className="bg-white py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        {}
                        <div className="flex space-x-1 border-b border-gray-200 mb-8">
                            {[
                                { id: "description", label: "Description" },
                                { id: "specifications", label: "Specifications" },
                                { id: "brewing", label: "Brewing Guide" },
                                { id: "reviews", label: "Reviews" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 font-medium text-sm transition-all ${
                                        activeTab === tab.id
                                            ? "text-[#e67e22] border-b-2 border-[#e67e22]"
                                            : "text-[#5b4636] hover:text-[#e67e22]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {}
                        <div className="max-w-4xl">
                            {activeTab === "description" && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-[#3a1f1f]">Product Description</h3>
                                    <p className="text-[#5b4636] text-lg leading-relaxed">
                                        {product.longDescription}
                                    </p>
                                </div>
                            )}

                            {activeTab === "specifications" && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-[#3a1f1f]">Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                                                <span className="font-medium text-[#3a1f1f]">{key}:</span>
                                                <span className="text-[#5b4636]">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "brewing" && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold text-[#3a1f1f]">Brewing Instructions</h3>
                                    <div className="space-y-4">
                                        {product.brewingInstructions.map((instruction, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <span className="flex-shrink-0 w-6 h-6 bg-[#e67e22] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <p className="text-[#5b4636]">{instruction}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-[#3a1f1f]">Customer Reviews</h3>
                                        <button className="bg-[#e67e22] text-white px-4 py-2 rounded-lg hover:bg-[#d35400] transition">
                                            Write a Review
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-[#e67e22] rounded-full flex items-center justify-center text-white font-bold">
                                                            {review.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[#3a1f1f]">{review.name}</p>
                                                            {review.verified && (
                                                                <span className="text-xs text-green-600 flex items-center">
                                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Verified Purchase
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg
                                                                    key={i}
                                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674h4.911c.969 0 1.371 1.24.588 1.81l-3.977 2.89 1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.89-3.977 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.674-3.977-2.89c-.784-.57-.38-1.81.588-1.81h4.911l1.518-4.674z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-[#5b4636]">{review.date}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[#5b4636]">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {}
                <section className="bg-gray-50 py-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h3 className="text-3xl font-bold text-[#3a1f1f] text-center mb-12">
                            You May Also Like
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {}
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                                        <img src={productImage} alt="Related Product" className="w-20 h-20 object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-[#3a1f1f] mb-2">Related Tea Product</h4>
                                        <p className="text-sm text-[#5b4636] mb-2">Short description here</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-[#3a1f1f]">₹599</span>
                                            <button className="bg-[#e67e22] text-white px-3 py-1 rounded text-sm hover:bg-[#d35400] transition">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default ProductPage;
