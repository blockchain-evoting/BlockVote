import { Vote, Menu, X, Home, Info, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", icon: <Home className="h-6 w-6" />, label: "Home" },
    { path: "/features", icon: <Info className="h-6 w-6" />, label: "Features" },
    { path: "/elections", label: "Elections" },
    { path: "/results", label: "Results" },
    { path: "/help-support", icon: <HelpCircle className="h-6 w-6" />, label: "Help & Support" },
  ];

  return (
    <header className="container bg-white mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-black rounded-full p-2 mr-2">
            <Vote className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">BlockVote</span>
        </div>
        
        <nav className="hidden md:flex space-x-8 border p-1 px-2 rounded-lg items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-2 ${
                isActive(link.path)
                  ? "text-purple-600 bg-white rounded-lg shadow-lg p-2"
                  : "text-gray-700 hover:text-indigo-600 transition-colors"
              }`}
            >
              {link.icon && link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="md:flex items-center">
          <Link
            to="/login"
            className="text-gray-50 hover:scale-105 bg-black px-4 py-2 border border-gray-300 rounded-lg"
          >
            Login
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-2 ${
                isActive(link.path)
                  ? "text-purple-600 bg-white rounded-lg shadow-lg p-2"
                  : "text-gray-700 hover:text-indigo-600 transition-colors"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon && link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          <Link
            to="/login"
            className="text-gray-50 hover:scale-105 bg-black px-4 py-2 border border-gray-300 rounded-lg inline-block text-center"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
