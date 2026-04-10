import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsApi } from '../services/api';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, isLoading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const SHIPPING_COST = 5.00;

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

  const getCartItemsWithProducts = () => {
    return cartItems.map(item => {
      const product = products.find(p => p.id === item.id);
      return { ...item, product };
    // }).filter(item => item.product); // Only show items where product data is available
    }); // Only show items where product data is available
  };

  const cartItemsWithProducts = getCartItemsWithProducts();
  
  // Debug logging
  useEffect(() => {
    console.log('Cart items:', cartItems);
    console.log('Products:', products);
    console.log('Cart items with products:', cartItemsWithProducts);
  }, [cartItems, products, cartItemsWithProducts]);
  const subtotal = getCartTotal(products);
  const orderTotal = subtotal + SHIPPING_COST;

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, parseInt(newQuantity) || 1);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  if (isLoading || cartLoading) {
    return (
      <section className="py-16 sm:py-24 bg-white pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </section>
    );
  }

  if (cartItemsWithProducts.length === 0) {
    return (
      <section className="py-16 sm:py-24 bg-white pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is empty.</p>
          <Link
            to="/products"
            className="inline-block bg-amber-500 text-yellow-900 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-amber-600 transition duration-150"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 bg-white pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Cart Items List (Col 1 & 2) */}
          <div className="lg:col-span-2">
            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {cartItemsWithProducts.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.imageThumb}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">${parseFloat(item.product.price).toFixed(2)} each</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center space-x-2">
                        <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600">
                          Qty:
                        </label>
                        <input
                          type="number"
                          id={`quantity-${item.id}`}
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-16 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-center"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                to="/products"
                className="text-sm font-medium text-amber-600 hover:text-amber-500"
              >
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary (Col 3) */}
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="bg-gray-50 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium text-gray-900">Order Summary</h2>
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-sm text-gray-600">Shipping (est.)</dt>
                  <dd className="text-sm font-medium text-gray-900">${SHIPPING_COST.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Order Total</dt>
                  <dd className="text-base font-medium text-gray-900">${orderTotal.toFixed(2)}</dd>
                </div>
              </dl>
              <button
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full bg-amber-500 text-yellow-900 font-bold py-3 px-4 rounded-md shadow-lg hover:bg-amber-600 transition duration-150"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;

