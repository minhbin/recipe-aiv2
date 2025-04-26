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
                <div className="text-primary font-medium transition-colors flex items-center cursor-pointer">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5286 20 9.14629 19.7356 7.91625 19.2644C7.62208 19.1542 7.47499 19.0991 7.34373 19.0716C7.21247 19.044 7.0866 19.0522 6.96315 19.0962C6.83969 19.1403 6.73502 19.2245 6.52569 19.393L4.2 21.2C3.98712 21.3657 3.88069 21.4485 3.79472 21.4397C3.718 21.4318 3.64582 21.3811 3.60606 21.3051C3.56162 21.2199 3.56162 21.0828 3.56162 20.8086V18.8322C3.56162 18.369 3.56162 18.1374 3.47384 17.9443C3.39665 17.7751 3.27138 17.6332 3.11248 17.5359C2.93361 17.4276 2.70021 17.399 2.23341 17.3419C1.77432 17.2856 1.54477 17.2574 1.35275 17.1958C1.17611 17.1389 1.01854 17.0534 0.882436 16.9439C0.736162 16.8249 0.620088 16.6698 0.387939 16.3595C0.139346 16.0292 0 15.6238 0 15.2C0 10.7817 4.02944 7.2 9 7.2C9.56646 7.2 10.1223 7.24577 10.6634 7.33287M21 5.8C21 8.41974 18.7614 10.6 16 10.6C15.401 10.6 14.8262 10.4957 14.3 10.307L12 12L12.6954 9.55188C12.2779 9.12268 11.9578 8.62955 11.7592 8.09687" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Chat with Chef
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
