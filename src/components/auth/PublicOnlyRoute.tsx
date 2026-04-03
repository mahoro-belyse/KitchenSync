import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <AppLoadingScreen />;

  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
