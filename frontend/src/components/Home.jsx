import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="relative bg-yellow-800 pt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://placehold.co/1600x900/451a03/fde68a?text=Delicious+Pretzels"
          alt="Close-up of a golden brown salted pretzel"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      {/* Hero Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          The World's Best Pretzels.
        </h1>
        <p className="mt-4 text-lg md:text-xl text-amber-200 max-w-2xl mx-auto">
          Freshly baked, perfectly twisted, and delivered straight to your door. Taste the tradition.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-block bg-amber-500 text-yellow-900 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-amber-400 transition duration-150"
        >
          Shop All Pretzels
        </Link>
      </div>
    </section>
  );
};

export default Home;

