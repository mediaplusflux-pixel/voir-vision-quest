// Aucune protection - accès libre au contenu
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProtectedRoute;