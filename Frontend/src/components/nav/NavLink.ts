export const navLinks = [
  { name: "About Us", href: "/about" },
  { name: "Our Sponsors", href: "/sponsors" },
  { name: "Events", href: "/events" },
  { name: "E-Board & Faculty", href: "/eboard-faculty" },
  { name: "Membership", href: "/membership" },
  { name: "Log In", href: "/login" },
];

const navLinksLoggedIn = [
  { name: "Members", href: "/network" },
  { name: "Sponsors", href: "/sponsors-network" },
  { name: "Events", href: "/events" },
  { name: "Dashboard", href: "/admin" },
];

export function getNavLinks(isLoggedIn: boolean) {
  return isLoggedIn ? navLinksLoggedIn : navLinks;
}
