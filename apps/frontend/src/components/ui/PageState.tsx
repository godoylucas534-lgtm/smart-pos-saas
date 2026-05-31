interface PageStateProps {
  message?: string;
}

export function PageLoading({ message = 'Cargando...' }: PageStateProps) {
  return <div className="ui-state-card ui-state-loading">{message}</div>;
}

export function PageError({ message = 'Ocurrio un error inesperado' }: PageStateProps) {
  return <div className="ui-state-card ui-state-error">{message}</div>;
}

export function PageEmpty({ message = 'Sin datos para mostrar' }: PageStateProps) {
  return <div className="ui-state-card ui-state-empty">{message}</div>;
}
