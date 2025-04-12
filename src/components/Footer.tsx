import { Vote } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-purple-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <div className="bg-black rounded-full p-2 mr-2">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">BlockVote</span>
            </div>
            <p className="text-gray-600 max-w-xs">
              Revolutionizing democracy through secure, transparent blockchain
              voting technology.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Team
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Get Started</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/login" className="hover:text-indigo-600">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/voter-registration" className="hover:text-indigo-600">
                    Register to Vote
                  </Link>
                </li>
                <li>
                  <Link to="/help&&support" className="hover:text-indigo-600">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; 2025 BlockVote. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-indigo-600">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">
                Terms of Service
              </a>
              <Link to="/voter-registration" className="text-white bg-black hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
