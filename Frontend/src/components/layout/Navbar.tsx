import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import BAPLogo from "../../assets/BAP_Logo.png";
import LogOut from "../logOut/LogOut";
import type { RoleType } from "../../context/auth/authProvider";

interface NavbarProps {
  links: { name: string; href: string; onClick?: () => void }[];
  title: string;
  isLogged: boolean;
  backgroundColor?: string;
  outlineColor?: string;
  onClick?: () => void;
  role?: RoleType;
}

const Navbar: React.FC<NavbarProps> = ({
  links,
  title,
  backgroundColor,
  outlineColor,
  onClick,
  isLogged,
  role,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const lastToggleTime = useRef(0);

  // Use useCallback to prevent unnecessary re-renders
  const toggleMenu = useCallback((): void => {
    // Prevent double-clicks by adding a debounce
    const now = Date.now();
    if (now - lastToggleTime.current < 300) {
      return; // Ignore clicks that happen too quickly
    }
    lastToggleTime.current = now;

    setIsMenuOpen((prev) => !prev);
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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle menu item clicks to close the menu
  const handleMenuItemClick = useCallback((linkOnClick?: () => void) => {
    return () => {
      setIsMenuOpen(false);
      if (linkOnClick) {
        linkOnClick();
      }
    };
  }, []);

  // Logo style to ensure consistent sizing
  const logoStyle = {
    width: "64px",
    height: "64px",
    objectFit: "contain" as const,
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force navigation to homepage regardless of current route
    window.location.href = "/";

    if (onClick) onClick();
  };

  // Add Resources link if logged in and not a sponsor
  let navLinks = [...links];
  const isSponsor =
    (typeof role === "string" && role === "sponsor") ||
    (typeof role === "object" && role !== null && "type" in role && role.type === "sponsor");
  if (isLogged && !isSponsor) {
    navLinks.push({ name: "Resources", href: "/resources" });
  }

  // Move Resources link to the leftmost position if present
  const resourcesIndex = navLinks.findIndex(l => l.name === "Resources");
  if (resourcesIndex > 0) {
    const [resourcesLink] = navLinks.splice(resourcesIndex, 1);
    navLinks.unshift(resourcesLink);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 font-outfit">
      <div
        style={{
          backgroundColor: backgroundColor || "#FFFFFF",
          borderBottom: outlineColor ? `3px solid ${outlineColor}` : "none",
        }}
        className={`text-black transition-transform duration-300 transform ${
          isNavbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between pt-4 pb-4 px-8 sm:px-16 lg:px-24">
          <div
            className="flex items-center"
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <div className="font-medium text-xl flex items-center">
              <img
                src={BAPLogo}
                alt="BAP Logo"
                style={logoStyle}
                className="mr-3"
              />
              <div className="flex flex-col">
                <span className="hidden lg:block text-xl">{title}</span>
                <span className="block lg:hidden text-xl">
                  BAP | Beta Tau Chapter
                </span>
                <span className="block text-sm text-[#AF272F]">
                  Arizona State University
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Change breakpoint to lg */}
          <div className="hidden lg:flex items-center space-x-6 z-10">
            {/* Main navigation links */}
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handleMenuItemClick(link.onClick)}
                  className="hover:text-bapred text-xl font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Login/Logout always on the right */}
            <div className="ml-6">{isLogged ? <LogOut /> : null}</div>
          </div>

          {/* Hamburger button - Change breakpoint to lg */}
          <div className="lg:hidden">
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
        } transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-center items-center 
          w-full sm:w-[300px] right-0 top-0 bottom-0 border-l-bapred sm:border-l-[3px] border-l-0`}
        style={{
          // Apply border color dynamically only when not on small screen
          borderLeftColor: outlineColor || "#AF272F",
        }}
      >
        {/* Close (X) button - always visible when menu is open */}
        <button
          onClick={toggleMenu}
          className="absolute top-6 right-6 text-black focus:outline-none p-1 z-[91]"
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
            {/* Navigation links */}
            {navLinks.map((link) => (
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

            {/* Login/Logout at the bottom of mobile menu */}
            {isLogged && (
              <li className="pt-4 border-t border-gray-200">
                <LogOut />
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
