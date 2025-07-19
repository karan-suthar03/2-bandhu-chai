import { Link } from "react-router-dom";

function FAQPage() {
    const faqs = [
        {
            question: "How do I place an order?",
            answer: "Simply browse our shop, select your favorite teas, choose quantity and size, then add to cart. Follow the checkout process to complete your order."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets for your convenience."
        },
        {
            question: "How long does shipping take?",
            answer: "Orders are typically processed within 1-2 business days. Delivery takes 3-7 business days depending on your location within India."
        },
        {
            question: "Do you ship internationally?",
            answer: "Currently, we only ship within India. International shipping will be available soon."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unopened products. If you're not satisfied, contact us for a full refund or exchange."
        },
        {
            question: "How should I store my tea?",
            answer: "Store tea in a cool, dry place away from direct sunlight and strong odors. Use airtight containers to maintain freshness."
        },
        {
            question: "Are your teas organic?",
            answer: "Yes, all our teas are certified organic and sourced directly from premium tea gardens across India."
        },
        {
            question: "Do you offer bulk/wholesale orders?",
            answer: "Yes, we offer competitive wholesale pricing for bulk orders. Contact our sales team for custom quotes."
        }
    ];

    return (
        <>
            <main className="min-h-screen pt-20 py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[#3a1f1f] mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-gray-600">
                            Find answers to common questions about our teas, orders, and policies
                        </p>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#8B4513]">
                                <h3 className="text-lg font-bold text-[#3a1f1f] mb-3">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center bg-gradient-to-r from-[#8B4513]/5 to-[#A0522D]/5 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-[#3a1f1f] mb-4">Still have questions?</h2>
                        <p className="text-gray-600 mb-6">
                            Can't find what you're looking for? Our customer support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/contact" 
                                className="bg-[#8B4513] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A0522D] transition-colors duration-300 inline-block"
                            >
                                Contact Us
                            </Link>
                            <a 
                                href="mailto:support@bandhuchai.com" 
                                className="border-2 border-[#8B4513] text-[#8B4513] px-6 py-3 rounded-lg font-medium hover:bg-[#8B4513] hover:text-white transition-all duration-300 inline-block"
                            >
                                Email Support
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default FAQPage;
