import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsApi, ordersApi, getSessionId } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const SHIPPING_COST = 5.00;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };

    loadProducts();
  }, []);

  const subtotal = getCartTotal(products);
  const orderTotal = subtotal + SHIPPING_COST;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Submit order to backend
      const orderData = {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        cartItems: cartItems,
        sessionId: getSessionId()
      };

      const result = await ordersApi.create(orderData);
      
      // Clear cart and navigate to thank you page with order ID
      await clearCart();
      navigate('/thank-you', { state: { orderId: result.orderId, orderTotal: result.totalAmount } });
    } catch (err) {
      console.error('Failed to submit order:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-50 pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {cartItems.length === 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Your cart is empty. Please add items to your cart before checkout.
          </div>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Form Area (Cols 1 & 2) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div>
                <h2 className="text-xl font-medium text-gray-900">Shipping Information</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="full-name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="123 Pretzel Lane"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-medium text-gray-900">Payment Details</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="•••• •••• •••• 4242"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                      Expiration (MM/YY)
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="12/26"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary (Col 3) */}
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">Order Summary</h2>
              
              {/* Cart Items List */}
              <div className="mt-6 border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Items in Cart</h3>
                <ul className="space-y-3">
                  {cartItems.map((item) => {
                    const product = products.find(p => p.id === item.id);
                    if (!product) return null;
                    return (
                      <li key={item.id} className="flex items-start justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-gray-500">Qty: {item.quantity} × ${parseFloat(product.price).toFixed(2)}</p>
                        </div>
                        <p className="font-medium text-gray-900 ml-4">
                          ${(product.price * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">${SHIPPING_COST.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Order Total</dt>
                  <dd className="text-base font-medium text-gray-900">${orderTotal.toFixed(2)}</dd>
                </div>
              </dl>
              <button
                onClick={handleSubmit}
                disabled={isLoading || cartItems.length === 0}
                className="mt-6 w-full bg-amber-500 text-yellow-900 font-bold py-3 px-4 rounded-md shadow-lg hover:bg-amber-600 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;

