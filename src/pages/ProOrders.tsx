import { OrderRow } from '../components/common';
import { first } from '../lib/format';
import { useWorld } from '../store';

export default function ProOrders() {
  const w = useWorld(), list = w.orders.filter(o => o.proId === w.meId).reverse();
  return <>
    <h1 style={{fontSize: 28}}>Pedidos de {first(w.me.name)}</h1>
    {list.length ? list.map(o => <OrderRow key={o.id} o={o} />) : <div className="empty">Nenhum pedido ainda. Quando um cliente contratar você, ele aparece aqui.</div>}
  </>;
}
