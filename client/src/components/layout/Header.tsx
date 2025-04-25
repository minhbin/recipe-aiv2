import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-utensils text-primary-dark text-2xl"></i>
          <h1 className="text-xl md:text-2xl font-display font-bold">CulinaryAI</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className={`${location === '/' ? 'text-primary font-medium' : 'text-gray-600 font-medium hover:text-primary'} transition-colors`}>
                  Discover
                </a>
              </Link>
            </li>
            <li>
              <Link href="/saved-recipes">
                <a className={`${location === '/saved-recipes' ? 'text-primary font-medium' : 'text-gray-600 font-medium hover:text-primary'} transition-colors`}>
                  Saved Recipes
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
