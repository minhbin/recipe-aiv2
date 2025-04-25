import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <i className="fas fa-utensils text-primary-dark text-xl"></i>
            <h2 className="text-xl font-display font-bold">CulinaryAI</h2>
          </div>
          <div className="flex space-x-6 text-gray-600">
            <Link href="#"><a className="hover:text-primary transition-colors">About</a></Link>
            <Link href="#"><a className="hover:text-primary transition-colors">Privacy</a></Link>
            <Link href="#"><a className="hover:text-primary transition-colors">Terms</a></Link>
            <Link href="#"><a className="hover:text-primary transition-colors">Contact</a></Link>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          © {currentYear} CulinaryAI. All rights reserved. Powered by Gemini AI.
        </div>
      </div>
    </footer>
  );
}
