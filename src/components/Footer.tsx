export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-6 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400">
          <span className="text-red-500 font-semibold">JEAN PAOL CHILON SALAZAR</span> POSTULANTE A DESARROLLADOR (FRACTAL)
        </p>
        <p className="text-gray-500 text-sm mt-2">
          &copy; {currentYear}
        </p>
      </div>
    </footer>
  );
};