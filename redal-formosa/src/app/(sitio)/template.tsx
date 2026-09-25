// A diferencia del layout, el template se vuelve a montar en cada navegación: dispara la entrada suave de la página.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
