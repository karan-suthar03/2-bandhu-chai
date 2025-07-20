import { useNavigate } from "react-router-dom";
import productImage from "../assets/product.jpg";
import {useState,useEffect} from "react";
import {getFeaturedProducts} from "../api/products.js";

function ProductCard({ product }) {
    const navigate = useNavigate();

    const handleProductClick = () => {
        navigate(`/product/1`);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={handleProductClick}>
            <div className="relative h-56 sm:h-64">
                <img
                    src={product.image}
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
                    <span className="text-xl font-bold text-[#3a1f1f]">{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                    <span className="text-xs font-medium text-[#e67e22]">{product.discount}</span>
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
                    <button className="flex-1 bg-white border-2 border-[#e67e22] text-[#e67e22] py-2 rounded-lg text-sm font-medium hover:bg-[#e67e22] hover:text-white transition">
                        Add to Cart
                    </button>
                    <button className="flex-1 bg-[#e67e22] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#d35400] transition">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}

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
        image: productImage
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
        image: productImage
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
        image: productImage
    }
];


function TopPicksSection() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getFeaturedProducts().then((data) => {
            console.log(data);
        });
    }, []);
    return (
        <section className="bg-[#f7ebc9] py-16 px-4 sm:px-8 lg:px-24">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3a1f1f] text-center mb-12 tracking-tight">
                Our Top Picks
            </h3>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {products.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </section>
    );
}

export default TopPicksSection;
