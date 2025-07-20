import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import TopPicksSection from "../components/TopPicksSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import logo from "../assets/logo.svg";

function StatsCounter({ target, duration = 2000, suffix = "" }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [target, duration]);

    return <span>{count}{suffix}</span>;
}

function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 3000);
    };

    return (
        <section className="bg-gradient-to-r from-[#3a1f1f] to-[#2d1816] py-16 px-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-[#e67e22] rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#f7ebc9] rounded-full blur-2xl"></div>
                <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-[#e67e22] rounded-full blur-lg"></div>
            </div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Stay Steeped in Our World
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Subscribe to our newsletter for exclusive tea blends, brewing tips, wellness insights, and special offers delivered to your inbox.
                </p>
                
                {subscribed ? (
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg inline-flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Thank you for subscribing!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            className="flex-1 px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-4 focus:ring-[#e67e22]/30 text-[#3a1f1f] placeholder-gray-500 bg-white"
                        />
                        <button
                            type="submit"
                            className="bg-[#e67e22] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#d35400] transition-all transform hover:scale-105 shadow-lg"
                        >
                            Subscribe
                        </button>
                    </form>
                )}
                
                <div className="flex justify-center items-center space-x-8 mt-12">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#e67e22]">📧</div>
                        <div className="text-sm text-gray-300 mt-1">Weekly Newsletter</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#e67e22]">🎁</div>
                        <div className="text-sm text-gray-300 mt-1">Exclusive Offers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#e67e22]">🫖</div>
                        <div className="text-sm text-gray-300 mt-1">Brewing Tips</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatsSection() {
    return (
        <section className="bg-[#f7ebc9] py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#3a1f1f] mb-4">
                        Our Tea Journey in Numbers
                    </h2>
                    <p className="text-[#5b4636] text-lg max-w-2xl mx-auto">
                        Join thousands of tea lovers who have made 2 Bandhu their trusted tea companion
                    </p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl md:text-5xl font-bold text-[#e67e22] mb-2">
                                <StatsCounter target={15000} suffix="+" />
                            </div>
                            <div className="text-[#3a1f1f] font-semibold mb-1">Happy Customers</div>
                            <div className="text-sm text-[#5b4636]">Across India</div>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl md:text-5xl font-bold text-[#e67e22] mb-2">
                                <StatsCounter target={50} suffix="+" />
                            </div>
                            <div className="text-[#3a1f1f] font-semibold mb-1">Tea Varieties</div>
                            <div className="text-sm text-[#5b4636]">Premium Blends</div>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl md:text-5xl font-bold text-[#e67e22] mb-2">
                                <StatsCounter target={25} suffix="+" />
                            </div>
                            <div className="text-[#3a1f1f] font-semibold mb-1">Years Experience</div>
                            <div className="text-sm text-[#5b4636]">Tea Expertise</div>
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl md:text-5xl font-bold text-[#e67e22] mb-2">
                                <StatsCounter target={99} suffix="%" />
                            </div>
                            <div className="text-[#3a1f1f] font-semibold mb-1">Satisfaction Rate</div>
                            <div className="text-sm text-[#5b4636]">Customer Reviews</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    
    const testimonials = [
        {
            name: "Priya Sharma",
            location: "Mumbai",
            rating: 5,
            text: "The Assam black tea from 2 Bandhu has completely changed my morning routine. The rich, malty flavor is exactly what I was looking for. The quality is consistently excellent!",
            avatar: "PS"
        },
        {
            name: "Rajesh Kumar",
            location: "Delhi",
            rating: 5,
            text: "I've been ordering from 2 Bandhu for over a year now. Their organic green tea is phenomenal, and the customer service is outstanding. Highly recommended!",
            avatar: "RK"
        },
        {
            name: "Anita Patel",
            location: "Pune",
            rating: 5,
            text: "The herbal tea collection is amazing! Each blend is carefully crafted with natural ingredients. My family loves the chamomile tea for evening relaxation.",
            avatar: "AP"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-[#3a1f1f] mb-4">
                    What Our Customers Say
                </h2>
                <p className="text-[#5b4636] text-lg mb-12">
                    Don't just take our word for it - hear from our satisfied tea lovers
                </p>

                <div className="relative">
                    <div className="bg-gradient-to-br from-[#f7ebc9] to-[#e8d5a3] rounded-2xl p-8 md:p-12 shadow-lg">
                        <div className="flex items-center justify-center mb-6">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-6 h-6 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674h4.911c.969 0 1.371 1.24.588 1.81l-3.977 2.89 1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.977-2.89-3.977 2.89c-.784.57-1.838-.197-1.54-1.118l1.518-4.674-3.977-2.89c-.784-.57-.38-1.81.588-1.81h4.911l1.518-4.674z" />
                                </svg>
                            ))}
                        </div>

                        <blockquote className="text-xl md:text-2xl text-[#3a1f1f] mb-8 font-medium italic">
                            "{testimonials[currentTestimonial].text}"
                        </blockquote>

                        <div className="flex items-center justify-center space-x-4">
                            <div className="w-12 h-12 bg-[#e67e22] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {testimonials[currentTestimonial].avatar}
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-[#3a1f1f]">
                                    {testimonials[currentTestimonial].name}
                                </div>
                                <div className="text-[#5b4636] text-sm">
                                    {testimonials[currentTestimonial].location}
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="flex justify-center space-x-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentTestimonial(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    index === currentTestimonial ? 'bg-[#e67e22]' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="bg-gradient-to-r from-[#e67e22] to-[#d35400] py-16 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-24 translate-y-24"></div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Start Your Tea Journey?
                </h2>
                <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                    Discover the perfect blend for every moment. From energizing mornings to peaceful evenings, we have the right tea for you.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        to="/shop"
                        className="bg-white text-[#e67e22] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
                    >
                        Explore Our Collection
                    </Link>
                    <Link 
                        to="/about"
                        className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#e67e22] transition-all transform hover:scale-105 inline-block"
                    >
                        Learn Our Story
                    </Link>
                </div>

                <div className="flex justify-center items-center space-x-8 mt-12">
                    <div className="flex items-center space-x-2 text-orange-100">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zM6 4a1 1 0 000 2v9a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 000-2H6z" />
                        </svg>
                        <span>Free Shipping Above ₹999</span>
                    </div>
                    <div className="flex items-center space-x-2 text-orange-100">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>100% Organic Certified</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LandingPage() {
    return (
        <>
            <HeroSection />
            <WhyChooseUsSection />
            <StatsSection />
            <TopPicksSection />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
            <NewsletterSection />
        </>
    );
}

export default LandingPage;
