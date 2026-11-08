import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Agenda from './pages/Agenda';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import OrderPage from './pages/Order';
import Orders from './pages/Orders';
import Partners from './pages/Partners';
import ProEdit from './pages/ProEdit';
import ProHome from './pages/ProHome';
import ProOrders from './pages/ProOrders';
import Profile from './pages/Profile';
import Propose from './pages/Propose';
import Publish from './pages/Publish';
import Quote from './pages/Quote';
import Ranking from './pages/Ranking';
import Results from './pages/Results';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="buscar" element={<Results />} />
        <Route path="publicar" element={<Publish />} />
        <Route path="pedidos" element={<Orders />} />
        <Route path="pedidos/:id" element={<OrderPage />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="perfil/:id" element={<Profile />} />
        <Route path="parceiros" element={<Partners />} />
        <Route path="trabalhar" element={<ProHome />} />
        <Route path="trabalhar/oportunidades" element={<Opportunities />} />
        <Route path="trabalhar/oportunidades/:id" element={<Propose />} />
        <Route path="trabalhar/agenda" element={<Agenda />} />
        <Route path="trabalhar/pedidos" element={<ProOrders />} />
        <Route path="trabalhar/pedidos/:id/orcamento" element={<Quote />} />
        <Route path="trabalhar/perfil" element={<ProEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
