import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const bookHref = user
    ? '/customer/book-appointment'
    : '/login?redirect=/customer/book-appointment';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cosmetology Booking App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Book your beauty appointments with ease
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to={bookHref}
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 text-base bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500"
            >
              Book Now
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 text-base bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400"
            >
              View Services
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Browse Services</h3>
            <p className="text-gray-600">Explore our wide range of beauty services</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">Schedule appointments in just a few clicks</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Expert Staff</h3>
            <p className="text-gray-600">Professional cosmetologists at your service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
