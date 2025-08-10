import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { getRelatedProducts } from "../api/products.js";
import RelatedProductCard from "./RelatedProductCard.jsx";

function YouMayAlsoLike({ currentProductId }) {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems } = useCart();

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!currentProductId) return;
            
            try {
                setLoading(true);
                const products = await getRelatedProducts(currentProductId, 8);

                const cartProductIds = cartItems.map(item => item.id);
                const filteredProducts = products.filter(product => 
                    !cartProductIds.includes(product.id)
                ).slice(0, 4);
                
                setRelatedProducts(filteredProducts);
            } catch (error) {
                console.error("Error fetching related products:", error);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [currentProductId, cartItems]);

    if (loading) {
        return (
            <section className="bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-3xl font-bold text-[#3a1f1f] text-center mb-12">
                        You May Also Like
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-3xl font-bold text-[#3a1f1f] text-center mb-12">
                    You May Also Like
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {relatedProducts.map((product) => (
                        <RelatedProductCard 
                            key={product.id} 
                            product={product} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default YouMayAlsoLike;
