import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

export const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 text-white">
              FRACTAL
            </h1>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explora nuestro catálogo y gestiona tus pedidos de manera eficiente
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            <Link 
              to="/products" 
              className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white font-semibold text-lg rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-900/50 text-center"
            >
              Ver Productos
            </Link>
            
            <Link 
              to="/my-orders" 
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-red-600 text-red-600 font-semibold text-lg rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:scale-105 text-center"
            >
              Mis Pedidos
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-4 max-w-3xl mx-auto opacity-20">
            <div className="h-24 bg-red-900 rounded"></div>
            <div className="h-24 bg-red-800 rounded"></div>
            <div className="h-24 bg-red-900 rounded"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};