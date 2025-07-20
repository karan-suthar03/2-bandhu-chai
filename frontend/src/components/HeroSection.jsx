import logo from "../assets/logo.svg";
import {useNavigate} from "react-router-dom";

function HeroSection() {
    const navigate = useNavigate();
    function goToShop(){
        navigate(`/shop`);
    }
    return (
        <section className="flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-40 py-12 pt-32 md:min-h-[calc(100vh-100px)] relative overflow-hidden">
            <div className="bg-gradient-to-r from-[#f7ebc9] via-[#e8d5a3] to-[#f7ebc9] absolute inset-0 z-[-1] opacity-50" />
            <div className="text-center md:text-left max-w-xl space-y-6 mt-10 md:mt-0 relative z-10">
                <h2 className="text-4xl md:text-5xl poppins-medium text-[#4b2e2e] leading-tight">
                    Elevate Your Tea Experience
                </h2>

                <p className="text-lg md:text-xl poppins-medium-italic text-[#6b4c4c] font-medium">
                    रिश्तों की मिठास, चाय के साथ ख़ास
                </p>

                <button className="bg-[#a0522d] text-white px-6 py-3 rounded-full text-lg hover:bg-[#8b4513] transition cursor-pointer"
                    onClick={goToShop}
                >
                    Shop Now
                </button>
            </div>

            <div className="flex justify-center md:justify-end">
                <img
                    src={logo}
                    alt="2 Bandhu Logo"
                    className="w-[220px] md:w-[320px] lg:w-[400px]"
                />
            </div>
        </section>
    );
}

export default HeroSection;
