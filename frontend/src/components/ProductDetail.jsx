import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsApi } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productsApi.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="py-16 sm:py-24 bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {error ? `Error: ${error}` : 'Product not found'}
          </h1>
          <Link to="/products" className="mt-4 inline-block text-amber-600 hover:text-amber-500">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to products link */}
        <Link
          to="/products"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-yellow-800 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Products
        </Link>
        
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
            <img
              src={product.imageLarge}
              alt={`Large view of ${product.name}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mt-6 lg:mt-0">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-yellow-900">${parseFloat(product.price).toFixed(2)}</p>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-base text-gray-600 whitespace-pre-line">
                {product.fullDescription}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-center font-medium"
                />
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="mt-8 w-full flex items-center justify-center bg-amber-500 text-yellow-900 font-bold py-3 px-8 rounded-md shadow-lg hover:bg-amber-600 transition duration-150"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;

