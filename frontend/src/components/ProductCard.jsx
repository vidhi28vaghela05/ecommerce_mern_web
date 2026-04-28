import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      const item = { productId: product._id, quantity: 1 };
      await cartAPI.addToCart(item);
      onAddToCart && onAddToCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setLoading(true);
      await wishlistAPI.addToWishlist(product._id);
      onAddToWishlist && onAddToWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const discountedPrice =
    product.price - (product.price * product.discount) / 100;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48 bg-gray-200">
        {product.images && product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500 line-through">
              ₹{product.price.toFixed(2)}
            </p>
            <p className="text-xl font-bold text-green-600">
              ₹{discountedPrice.toFixed(2)}
            </p>
          </div>
          <p className="text-sm text-gray-600">Stock: {product.stock}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Add Cart'}
          </button>
          <button
            onClick={handleAddToWishlist}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
