import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import BAPLogo from "../../assets/BAP_Logo.png";

interface NavbarProps {
  links: { name: string; href: string; onClick?: () => void }[];
  title: string;
  backgroundColor?: string;
  outlineColor?: string;
  onClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  links,
  title,
  backgroundColor,
  outlineColor,
  onClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const lastToggleTime = useRef(0);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Use useCallback to prevent unnecessary re-renders
  const toggleMenu = useCallback((): void => {
    // Prevent double-clicks by adding a debounce
    const now = Date.now();
    if (now - lastToggleTime.current < 300) {
      return; // Ignore clicks that happen too quickly
    }
    lastToggleTime.current = now;

    setIsMenuOpen((prev) => !prev);

    // Prevent scrolling when menu is open
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Handle scroll events to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop.current) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        document.body.style.overflow = "";
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clean up overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle menu item clicks to close the menu
  const handleMenuItemClick = useCallback((linkOnClick?: () => void) => {
    return () => {
      setIsMenuOpen(false);
      document.body.style.overflow = "";
      if (linkOnClick) {
        linkOnClick();
      }
    };
  }, []);

  // Logo style to ensure consistent sizing
  const logoStyle = {
    width: "40px",
    height: "40px",
    objectFit: "contain" as const,
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        style={{
          backgroundColor: backgroundColor || "#FFFFFF",
          borderBottom: outlineColor ? `2px solid ${outlineColor}` : "none",
        }}
        className={`text-black transition-transform duration-300 transform ${
          isNavbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between pt-4 pb-4 px-4 sm:px-8 lg:px-12">
          <div
            className="flex items-center"
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
          >
            <Link to="/" className="font-semibold text-xl flex items-center">
              <img
                src={BAPLogo}
                alt="BAP Logo"
                style={logoStyle}
                className="mr-3"
              />
              <span className="block md:hidden">BAP</span>
              <span className="hidden md:block">{title}</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-6 z-10">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={link.onClick}
                className="hover:text-bapred transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
          {/* Hamburger button - always visible on mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-black focus:outline-none p-1"
              aria-label="Open menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu - with responsive behavior */}
      <div
        ref={menuRef}
        className={`fixed bg-white text-black z-[90] transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-center items-center`}
        style={{
          width: isSmallScreen ? "100%" : "300px",
          right: 0,
          left: isSmallScreen ? 0 : "auto",
          top: 0,
          bottom: 0,
          borderLeft:
            !isSmallScreen && outlineColor
              ? `1px solid ${outlineColor}`
              : "none",
        }}
      >
        {/* Close (X) button - appears with the menu */}
        <button
          onClick={toggleMenu}
          className="absolute top-8 right-8 text-black focus:outline-none"
          aria-label="Close menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col space-y-8 p-4 items-center pt-20">
          <ul className="space-y-8 text-center text-xl">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  onClick={handleMenuItemClick(link.onClick)}
                  className="hover:text-bapred text-xl font-medium"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;