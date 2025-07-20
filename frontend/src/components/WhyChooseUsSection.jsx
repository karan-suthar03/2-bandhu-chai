import backgroundLandPattern from "../assets/background-land-pattern.svg";
import organicIcon from "../assets/icons/organic_icon.svg";
import assamIcon from "../assets/icons/assam-icon.svg";
import healthIcon from "../assets/icons/health-icon.svg";
import naturalTasteIcon from "../assets/icons/natural-taste.svg";
import handpickedIcon from "../assets/icons/handpicked-icon.svg";

function WhyChooseUsSection() {
    const benefits = [
        { icon: organicIcon, text: "100% Organic" },
        { icon: assamIcon, text: "Imported from Assam" },
        { icon: healthIcon, text: "Good for Health" },
        { icon: naturalTasteIcon, text: "Natural Taste" },
        { icon: handpickedIcon, text: "Handpicked Leaves" }
    ];

    return (
        <section className="relative text-center poppins-regular">
            <img
                src={backgroundLandPattern}
                alt="Background Land Pattern"
                className="absolute w-full left-0 object-cover z-[-1] translate-y-[-80%]"
            />

            <div className="px-6 md:px-20 relative z-10 bg-[#9D9221] py-14 shadow-lg">
                <h3 className="text-2xl md:text-3xl font-semibold text-[#3e2f23] mb-10">
                    Why Choose Us?
                </h3>

                <div className="benefits flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-[#5b4636] text-base">
                    {benefits.map((item, index) => (
                        <div key={index} className="flex flex-col items-center transition hover:scale-105">
                            <div className="w-14 h-14 bg-[#f7ebc9] rounded-full p-3 shadow-md flex items-center justify-center mb-3">
                                <img src={item.icon} alt={`${item.text} Icon`} className={`w-10 h-10 ${index === 1 ? 'scale-[0.85]' : ''}`} />
                            </div>
                            <p className="text-[#3e2f23] font-medium">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhyChooseUsSection;
