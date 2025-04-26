import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center h-8 w-8 bg-primary text-white rounded-full font-bold text-sm">
            AI
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold">Recipe AI</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <div className="text-primary font-medium transition-colors flex items-center cursor-pointer">
                  <div className="flex items-center justify-center h-5 w-5 mr-1 bg-primary text-white rounded-full font-bold text-[10px]">
                    AI
                  </div>
                  Chat with Recipe AI
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
