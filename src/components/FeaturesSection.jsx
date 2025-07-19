import healthIcon from "../assets/icons/health-icon.svg";
import handpickedIcon from "../assets/icons/handpicked-icon.svg";
import assamIcon from "../assets/icons/assam-icon.svg";
import organicIcon from "../assets/icons/organic_icon.svg";
import first from "../assets/first.webp";
import second from "../assets/second.avif";
import third from "../assets/third.webp";
import fourth from "../assets/fouth.png";

function FeatureCard({ item, index }) {
    return (
        <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 lg:gap-12`}>
            <div className="w-full md:w-1/2">
                <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl shadow-md"
                    loading="lazy"
                />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left space-y-4">
                <div className="flex justify-center md:justify-start mb-4">
                    <img
                        src={item.icon}
                        alt={`${item.title} Icon`}
                        className="w-12 h-12 p-2 bg-[#f7ebc9] rounded-full shadow-md"
                    />
                </div>
                <h4 className="text-xl lg:text-2xl font-semibold text-[#3a1f1f] poppins-medium">
                    {item.title}
                </h4>
                <p className="text-[#3a1f1f] text-base poppins-regular">
                    {item.description}
                </p>
            </div>
        </div>
    );
}

function FeaturesSection() {
    const features = [
        {
            title: "Naturally Healthy",
            description: "More than just a beverage, our teas are crafted to nourish your body and soul with every sip.",
            icon: healthIcon,
            image: first,
            alt: "Healthy tea leaves",
        },
        {
            title: "Crafted by Masters",
            description: "Our Master Tea Tasters, with over 15 years of expertise, ensure every blend is perfection.",
            icon: handpickedIcon,
            image: second,
            alt: "Master tea taster at work",
        },
        {
            title: "Fresh from Source",
            description: "Sourced directly from Assam's lush gardens, our teas capture the magic of freshly plucked leaves.",
            icon: assamIcon,
            image: third,
            alt: "Assam tea plantation",
        },
        {
            title: "100% All Natural",
            description: "Pure leaves, pure water, pure love—our teas are 100% organic, crafted with nature's finest.",
            icon: organicIcon,
            image: fourth,
            alt: "Organic tea leaves",
        },
    ];

    return (
        <section className="py-16 px-4 sm:px-8 lg:px-24 bg-white relative">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3a1f1f] text-center mb-12 tracking-tight poppins-medium">
                Why Choose 2 Bandhu tea?
            </h3>

            <div className="max-w-6xl mx-auto space-y-16">
                {features.map((item, index) => (
                    <FeatureCard key={index} item={item} index={index} />
                ))}
            </div>
        </section>
    );
}

export default FeaturesSection;
