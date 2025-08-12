import { useState, useEffect } from "react";
import { getFeaturedProducts } from "../api/products.js";
import ProductCard from "./ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";

function TopPicksSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

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

    
    const onAddToCart = async (product) => {
        const options = {};
        if (product.defaultVariant?.id) {
            options.variantId = product.defaultVariant.id;
        }
        
        const success = await addToCart(product.id, options);
        if (success) {
            setShowSuccessMessage(true);
        }
    };

    const onBuyNow = async (product) => {
        const options = {};
        if (product.defaultVariant?.id) {
            options.variantId = product.defaultVariant.id;
        }
        const success = await addToCart(product.id, options);
        if(success){
            navigate("/cart")
        }
    };

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
                        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onBuyNow={onBuyNow} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default TopPicksSection;
