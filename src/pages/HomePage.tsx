import {Link} from 'react-router-dom';
import {Footer} from '../components/Footer';

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Pagina Principal</h1>
          <Link to="/my-orders" className="text-blue-500 hover:underline">Fractal</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};