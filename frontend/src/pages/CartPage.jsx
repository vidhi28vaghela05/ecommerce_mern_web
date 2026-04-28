import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cartAPI, productAPI } from '../services/api';
import { DataContext } from '../context/UserContext';

const CartPage = () => {
  const { centerData } = useContext(DataContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState({});

  useEffect(() => {
    if (!centerData) {
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await cartAPI.getCart();
        const cartData = response.data.cart;
        setCart(cartData);

        // Fetch product details for all items
        if (cartData && cartData.items) {
          const productDetails = {};
          for (const item of cartData.items) {
            try {
              const prodResponse = await productAPI.getSingleProduct(
                item.productId._id || item.productId
              );
              productDetails[item.productId._id || item.productId] =
                prodResponse.data.product;
            } catch (err) {
              console.error('Error fetching product:', err);
            }
          }
          setProducts(productDetails);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [centerData, navigate]);

  const handleRemoveItem = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      setCart({
        ...cart,
        items: cart.items.filter(
          (item) => (item.productId._id || item.productId) !== productId
        ),
      });
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item from cart');
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.updateQuantity(productId, newQuantity);
      const updatedCart = await cartAPI.getCart();
      setCart(updatedCart.data.cart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const product = products[item.productId._id || item.productId];
      if (product) {
        const discountedPrice =
          product.price - (product.price * product.discount) / 100;
        return total + discountedPrice * item.quantity;
      }
      return total;
    }, 0);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading cart...
        </div>
        <Footer />
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
        <Footer />
      </>
    );

  const cartItems = cart?.items || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link
                to="/products"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {cartItems.map((item) => {
                    const product = products[item.productId._id || item.productId];
                    if (!product) return null;

                    const discountedPrice =
                      product.price - (product.price * product.discount) / 100;

                    return (
                      <div
                        key={item.productId._id || item.productId}
                        className="flex gap-4 p-6 border-b"
                      >
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded"
                          />
                        )}

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {product.description.substring(0, 100)}...
                          </p>

                          <div className="flex gap-4 items-center">
                            <span className="text-xl font-bold text-green-600">
                              ₹{discountedPrice.toFixed(2)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-gray-600">
                              Stock: {product.stock}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <label className="text-gray-700 font-semibold">
                              Qty:
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={product.stock}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.productId._id || item.productId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 px-2 py-1 border rounded"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveItem(
                              item.productId._id || item.productId
                            )
                          }
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

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
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>
                      ₹{(calculateTotal() * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full block bg-blue-600 text-white px-6 py-3 rounded text-center font-semibold hover:bg-blue-700 transition"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/products"
                  className="w-full block mt-3 bg-gray-200 text-gray-800 px-6 py-3 rounded text-center font-semibold hover:bg-gray-300 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;