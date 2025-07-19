import { Link } from "react-router-dom";

function AboutPage() {
    return (
        <>
            <main className="min-h-screen pt-20 py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[#3a1f1f] mb-4">About Bandhu Chai</h1>
                        <p className="text-xl text-gray-600">
                            Premium tea from the heart of India
                        </p>
                    </div>

                    {}
                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        <div>
                            <h2 className="text-2xl font-bold text-[#3a1f1f] mb-4">Who We Are</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Bandhu Chai is a premium tea company dedicated to bringing authentic Indian tea 
                                directly from gardens to your cup. Founded with a passion for quality and tradition, 
                                we source the finest teas from renowned regions across India.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Our commitment to excellence ensures that every cup delivers the perfect balance 
                                of flavor, aroma, and quality that tea lovers deserve.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#3a1f1f] mb-4">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                To provide exceptional tea experiences while supporting sustainable farming 
                                practices and fair trade with our partner gardens.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center text-gray-700">
                                    <span className="text-[#8B4513] mr-2">✓</span>
                                    Premium quality teas
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="text-[#8B4513] mr-2">✓</span>
                                    Sustainable sourcing
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="text-[#8B4513] mr-2">✓</span>
                                    Direct from gardens
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="text-[#8B4513] mr-2">✓</span>
                                    Fair trade practices
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="bg-gradient-to-r from-[#8B4513]/5 to-[#A0522D]/5 rounded-xl p-8 mb-16">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-[#8B4513] mb-2">25+</div>
                                <div className="text-gray-600">Years Experience</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#8B4513] mb-2">50+</div>
                                <div className="text-gray-600">Partner Gardens</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#8B4513] mb-2">100+</div>
                                <div className="text-gray-600">Tea Varieties</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#8B4513] mb-2">50K+</div>
                                <div className="text-gray-600">Happy Customers</div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Get In Touch</h2>
                        <div className="space-y-2 text-gray-700 mb-8">
                            <p>📧 info@bandhuchai.com</p>
                            <p>📞 +91 12345 67890</p>
                            <p>📍 Assam, India</p>
                        </div>
                        <Link 
                            to="/shop"
                            className="bg-[#8B4513] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#A0522D] transition-colors duration-300 inline-block"
                        >
                            Shop Our Teas
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}

export default AboutPage;
