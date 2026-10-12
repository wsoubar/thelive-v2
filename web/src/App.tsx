import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import Login from './pages/Login';
import Home from './pages/Home';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/personagens" element={<RequireAuth><Placeholder title="Personagens" /></RequireAuth>} />
          <Route path="/acoes" element={<RequireAuth><Placeholder title="Ações" /></RequireAuth>} />
          <Route path="/chats" element={<RequireAuth><Placeholder title="Chats" /></RequireAuth>} />
          <Route path="/dados" element={<RequireAuth><Placeholder title="Dados d10" /></RequireAuth>} />
          <Route path="/signup" element={<Placeholder title="Criar conta" />} />
          <Route path="/reset" element={<Placeholder title="Recuperar senha" />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
