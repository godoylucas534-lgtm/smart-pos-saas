import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-3">404</h1>
        <p className="text-gray-400 mb-6">La pagina que buscas no existe o fue movida.</p>
        <Link to="/pos" className="inline-block bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-semibold">
          Volver al POS
        </Link>
      </div>
    </div>
  );
}
