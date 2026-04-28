import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { DataContext } from '../context/UserContext';

const Navbar = () => {
  const { centerData, setCenterData } = useContext(DataContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCenterData(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          ShopHub
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-blue-600">
            Products
          </Link>
          <Link to="/support" className="text-gray-700 hover:text-blue-600">
            Support
          </Link>
          <Link to="/cart" className="text-gray-700 hover:text-blue-600">
            Cart
          </Link>
          <Link to="/wishlist" className="text-gray-700 hover:text-blue-600">
            Wishlist
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {centerData ? (
            <>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600"
              >
                {centerData.username}
              </Link>
              {centerData.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                to="/joinus"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-100 px-4 py-2 space-y-2">
          <Link to="/" className="block text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link
            to="/products"
            className="block text-gray-700 hover:text-blue-600"
          >
            Products
          </Link>
          <Link
            to="/support"
            className="block text-gray-700 hover:text-blue-600"
          >
            Support
          </Link>
          <Link to="/cart" className="block text-gray-700 hover:text-blue-600">
            Cart
          </Link>
          <Link
            to="/wishlist"
            className="block text-gray-700 hover:text-blue-600"
          >
            Wishlist
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
