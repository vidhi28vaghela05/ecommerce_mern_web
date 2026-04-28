import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productAPI, cartAPI } from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getSingleProduct(id);
        setProduct(response.data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const item = { productId: product._id, quantity };
      await cartAPI.addToCart(item);
      alert('Product added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Error adding to cart');
    }
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

  if (!product)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Product not found
        </div>
        <Footer />
      </>
    );

  const discountedPrice =
    product.price - (product.price * product.discount) / 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  {product.images && product.images[selectedImage] && (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  )}
                </div>
                {product.images && (
                  <div className="flex gap-2">
                    {product.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`${product.name} ${idx}`}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 object-cover rounded cursor-pointer ${
                          selectedImage === idx
                            ? 'border-2 border-blue-600'
                            : 'border'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-4">{product.brand}</p>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-green-600">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <span className="bg-red-600 text-white px-3 py-1 rounded">
                        -{product.discount}%
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-700 mb-6">{product.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stock</p>
                    <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} Available` : 'Out of Stock'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">SKU</p>
                    <p className="font-semibold">{product.sku}</p>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-semibold">
                      Quantity:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
