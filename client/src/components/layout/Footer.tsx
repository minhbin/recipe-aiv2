import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="flex items-center justify-center h-7 w-7 bg-primary text-white rounded-full font-bold text-sm">
              AI
            </div>
            <h2 className="text-xl font-display font-bold">Recipe AI</h2>
          </div>
          <div className="flex space-x-6 text-gray-600">
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">About</div>
            </Link>
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">Privacy</div>
            </Link>
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">Terms</div>
            </Link>
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">Contact</div>
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          © {currentYear} Recipe AI. All rights reserved. Powered by Gemini AI.
        </div>
      </div>
    </footer>
  );
}
