import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartItemCount();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Store Name */}
          <Link to="/" className="text-2xl font-bold text-yellow-900">
            🥨 Pretzel Store
          </Link>
          
          {/* Navigation Links (Desktop) */}
          <div className="hidden sm:flex sm:items-center sm:space-x-6">
            <Link to="/" className="text-gray-600 hover:text-yellow-800 font-medium rounded-md px-3 py-2 text-sm">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-yellow-800 font-medium rounded-md px-3 py-2 text-sm">
              Products
            </Link>
            {/* Cart Link (Desktop) */}
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center space-x-2 bg-amber-500 text-yellow-900 font-semibold px-4 py-2 rounded-full hover:bg-amber-600 transition duration-150"
            >
              {/* Cart Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span className="text-sm">Cart ({cartCount})</span>
            </button>
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="sm:hidden flex items-center space-x-2">
            {/* Cart Link (Mobile) */}
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center space-x-1.5 bg-amber-500 text-yellow-900 font-semibold px-3 py-2 rounded-full hover:bg-amber-600 transition duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span className="text-sm">({cartCount})</span>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-yellow-800 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              aria-label="Open main menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`${isMobileMenuOpen ? '' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-4 space-y-1">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="block text-gray-600 hover:bg-amber-50 hover:text-yellow-800 font-medium rounded-md px-3 py-2 text-base"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={handleLinkClick}
              className="block text-gray-600 hover:bg-amber-50 hover:text-yellow-800 font-medium rounded-md px-3 py-2 text-base"
            >
              Products
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

