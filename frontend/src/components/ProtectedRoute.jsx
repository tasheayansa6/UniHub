import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', fontSize:24 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}
