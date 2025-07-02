import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="text-center py-10">
    <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
    <p className="mb-6">Sorry, the page you're looking for does not exist.</p>
    <Link to="/" className="text-blue-500 underline">Return Home</Link>
  </div>
);

export default NotFound;
