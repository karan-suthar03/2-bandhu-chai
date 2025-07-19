import logo from "../assets/logo.svg";

function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-[#f7ebc9] via-[#e8d5a3] to-[#f7ebc9] flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-40 py-12 pt-32 md:min-h-[calc(100vh-100px)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-repeat" style={{
                    backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d4af37\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-15c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                }}></div>
            </div>
            <div className="text-center md:text-left max-w-xl space-y-6 mt-10 md:mt-0 relative z-10">
                <h2 className="text-4xl md:text-5xl poppins-medium text-[#4b2e2e] leading-tight">
                    Elevate Your Tea Experience
                </h2>

                <p className="text-lg md:text-xl poppins-medium-italic text-[#6b4c4c] font-medium">
                    रिश्तों की मिठास, चाय के साथ ख़ास
                </p>

                <button className="bg-[#a0522d] text-white px-6 py-3 rounded-full text-lg hover:bg-[#8b4513] transition">
                    Shop Now
                </button>
            </div>

            <div className="flex justify-center md:justify-end relative z-10">
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
