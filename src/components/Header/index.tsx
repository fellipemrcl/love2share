import Link from "next/link";

const Header = () => {
  return (
    <header>
      <nav className="flex gap-4">
        <Link href="/about" className="text-lg">
          Home
        </Link>
        <Link href="/contact" className="text-lg">
          Contact
        </Link>
        <Link href="/services" className="text-lg">
          Services
        </Link>
        <Link href="/blog" className="text-lg">
          Blog
        </Link>
      </nav>
    </header>
  );
};

export default Header;
