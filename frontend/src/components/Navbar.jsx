import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.svg";
import title from "../assets/title.svg";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();

  const navLinks = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Shop", href: "/shop", icon: "🛍️" },
    { name: "About", href: "/about", icon: "ℹ️" },
    { name: "Contact", href: "/contact", icon: "📞" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-r from-[#f7ebc9] via-[#f4e6b7] to-[#f7ebc9] shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <div className="relative flex items-center space-x-2">
              <img
                src={logo}
                alt="2 Bandhu Tea Logo"
                className="h-12 w-12 transition-transform duration-300 group-hover:scale-110"
              />
              <img
                src={title}
                alt="2 Bandhu Title"
                className="h-12 w-auto"
              />
              <div className="absolute inset-0 rounded-full bg-[#e67e22] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          </Link>

          {}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                  location.pathname === link.href
                    ? "text-[#e67e22] bg-[#e67e22]/10"
                    : "text-[#3a1f1f] hover:text-[#e67e22] hover:bg-[#e67e22]/5"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-base">{link.icon}</span>
                  <span>{link.name}</span>
                </span>
                {location.pathname === link.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-[#e67e22] rounded-full"></div>
                )}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e67e22]/5 to-[#d35400]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </div>

          {}
          <div className="flex items-center space-x-4">
            {}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-[#3a1f1f] hover:text-[#e67e22] hover:bg-[#e67e22]/10 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#e67e22] to-[#d35400] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-pulse">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="md:hidden p-2 rounded-lg text-[#3a1f1f] hover:text-[#e67e22] hover:bg-[#e67e22]/10 transition-all duration-300 group"
              aria-label="Toggle navigation menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isOpen ? "rotate-45 top-3" : "top-1"
                  }`}
                ></span>
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isOpen ? "opacity-0" : "top-3"
                  }`}
                ></span>
                <span
                  className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                    isOpen ? "-rotate-45 top-3" : "top-5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-6 space-y-3 bg-white/95 backdrop-blur-md rounded-xl mx-4 mb-4 shadow-lg border border-[#e67e22]/20">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                  location.pathname === link.href
                    ? "text-[#e67e22] bg-[#e67e22]/10"
                    : "text-[#3a1f1f] hover:text-[#e67e22] hover:bg-[#e67e22]/5"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
                {location.pathname === link.href && (
                  <div className="ml-auto w-2 h-2 bg-[#e67e22] rounded-full"></div>
                )}
              </Link>
            ))}
            
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
