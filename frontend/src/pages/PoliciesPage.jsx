import { useState } from "react";
import { Link } from "react-router-dom";

function PoliciesPage() {
    const [activeTab, setActiveTab] = useState('privacy');

    const policies = [
        { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
        { id: 'terms', label: 'Terms of Service', icon: '📋' },
        { id: 'shipping', label: 'Shipping Policy', icon: '🚚' },
        { id: 'returns', label: 'Returns & Refunds', icon: '↩️' }
    ];

    return (
        <>
            <main className="min-h-screen pt-20 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[#3a1f1f] mb-4">Our Policies</h1>
                        <p className="text-xl text-gray-600">
                            Important information about your rights and our commitments
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-sm p-2">
                        {policies.map((policy) => (
                            <button
                                key={policy.id}
                                onClick={() => setActiveTab(policy.id)}
                                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                                    activeTab === policy.id
                                        ? 'bg-[#8B4513] text-white'
                                        : 'text-gray-600 hover:text-[#8B4513] hover:bg-[#8B4513]/10'
                                }`}
                            >
                                <span>{policy.icon}</span>
                                <span>{policy.label}</span>
                            </button>
                        ))}
                    </div>

                    {}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        {activeTab === 'privacy' && (
                            <div>
                                <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Privacy Policy</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p><strong>Last updated:</strong> January 2025</p>
                                    
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Information We Collect</h3>
                                    <p>We collect information you provide directly to us, such as when you make a purchase, subscribe to our newsletter, or contact us for support.</p>
                                    
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">How We Use Your Information</h3>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Process and fulfill your orders</li>
                                        <li>Send you order confirmations and updates</li>
                                        <li>Provide customer support</li>
                                        <li>Send marketing communications (with your consent)</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Data Security</h3>
                                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                                    
                                    <p className="mt-6">For questions about this policy, contact us at privacy@bandhuchai.com</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'terms' && (
                            <div>
                                <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Terms of Service</h2>
                                <div className="space-y-4 text-gray-700">
                                    <p><strong>Last updated:</strong> January 2025</p>
                                    
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Acceptance of Terms</h3>
                                    <p>By accessing and using our website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                                    
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Products and Services</h3>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>All products are subject to availability</li>
                                        <li>We reserve the right to modify or discontinue products</li>
                                        <li>Prices are subject to change without notice</li>
                                        <li>Product images are for illustration purposes</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Customer Responsibilities</h3>
                                    <p>You agree to provide accurate information and use our services lawfully. Prohibited activities include fraud, spam, or misuse of our platform.</p>
                                    
                                    <p className="mt-6">For questions about these terms, contact us at legal@bandhuchai.com</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div>
                                <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Shipping Policy</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold text-[#3a1f1f]">Processing Time</h3>
                                    <p>Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order ships.</p>
                                    
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Shipping Rates & Delivery Times</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <ul className="space-y-2">
                                            <li><strong>Standard Shipping:</strong> ₹50 (5-7 business days)</li>
                                            <li><strong>Express Shipping:</strong> ₹150 (2-3 business days)</li>
                                            <li><strong>Free Shipping:</strong> On orders above ₹999</li>
                                        </ul>
                                    </div>

                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Shipping Areas</h3>
                                    <p>We currently ship throughout India. International shipping will be available soon.</p>

                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Order Tracking</h3>
                                    <p>You'll receive a tracking number via email once your order ships. Use this to track your package status.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'returns' && (
                            <div>
                                <h2 className="text-2xl font-bold text-[#3a1f1f] mb-6">Returns & Refunds</h2>
                                <div className="space-y-4 text-gray-700">
                                    <h3 className="text-lg font-semibold text-[#3a1f1f]">Return Window</h3>
                                    <p>You have 30 days from the date of delivery to return unopened products for a full refund.</p>
                                    
                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Return Conditions</h3>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Products must be unopened and in original packaging</li>
                                        <li>Include original receipt or order confirmation</li>
                                        <li>Customer responsible for return shipping costs</li>
                                        <li>Opened products cannot be returned for hygiene reasons</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Refund Process</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <ol className="list-decimal list-inside space-y-2">
                                            <li>Contact our support team at support@bandhuchai.com</li>
                                            <li>Receive return authorization and shipping instructions</li>
                                            <li>Ship the product back to us</li>
                                            <li>Refund processed within 5-7 business days after receipt</li>
                                        </ol>
                                    </div>

                                    <h3 className="text-lg font-semibold text-[#3a1f1f] mt-6">Exchanges</h3>
                                    <p>We're happy to exchange products for different sizes or varieties. Contact us to arrange an exchange.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center bg-gradient-to-r from-[#8B4513]/5 to-[#A0522D]/5 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-[#3a1f1f] mb-4">Need Help?</h2>
                        <p className="text-gray-600 mb-6">
                            If you have questions about any of our policies, don't hesitate to reach out.
                        </p>
                        <Link 
                            to="/contact" 
                            className="bg-[#8B4513] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#A0522D] transition-colors duration-300 inline-block"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}

export default PoliciesPage;
