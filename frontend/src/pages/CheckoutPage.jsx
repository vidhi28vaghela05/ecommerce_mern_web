import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cartAPI, orderAPI, paymentAPI } from '../services/api';
import { DataContext } from '../context/UserContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_test_key_here');

const CheckoutForm = ({ cart, shippingInfo, handleInputChange, calculateTotal, onSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const total = calculateTotal();
    const tax = total * 0.1;
    const finalAmount = total + tax;

    try {
      // Create payment intent
      const { data } = await paymentAPI.createPaymentIntent(finalAmount, 'inr');
      const { clientSecret, paymentIntentId } = data;

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.zipCode,
            },
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await onSubmit(paymentIntentId);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.message || 'Error processing payment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Shipping Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={shippingInfo.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={shippingInfo.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={shippingInfo.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={shippingInfo.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={shippingInfo.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Zip Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={shippingInfo.zipCode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Payment Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Card Details
              </label>
              <div className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 h-fit">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Order Summary
        </h2>

        <div className="space-y-4 mb-6">
          {cart && cart.items && cart.items.map((item, idx) => {
            const product = item.productId;
            if (!product) return null;
            const discountedPrice =
              product.price - (product.price * product.discount) / 100;
            return (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>{product.name} x {item.quantity}</span>
                <span>₹{(discountedPrice * item.quantity).toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax (10%)</span>
            <span>₹{(calculateTotal() * 0.1).toFixed(2)}</span>
          </div>
          <div className="border-t pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>₹{(calculateTotal() * 1.1).toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!stripe ? 'Loading...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  const { centerData } = useContext(DataContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!centerData) {
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await cartAPI.getCart();
        setCart(response.data.cart);
        setShippingInfo((prev) => ({
          ...prev,
          email: centerData.email,
          fullName: centerData.username,
        }));
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [centerData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const product = item.productId;
      if (product) {
        const discountedPrice =
          product.price - (product.price * product.discount) / 100;
        return total + discountedPrice * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleOrderSubmit = async (paymentIntentId) => {
    // Create order
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id || item.productId,
      quantity: item.quantity,
    }));

    const orderResponse = await orderAPI.createOrder(orderItems);
    const orderId = orderResponse.data.order._id;

    // Confirm payment with order ID
    await paymentAPI.confirmPayment(paymentIntentId, orderId);

    navigate('/order-confirmation', {
      state: { order: orderResponse.data.order },
    });
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
        <Footer />
      </>
    );

  return (
    <Elements stripe={stripePromise}>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>
          <CheckoutForm
            cart={cart}
            shippingInfo={shippingInfo}
            handleInputChange={handleInputChange}
            calculateTotal={calculateTotal}
            onSubmit={handleOrderSubmit}
          />
        </div>
      </div>
      <Footer />
    </Elements>
  );
};

export default CheckoutPage;