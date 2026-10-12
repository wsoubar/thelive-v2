import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Reset from './pages/Reset';
import Home from './pages/Home';
import Personagens from './pages/Personagens';
import PersonagemDetalhe from './pages/PersonagemDetalhe';
import Acoes from './pages/Acoes';
import Dados from './pages/Dados';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/personagens" element={<RequireAuth><Personagens /></RequireAuth>} />
          <Route path="/personagens/:id" element={<RequireAuth><PersonagemDetalhe /></RequireAuth>} />
          <Route path="/acoes" element={<RequireAuth><Acoes /></RequireAuth>} />
          <Route path="/chats" element={<RequireAuth><Placeholder title="Chats" /></RequireAuth>} />
          <Route path="/dados" element={<RequireAuth><Dados /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
