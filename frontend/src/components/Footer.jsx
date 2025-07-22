import { Link } from 'react-router-dom';
import instagramIcon from '../assets/icons/3463469_instagram_social media_social_network_icon.svg';
import facebookIcon from '../assets/icons/3463465_facebook_media_network_social_icon (1).svg';
import twitterIcon from '../assets/icons/3463480_media_network_social_twitter_icon.svg';

function Footer() {
    return (
        <footer className="bg-[#3a1f1f] text-white py-12 px-4 sm:px-8 lg:px-24">
            <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                <div className="space-y-4">
                    <h4 className="text-lg font-semibold poppins-medium">2 Bandhu Tea</h4>
                    <p className="text-sm poppins-regular">
                        Crafting pure, organic teas from the lush estates of Assam, brewed with love and tradition.
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold poppins-medium mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm poppins-regular">
                        <li><Link to="/shop" className="hover:text-[#e67e22] transition cursor-pointer">Shop</Link></li>
                        <li><Link to="/about" className="hover:text-[#e67e22] transition cursor-pointer">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-[#e67e22] transition cursor-pointer">Contact</Link></li>
                        <li><Link to="/faq" className="hover:text-[#e67e22] transition cursor-pointer">FAQ</Link></li>
                        <li><Link to="/policies" className="hover:text-[#e67e22] transition cursor-pointer">Policies</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-semibold poppins-medium mb-4">Get in Touch</h4>
                    <p className="text-sm poppins-regular mb-2">Email: support@2bandhutea.com</p>
                    <p className="text-sm poppins-regular mb-4">Siddhant - 8805635049 | Om - 8530547606</p>
                    <div className="flex gap-4">
                        <a href="https://facebook.com/2bandhutea" className="hover:text-[#e67e22] transition">
                            <img src={facebookIcon} alt="Facebook" className="w-6 h-6 invert scale-[1.2]" />
                        </a>
                        <a href="https://instagram.com/2bandhutea" className="hover:text-[#e67e22] transition">
                            <img src={instagramIcon} alt="Instagram" className="w-6 h-6 invert scale-[1.2]" />
                        </a>
                        <a href="https://twitter.com/2bandhutea" className="hover:text-[#e67e22] transition">
                            <img src={twitterIcon} alt="Twitter" className="w-6 h-6 invert scale-[1.2]" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="text-center mt-8 text-sm poppins-regular">
                &copy; {new Date().getFullYear()} 2 Bandhu Tea. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
