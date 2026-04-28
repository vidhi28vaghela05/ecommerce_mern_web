import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Order not found</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-4xl font-bold text-green-600 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed and
              will be shipped soon.
            </p>

            <div className="bg-gray-100 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="font-semibold text-lg">{order._id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order Date</p>
                  <p className="font-semibold text-lg">
                    {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                <div className="space-y-2">
                  {order.items && order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-gray-700"
                    >
                      <span>
                        Product {idx + 1} (Qty: {item.quantity})
                      </span>
                      <span>₹{(item.total || item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.totalbill.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-gray-600 text-sm mb-2">Status</p>
                  <p className={`inline-block px-4 py-2 rounded text-white ${
                    order.status === 'pending' ? 'bg-yellow-600' :
                    order.status === 'confirmed' ? 'bg-blue-600' :
                    order.status === 'shipped' ? 'bg-purple-600' :
                    order.status === 'delivered' ? 'bg-green-600' :
                    'bg-gray-600'
                  }`}>
                    {order.status?.toUpperCase() || 'PENDING'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to="/profile"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t text-gray-600 text-sm">
              <p>A confirmation email has been sent to your registered email.</p>
              <p>You can track your order status in your account dashboard.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;
