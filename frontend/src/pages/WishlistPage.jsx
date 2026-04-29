import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { wishlistAPI, productAPI } from '../services/api';
import { DataContext } from '../context/UserContext';

const WishlistPage = () => {
  const { centerData } = useContext(DataContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

   useEffect(() => {
     if (!centerData) {
       navigate('/login');
       return;
     }

      const fetchWishlist = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await wishlistAPI.getWishlist();
          console.log('Wishlist API response:', response.data);

          const wishlistData = response.data.wishlist;
          console.log('Wishlist data:', wishlistData);

          if (wishlistData && Array.isArray(wishlistData.productIds) && wishlistData.productIds.length > 0) {
            setProducts(wishlistData.productIds);
          } else {
            setProducts([]);
          }
        } catch (err) {
          console.error('Error fetching wishlist:', err);
          console.error('Response error:', err.response?.data);
          setError('Failed to load wishlist: ' + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      };

     fetchWishlist();
   }, [centerData, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Error removing from wishlist: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading wishlist...
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">My Wishlist</h1>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="relative">
                  <ProductCard product={product} />
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;
