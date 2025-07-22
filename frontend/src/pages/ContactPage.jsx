import { useState } from 'react';

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <main className="min-h-screen pt-20 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    {}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-[#3a1f1f] mb-4">Contact Us</h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16">
                        {}
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all duration-300"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all duration-300"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all duration-300 cursor-pointer"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Support</option>
                                        <option value="product">Product Question</option>
                                        <option value="shipping">Shipping & Delivery</option>
                                        <option value="wholesale">Wholesale Inquiry</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent outline-none transition-all duration-300 resize-vertical"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#8B4513] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#A0522D] transition-colors duration-300 focus:ring-2 focus:ring-[#8B4513] focus:ring-offset-2"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {}
                        <div className="space-y-8">
                            {}
                            <div className="bg-gradient-to-br from-[#8B4513]/10 to-[#A0522D]/10 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Get in Touch</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="text-2xl">📍</div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 mb-1">Address</h3>
                                            <p className="text-gray-600">
                                                Ganesh Peth, Near Shrimant Dagdusheth<br/>
                                                Halwai Ganpati Mandir, Pune-411002
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="text-2xl">📞</div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 mb-1">Phone</h3>
                                            <p className="text-gray-600">Siddhant - 8805635049</p>
                                            <p className="text-gray-600">Om - 8530547606</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="text-2xl">📧</div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 mb-1">Email</h3>
                                            <p className="text-gray-600">info@bandhuchai.com</p>
                                            <p className="text-gray-600">support@bandhuchai.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="text-2xl">⏰</div>
                                        <div>
                                            <h3 className="font-medium text-gray-800 mb-1">Business Hours</h3>
                                            <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                            <p className="text-gray-600">Saturday: 9:00 AM - 4:00 PM</p>
                                            <p className="text-gray-600">Sunday: Closed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-3xl mb-3">🛒</div>
                                    <h3 className="font-bold text-[#3a1f1f] mb-2">Order Support</h3>
                                    <p className="text-gray-600 text-sm mb-3">Need help with your order?</p>
                                    <button className="text-[#8B4513] font-medium hover:underline cursor-pointer">
                                        Get Order Help
                                    </button>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-3xl mb-3">🌿</div>
                                    <h3 className="font-bold text-[#3a1f1f] mb-2">Product Info</h3>
                                    <p className="text-gray-600 text-sm mb-3">Questions about our teas?</p>
                                    <button className="text-[#8B4513] font-medium hover:underline cursor-pointer">
                                        Learn More
                                    </button>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-3xl mb-3">🚚</div>
                                    <h3 className="font-bold text-[#3a1f1f] mb-2">Shipping Info</h3>
                                    <p className="text-gray-600 text-sm mb-3">Track your delivery</p>
                                    <button className="text-[#8B4513] font-medium hover:underline cursor-pointer">
                                        Track Order
                                    </button>
                                </div>

                                <div className="bg-white rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-3xl mb-3">🤝</div>
                                    <h3 className="font-bold text-[#3a1f1f] mb-2">Wholesale</h3>
                                    <p className="text-gray-600 text-sm mb-3">Bulk order inquiries</p>
                                    <button className="text-[#8B4513] font-medium hover:underline cursor-pointer">
                                        Contact Sales
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="mt-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-[#3a1f1f] mb-4">Frequently Asked Questions</h2>
                            <p className="text-gray-600">Quick answers to common questions</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="font-bold text-[#3a1f1f] mb-3">How do I track my order?</h3>
                                <p className="text-gray-600">
                                    Once your order ships, you'll receive a tracking number via email. 
                                    You can use this to track your package on our website or the carrier's site.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="font-bold text-[#3a1f1f] mb-3">What is your return policy?</h3>
                                <p className="text-gray-600">
                                    We offer a 30-day return policy for unopened products. 
                                    If you're not satisfied, contact us for a full refund or exchange.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="font-bold text-[#3a1f1f] mb-3">Do you offer wholesale pricing?</h3>
                                <p className="text-gray-600">
                                    Yes! We offer competitive wholesale pricing for bulk orders. 
                                    Contact our sales team for custom quotes and pricing tiers.
                                </p>
                            </div>

                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="font-bold text-[#3a1f1f] mb-3">How should I store my tea?</h3>
                                <p className="text-gray-600">
                                    Store tea in a cool, dry place away from light and strong odors. 
                                    Use airtight containers to maintain freshness and flavor.
                                </p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="mt-20">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#3a1f1f] mb-4">Visit Our Location</h2>
                            <p className="text-gray-600">Come visit us at our store near Shrimant Dagdusheth Halwai Ganpati Mandir</p>
                        </div>
                        <div className="rounded-xl overflow-hidden shadow-lg">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2761097809484!2d73.85354157603679!3d18.516420782576304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c06fa5b442ff%3A0x9df365f5b648bce1!2sShrimant%20Dagdusheth%20Halwai%20Ganpati%20Mandir!5e0!3m2!1sen!2sin!4v1753176508034!5m2!1sen!2sin" 
                                width="100%" 
                                height="400" 
                                style={{border: 0}} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Bandhu Chai Location - Near Shrimant Dagdusheth Halwai Ganpati Mandir, Pune"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default ContactPage;
