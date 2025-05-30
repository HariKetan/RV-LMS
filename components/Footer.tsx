import Link from "next/link";
import { FaFacebook, FaGithub, FaInstagram, FaSlack, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
              src="/images/Logo-white.png"
              alt="RV College of Engineering Logo"
              className="w-8 h-8 object-contain bg-slate-900 text-slate-300"
              />
              <span className="text-white text-xl font-semibold">
              RV College of Engineering
              </span>
            </div>
            <div className=" rounded-lg p-4 mb-6">
              <p className="text-justify">
              Established in 1963 with three engineering branches namely Civil, Mechanical and Electrical, 
              today RVCE offers 15 Under Graduate Engineering programmes, 14 Master Degree programmes and
              Doctoral Studies. Located 13 km from the heart of Bangalore City – the Silicon Valley of India, 
              on Mysore Road. Sprawling campus spread over an area of 16.85 acres (16 acres & 34 guntas) set 
              in sylvan surroundings. Provides an ideal ambience to stimulate the teaching-learning process, 
              helping in bringing out skilled and disciplined Engineers.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white">
                <FaFacebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white">
                <FaGithub className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Discover Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">DISCOVER</h3>
            <div className="flex flex-col gap-3">
              <Link href="https://www.rvce.edu.in/" className="hover:text-white">
                Home
              </Link>
              <Link href="#" className="hover:text-white">
                About Us
              </Link>
              <Link href="#" className="hover:text-white">
                Gallery
              </Link>
            </div>
          </div>

          {/* Help Center Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">HELP CENTER</h3>
            <div className="flex flex-col gap-3">
              <Link href="#" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white">
                Terms Of Service
              </Link>
              <Link href="#" className="hover:text-white">
                Disclaimer
              </Link>
              <Link href="https://www.rvce.edu.in/contact-us" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>

        
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-400">
          © {new Date().getFullYear()} RVCE™. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
