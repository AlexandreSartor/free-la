# Freela · Criciúma e região

Marketplace de serviços locais com rede de confiança, em React + TypeScript (Vite).
Todos os dados são fictícios e a lógica roda no front-end, com o estado salvo no `localStorage`.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # build de produção em dist/
```

## Estrutura

- `src/data/` dados de exemplo (profissionais, clientes, pedidos, oportunidades, parceiros e ilustrações SVG)
- `src/lib/world.ts` regras do negócio: notas, compatibilidade, ranking, busca, filtros e rede de confiança
- `src/store.ts` estado global (Zustand + Immer, persistido) e todas as ações
- `src/pages/` telas; `src/components/` partes reaproveitadas

## Funcionalidades

- **Contratar**: busca por texto, categorias, região/bairro, filtros (distância, preço, nota, disponibilidade, verificados, certificados, profissional mulher) e ordenação; contratação direta pela agenda do profissional; publicação de pedido com propostas.
- **Pedido**: orçamento → pagamento protegido → conclusão → avaliação dos dois lados, com chat.
- **Rede de confiança**: conexões criadas só por serviços avaliados com nota 4+ dos dois lados; árvore interativa até o nível 3, caminho até cada pessoa e conexões em comum.
- **Trabalhar** (mesma conta): painel, oportunidades com filtros, propostas, orçamentos, agenda e edição de perfil.
- **Ranking** e **Parceiros**.

O usuário logado é fixo (João Pereira, que contrata e presta serviços). Como não há outro usuário real,
as respostas do outro lado são simuladas pelos botões "Simular…". O link "Restaurar dados de exemplo",
no rodapé, volta tudo ao estado inicial.
