import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsApi } from '../services/api';

const Products = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    try {
      await addToCart(productId, 1);
      // Optionally navigate to cart or show a notification
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 bg-white pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-24 bg-white pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600">Error loading products: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Our Signature Pretzels
        </h2>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                <p className="mt-2 text-2xl font-bold text-yellow-900">${parseFloat(product.price).toFixed(2)}</p>
                <p className="mt-2 text-gray-600 text-sm flex-grow">{product.description}</p>
                <div className="mt-6 space-y-3">
                  <Link
                    to={`/products/${product.id}`}
                    className="w-full text-center block bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={(e) => handleAddToCart(e, product.id)}
                    className="w-full bg-amber-500 text-yellow-900 font-bold py-2 px-4 rounded-md hover:bg-amber-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;

