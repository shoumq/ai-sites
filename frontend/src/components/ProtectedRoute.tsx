import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "../app/hooks";

export default function ProtectedRoute({ children }: { children: ReactElement }): ReactElement {
  const token = useAppSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
