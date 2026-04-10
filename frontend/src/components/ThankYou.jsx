import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ThankYou = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderTotal = location.state?.orderTotal;

  return (
    <section className="py-32 sm:py-48 bg-white pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Thank you for your order!
        </h1>
        {orderId && (
          <p className="mt-2 text-lg text-gray-600">
            Your order #{orderId} has been confirmed.
          </p>
        )}
        {orderTotal && (
          <p className="mt-1 text-lg font-semibold text-gray-900">
            Total: ${parseFloat(orderTotal).toFixed(2)}
          </p>
        )}
        <p className="mt-2 text-lg text-gray-600">
          A confirmation email has been sent to your inbox.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-amber-500 text-yellow-900 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-amber-600 transition duration-150"
        >
          Shop Again
        </Link>
      </div>
    </section>
  );
};

export default ThankYou;

