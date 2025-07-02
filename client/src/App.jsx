// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import routes from './routes';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  const renderRoutes = (routes) =>
    routes.map(({ path, element, protected: isProtected, children }) => {
      if (isProtected && !isAuthenticated) {
        return <Route key={path} path={path} element={<Navigate to="/login" />} />;
      }

      if (children) {
        return (
          <Route key={path} path={path} element={element}>
            {children.map((child) => (
              <Route key={child.path} path={child.path} element={child.element} />
            ))}
          </Route>
        );
      }

      return <Route key={path} path={path} element={element} />;
    });

  return (
    <BrowserRouter>
      <Routes>{renderRoutes(routes)}</Routes>
    </BrowserRouter>
  );
}

export default App;
