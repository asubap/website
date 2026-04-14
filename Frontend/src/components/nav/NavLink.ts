export type NavItem = {
  name: string;
  href?: string;
  onClick?: () => void;
  children?: { name: string; href: string }[];
};

export const navLinks: NavItem[] = [
  { name: "About Us", href: "/about" },
  { name: "Our Sponsors", href: "/sponsors" },
  { name: "Events", href: "/events" },
  { name: "E-Board & Faculty", href: "/eboard-faculty" },
  { name: "Membership", href: "/membership" },
  { name: "Log In", href: "/login" },
];

const navLinksLoggedIn: NavItem[] = [
  {
    name: "Network",
    children: [
      { name: "Members", href: "/network" },
      { name: "Alumni", href: "/alumni" },
      { name: "Eboard", href: "/eboard-network" },
    ],
  },
  { name: "Sponsors", href: "/sponsors-network" },
  { name: "Events", href: "/events" },
  { name: "Dashboard", href: "/admin" },
];

export function getNavLinks(isLoggedIn: boolean) {
  return isLoggedIn ? navLinksLoggedIn : navLinks;
}
