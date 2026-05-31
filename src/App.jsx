import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import PositionsPage from './pages/PositionsPage';
import BuildGamePage from './pages/BuildGamePage';
import MyGamePage from './pages/MyGamePage';
import FavoritesPage from './pages/FavoritesPage';
import TrainingPage from './pages/TrainingPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import CardsPage from './pages/CardsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/map" element={<MapPage />} />
                <Route path="/positions" element={<PositionsPage />} />
                <Route path="/build" element={<BuildGamePage />} />
                <Route path="/my-game" element={<MyGamePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/map" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}