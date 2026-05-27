interface PageStateProps {
  message?: string;
}

export function PageLoading({ message = 'Cargando...' }: PageStateProps) {
  return <div className="rounded border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">{message}</div>;
}

export function PageError({ message = 'Ocurrio un error inesperado' }: PageStateProps) {
  return <div className="rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>;
}

export function PageEmpty({ message = 'Sin datos para mostrar' }: PageStateProps) {
  return <div className="rounded border border-gray-700 bg-gray-800 p-4 text-sm text-gray-400">{message}</div>;
}

