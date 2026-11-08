import type { CatKey, Category, Job, Order, User } from '../lib/types';

/* Dados fictícios. Hoje é sábado, 7 de novembro de 2026. */
export const TODAY = 7;
/* Taxa de proteção: paga só por quem contrata. Quem presta o serviço recebe 100% do valor. */
export const FEE_PCT = 0.05;
export const FEE_FIXED = 5;
/** Compra segurada (opcional, só para quem contrata): percentual extra sobre o valor do serviço. */
export const INSURANCE_PCT = 0.05;

const USER_DEFAULTS: Omit<User, 'id' | 'name' | 'hood'> = {
  provider: false, verified: true, since: '2025', dist: 2, bio: '', cat: 'ger', role: '', years: 0, price: 0, resp: 0,
  now: false, base: 0, busy: [], agenda: {}, certs: [], skills: [], port: []
};

export const CATS: Record<CatKey, Category> = {
  ele:{label:'Elétrica', icon:'bolt', remote:false, ref:[120,200], time:'1 a 2 horas', tip:'Leve resistência reserva, fita isolante e multímetro.'},
  mon:{label:'Montagem de móveis', icon:'tool', remote:false, ref:[150,300], time:'2 a 4 horas', tip:'Confirme o tamanho do móvel e leve parafusadeira e nível.'},
  lim:{label:'Limpeza', icon:'spark', remote:false, ref:[150,250], time:'4 a 8 horas', tip:'Pergunte se a cliente tem produtos ou se você deve levar.'},
  jar:{label:'Jardim', icon:'leaf', remote:false, ref:[100,180], time:'2 a 3 horas', tip:'Pergunte o tamanho da área e se há como descartar a grama.'},
  web:{label:'Sites e design', icon:'layout', remote:true, ref:[600,2500], time:'5 a 15 dias', tip:'Combine as etapas e quantas revisões estão incluídas.'},
  tec:{label:'Tecnologia', icon:'laptop', remote:false, ref:[100,200], time:'1 a 3 horas', tip:'Peça o modelo do equipamento antes de ir.'},
  aul:{label:'Aulas', icon:'cap', remote:true, ref:[60,120], time:'1 hora por aula', tip:'Combine o objetivo do aluno na primeira aula.'},
  eve:{label:'Fotos e eventos', icon:'camera', remote:false, ref:[400,1200], time:'4 horas de evento', tip:'Combine quantas fotos editadas serão entregues.'},
  ger:{label:'Serviços gerais', icon:'wrench', remote:false, ref:[80,350], time:'1 a 4 horas', tip:'Peça fotos do local para levar o material certo.'}
};
const P = (o: Partial<User> & Pick<User, 'id' | 'name' | 'cat' | 'role' | 'hood' | 'dist'> & Record<string, unknown>): User =>
  ({...USER_DEFAULTS, provider: true, verified: true, since: '2024', ...o, agenda: {}, busy: (o.busy as number[]) || []} as User);
export const SEED_PROS: User[] = [
  P({id:'pedro',name:'Pedro Costa',cat:'ele',role:'Eletricista residencial',g:'m',since:'2023',hood:'Pio Corrêa, Criciúma',dist:1.2,rating:4.9,count:87,jobs:96,years:9,price:150,resp:10,now:true,base:2340,busy:[12,19],
    certs:['NR-10 — Segurança em eletricidade','Técnico em Eletrotécnica'],skills:['Chuveiros','Tomadas e iluminação','Quadro de energia','Automação residencial'],
    bio:'Eletricista com 9 anos de experiência em instalações residenciais. Cuido de chuveiros, tomadas, iluminação e quadros de energia, sempre seguindo as normas de segurança.',
    port:['Troca de quadro de energia','Iluminação da sala em LED','Chuveiro 220V instalado']}),
  P({id:'vinicius',name:'Vinícius Rosa',cat:'ele',role:'Eletricista',g:'m',hood:'Centro, Içara',dist:8.4,rating:4.7,count:134,jobs:150,years:12,price:130,resp:25,now:true,base:3100,busy:[9,14],
    certs:['NR-10 — Segurança em eletricidade'],skills:['Chuveiros','Fiação','Disjuntores'],
    bio:'Eletricista há 12 anos. Atendo reparos rápidos, troca de fiação e instalação de disjuntores.',
    port:['Troca de fiação antiga','Instalação de disjuntores','Padrão de entrada']}),
  P({id:'rodrigo',name:'Rodrigo Faria',cat:'mon',role:'Montador de móveis',g:'m',hood:'Santa Bárbara, Criciúma',dist:2.0,rating:4.9,count:156,jobs:203,years:7,price:220,resp:15,base:4180,busy:[12,21],
    certs:['Curso de marcenaria'],skills:['Guarda-roupas','Cozinhas planejadas','Painéis de TV','Prateleiras'],
    bio:'Montador com 7 anos de experiência em guarda-roupas, cozinhas planejadas e painéis de TV. Trabalho com cuidado e deixo tudo limpo no final.',
    port:['Guarda-roupa de 6 portas','Cozinha planejada','Painel de TV com prateleiras']}),
  P({id:'camila',name:'Camila Barros',cat:'mon',role:'Montadora de móveis',g:'f',hood:'Centro, Cocal do Sul',dist:9.6,rating:4.8,count:118,jobs:125,years:5,price:200,resp:20,now:true,base:2900,busy:[14],
    certs:[],skills:['Móveis planejados','Escritórios','Guarda-roupas'],
    bio:'Montadora especializada em móveis planejados e escritórios. Atendo casas e empresas.',
    port:['Escritório completo','Quarto infantil','Estante sob medida']}),
  P({id:'rosana',name:'Rosana Lima',cat:'lim',role:'Diarista',g:'f',hood:'Próspera, Criciúma',dist:1.5,rating:5.0,count:212,jobs:240,years:15,price:180,resp:10,base:3600,busy:[10,13,17],
    certs:[],skills:['Faxina completa','Limpeza pós-obra','Passar roupa'],
    bio:'Diarista há 15 anos. Faxina completa, pós-obra e organização, com produtos próprios se precisar.',
    port:['Limpeza pós-obra','Organização de armários','Faxina completa']}),
  P({id:'jorge',name:'Jorge Lima',cat:'jar',role:'Jardineiro',g:'m',hood:'Rio Maina, Criciúma',dist:3.4,rating:4.8,count:64,jobs:80,years:20,price:120,resp:30,now:true,base:1900,busy:[11],
    certs:['Curso de paisagismo'],skills:['Corte de grama','Poda','Paisagismo'],
    bio:'Jardineiro há 20 anos. Corte de grama, poda e manutenção de jardins residenciais.',
    port:['Jardim vertical','Poda de árvores frutíferas','Quintal renovado']}),
  P({id:'lucas',name:'Lucas Souza',cat:'web',role:'Desenvolvedor web',g:'m',hood:'Atende online',dist:0,rating:4.8,count:42,jobs:45,years:6,price:1200,resp:10,now:true,base:5200,
    certs:['Certificação em desenvolvimento web'],skills:['Sites','Lojas virtuais','Landing pages'],
    bio:'Desenvolvedor web há 6 anos. Crio sites e lojas virtuais rápidos e fáceis de atualizar.',
    port:['Loja virtual de roupas','Site de restaurante','Landing page de curso']}),
  P({id:'bianca',name:'Bianca Nunes',cat:'web',role:'Designer gráfica',g:'f',hood:'Atende online',dist:0,rating:4.9,count:38,jobs:40,years:8,price:600,resp:20,base:3400,busy:[13],
    certs:['Design gráfico'],skills:['Logotipos','Identidade visual','Posts para redes'],
    bio:'Designer gráfica há 8 anos. Crio logotipos, identidade visual e posts para redes sociais.',
    port:['Logo de cafeteria','Identidade de clínica','Posts para loja']}),
  P({id:'paula',name:'Paula Teixeira',cat:'tec',role:'Técnica de informática',g:'f',hood:'Comerciário, Criciúma',dist:1.1,rating:4.7,count:51,jobs:60,years:10,price:120,resp:30,now:true,base:2100,
    certs:['Técnica em informática'],skills:['Formatação','Redes Wi-Fi','Montagem de PC'],
    bio:'Técnica de informática há 10 anos. Formatação, redes Wi-Fi e montagem de computadores.',
    port:['Rede Wi-Fi de escritório','PC gamer montado','Backup e formatação']}),
  P({id:'fernanda',name:'Fernanda Rocha',cat:'aul',role:'Professora de inglês',g:'f',hood:'Atende online',dist:0,rating:4.9,count:29,jobs:310,years:11,price:80,resp:15,base:2800,
    certs:['Certificado de proficiência em inglês'],skills:['Conversação','Inglês para entrevistas','Reforço escolar'],
    bio:'Professora de inglês há 11 anos. Aulas online de conversação, preparação para entrevistas e reforço.',
    port:['Plano de estudos personalizado','Simulado de entrevista','Material de conversação']}),
  P({id:'thiago',name:'Thiago Oliveira',cat:'eve',role:'Fotógrafo de eventos',g:'m',hood:'Michel, Criciúma',dist:1.8,rating:4.8,count:44,jobs:50,years:6,price:600,resp:40,base:2500,busy:[14,21],
    certs:[],skills:['Aniversários','Casamentos','Ensaios'],
    bio:'Fotógrafo de eventos há 6 anos. Aniversários, casamentos e ensaios, com entrega rápida das fotos.',
    port:['Aniversário infantil','Casamento no campo','Ensaio de família']})
];
/* ===== Serviços gerais, mais profissionais e pedidos abertos ===== */
SEED_PROS.push(
  P({id:'sergio',name:'Sérgio Nunes',cat:'ger',role:'Faz-tudo e pequenos reparos',g:'m',hood:'São Luiz, Criciúma',dist:2.3,rating:4.8,count:73,jobs:95,years:14,price:90,resp:15,now:true,base:2200,busy:[10],
    certs:[],skills:['Pequenos reparos','Instalação de suportes','Troca de torneiras','Vedação'],
    bio:'Faz-tudo há 14 anos. Resolvo pequenos reparos, instalo suportes, troco torneiras e faço vedação.',
    port:['Suporte de TV e prateleiras','Troca de torneiras','Reparo de portas']}),
  P({id:'renata',name:'Renata Lopes',cat:'ger',role:'Pintora',g:'f',hood:'Centro, Forquilhinha',dist:11.2,rating:4.9,count:58,jobs:70,years:9,price:350,resp:25,base:3300,busy:[12,13],
    certs:['Curso de pintura imobiliária'],skills:['Pintura de paredes','Textura','Grafiato'],
    bio:'Pintora há 9 anos. Pintura de apartamentos, textura e grafiato, com proteção dos móveis e limpeza no final.',
    port:['Sala pintada em dois tons','Textura em parede de destaque','Fachada de casa']}),
  P({id:'diego',name:'Diego Pires',cat:'ger',role:'Encanador',g:'m',hood:'Centro, Içara',dist:8.1,rating:4.7,count:91,jobs:120,years:11,price:110,resp:20,now:true,base:2700,busy:[11],
    certs:[],skills:['Vazamentos','Desentupimento','Instalação de pias'],
    bio:'Encanador há 11 anos. Vazamentos, desentupimento e instalação de pias e vasos.',
    port:['Troca de sifão','Instalação de pia de cozinha','Caça-vazamento']}),
  P({id:'wagner',name:'Wagner Melo',cat:'ger',role:'Carretos e mudanças',g:'m',hood:'Centro, Morro da Fumaça',dist:16.5,rating:4.6,count:66,jobs:140,years:8,price:150,resp:30,base:3000,busy:[14],
    certs:[],skills:['Carretos','Mudanças pequenas','Descarte de móveis'],
    bio:'Faço carretos, mudanças pequenas e descarte de móveis com caminhonete própria.',
    port:['Mudança de quitinete','Carreto de geladeira','Descarte de sofá']})
);
const J = (o: Partial<Job> & Pick<Job, 'id' | 'clientId' | 'hood' | 'dist' | 'cat' | 'title' | 'desc' | 'budget' | 'day' | 'ago'>): Job =>
  ({status: 'open', proposals: [], others: 0, time: '14h', urgent: false, pub: false, ...o});
export const SEED_JOBS: Job[] = [
  J({id:'j1',clientId:'patricia',hood:'Comerciário, Criciúma',dist:1.4,cat:'ele',title:'Instalar 4 tomadas e um ventilador de teto',desc:'Apartamento novo, já tenho o ventilador.',budget:[150,250],day:9,ago:15,others:2}),
  J({id:'j2',clientId:'rafael',hood:'Centro, Içara',dist:8.3,cat:'ele',title:'Chuveiro desarmando o disjuntor',desc:'Toda vez que ligo o chuveiro, a luz cai.',budget:[100,180],day:7,urgent:true,time:'agora',ago:5,others:1}),
  J({id:'j3',clientId:'condominio',hood:'Centro, Criciúma',dist:0.6,cat:'ger',title:'Pintura do hall de entrada',desc:'Hall de 30 m², cor clara, prédio residencial.',budget:[800,1200],day:16,time:'9h',ago:60,others:3}),
  J({id:'j4',clientId:'luiza',hood:'Pio Corrêa, Criciúma',dist:1.1,cat:'mon',title:'Montar cama box e criado-mudo',desc:'Móveis novos, ainda nas caixas.',budget:[120,200],day:9,time:'10h',ago:25}),
  J({id:'j5',clientId:'bruno',hood:'Michel, Criciúma',dist:2.2,cat:'mon',title:'Instalar painel de TV de 65 polegadas',desc:'Parede de alvenaria, tenho o suporte.',budget:[150,250],day:14,time:'15h',ago:90,others:1}),
  J({id:'j6',clientId:'escritorio',hood:'Centro, Criciúma',dist:0.9,cat:'tec',title:'Configurar Wi-Fi e 6 computadores',desc:'Escritório pequeno, internet nova.',budget:[400,700],day:11,time:'9h',ago:40,others:2}),
  J({id:'j7',clientId:'cecilia',hood:'Rio Maina, Criciúma',dist:3.5,cat:'jar',title:'Corte de grama e poda de 3 árvores',desc:'Quintal de 80 m².',budget:[150,250],day:10,time:'8h',ago:120}),
  J({id:'j8',clientId:'hamburgueria',hood:'Online',dist:0,cat:'web',title:'Cardápio digital e site simples',desc:'Quero receber pedidos pelo celular.',budget:[1000,2000],day:20,time:'a combinar',ago:180,others:4}),
  J({id:'j9',clientId:'sofia',hood:'Online',dist:0,cat:'aul',title:'Aulas de inglês para entrevista de emprego',desc:'Entrevista em 3 semanas.',budget:[60,90],day:12,time:'19h',ago:30}),
  J({id:'j10',clientId:'gabriel',hood:'Centro, Cocal do Sul',dist:9.8,cat:'eve',title:'Fotos de aniversário de 1 ano',desc:'Festa de 4 horas, umas 40 pessoas.',budget:[500,900],day:21,time:'15h',ago:240,others:2}),
  J({id:'j11',clientId:'joana',hood:'Santa Bárbara, Criciúma',dist:2.1,cat:'lim',title:'Faxina completa em apartamento de 2 quartos',desc:'Prefiro que traga os produtos.',budget:[180,250],day:13,time:'8h',ago:50,others:1}),
  J({id:'j12',clientId:'ricardo',hood:'Centro, Forquilhinha',dist:11.0,cat:'ger',title:'Consertar vazamento embaixo da pia',desc:'Está pingando no armário.',budget:[80,150],day:7,urgent:true,time:'agora',ago:10}),
  J({id:'j13',clientId:'atelie',hood:'Online',dist:0,cat:'web',title:'Logotipo e identidade visual',desc:'Ateliê de costura, estilo delicado.',budget:[500,1200],day:18,time:'a combinar',ago:300,others:5}),
  J({id:'j14',clientId:'marcos',hood:'Próspera, Criciúma',dist:1.7,cat:'ger',title:'Carreto de geladeira e sofá',desc:'Do 2º andar com elevador, 5 km.',budget:[150,250],day:14,time:'9h',ago:70}),
  J({id:'j15',clientId:'helena',hood:'Centro, Nova Veneza',dist:14.2,cat:'ele',title:'Trocar fiação de 2 cômodos',desc:'Casa antiga, fiação de pano.',budget:[600,1000],day:17,time:'9h',ago:200,others:1})
];
/* ===== Contas unificadas: quem contrata e quem presta é a mesma pessoa ===== */
SEED_PROS.push(
  P({id:'maria',name:'Maria Santos',cat:'ger',role:'Pintora residencial',g:'f',hood:'Próspera, Criciúma',dist:1.5,years:8,price:300,resp:15,base:2600,busy:[12],since:'2023',
    certs:['Curso de pintura imobiliária'],skills:['Pintura de paredes','Textura','Pequenos reparos'],
    bio:'Pintora há 8 anos. Pinto apartamentos e casas com proteção dos móveis. Também contrato bastante gente pela Freela para a minha casa e o meu ateliê.',
    port:['Apartamento pintado em tons claros','Parede de destaque com textura','Ateliê renovado']}),
  P({id:'carlos',name:'Carlos Mendes',cat:'ger',role:'Pedreiro e reformas',g:'m',hood:'Centro, Içara',dist:8.4,years:16,price:250,resp:30,base:3800,busy:[10,11],since:'2024',
    certs:['Curso de alvenaria e acabamento'],skills:['Pequenas reformas','Assentamento de piso','Reboco'],
    bio:'Pedreiro há 16 anos. Faço pequenas reformas, piso, reboco e acabamento, com limpeza no final.',
    port:['Banheiro reformado','Piso de sala assentado','Muro rebocado']}),
  P({id:'joao',name:'João Pereira',cat:'tec',role:'Técnico de informática',g:'m',hood:'Centro, Criciúma',dist:0.8,years:5,price:110,resp:15,now:true,base:1400,busy:[13],since:'2025',
    certs:['Técnico em informática'],skills:['Formatação','Backup','Redes Wi-Fi'],
    bio:'Técnico de informática há 5 anos. Formato computadores, faço backup e configuro redes. Também uso a Freela para contratar serviços para a minha casa.',
    port:['Backup e formatação','Rede Wi-Fi de escritório','PC gamer montado']}),
  P({id:'bruna',name:'Bruna Farias',cat:'aul',role:'Professora de matemática',g:'f',hood:'Michel, Criciúma',dist:1.9,years:2,price:70,resp:20,verified:false,base:0,since:'2026',
    certs:[],skills:['Reforço escolar'],
    bio:'Estudante de licenciatura em matemática. Dou aulas de reforço para o ensino fundamental e médio. Acabei de ativar meu perfil de prestadora.',
    port:[]})
);
const UU = (o: Pick<User, 'id' | 'name' | 'hood'> & Partial<User>): User =>
  ({...USER_DEFAULTS, provider: false, verified: true, since: '2025', bio: '', dist: 2, ...o, agenda: {}, busy: []});
export const SEED_USERS: User[] = [
  UU({id:'ana',name:'Ana Martins',hood:'Comerciário, Criciúma',bio:'Moro no Comerciário e uso a Freela para cuidar da casa: pintura, jardim e fotos da família.'}),
  UU({id:'marina',name:'Marina Alves',hood:'Centro, Criciúma',since:'2024',bio:'Contrato serviços para o apartamento e para a loja.'}),
  UU({id:'patricia',name:'Patrícia Gomes',hood:'Comerciário, Criciúma'}),
  UU({id:'rafael',name:'Rafael Dias',hood:'Centro, Içara'}),
  UU({id:'condominio',name:'Condomínio Jardim das Flores',hood:'Centro, Criciúma',bio:'Condomínio residencial com 48 apartamentos.'}),
  UU({id:'luiza',name:'Luiza Martins',hood:'Pio Corrêa, Criciúma'}),
  UU({id:'bruno',name:'Bruno Alves',hood:'Michel, Criciúma'}),
  UU({id:'escritorio',name:'Escritório Contábil Lima',hood:'Centro, Criciúma',bio:'Escritório de contabilidade.'}),
  UU({id:'cecilia',name:'Cecília Rocha',hood:'Rio Maina, Criciúma'}),
  UU({id:'hamburgueria',name:'Hamburgueria do Zé',hood:'Centro, Criciúma',bio:'Hamburgueria artesanal.'}),
  UU({id:'sofia',name:'Sofia Mendes',hood:'Santa Bárbara, Criciúma'}),
  UU({id:'gabriel',name:'Gabriel Souza',hood:'Centro, Cocal do Sul'}),
  UU({id:'joana',name:'Joana Prado',hood:'Santa Bárbara, Criciúma'}),
  UU({id:'ricardo',name:'Ricardo Neves',hood:'Centro, Forquilhinha'}),
  UU({id:'atelie',name:'Ateliê Linha Fina',hood:'Próspera, Criciúma',bio:'Ateliê de costura.'}),
  UU({id:'marcos',name:'Marcos Teixeira',hood:'Próspera, Criciúma'}),
  UU({id:'helena',name:'Helena Castro',hood:'Centro, Nova Veneza'})
];
/* Histórico de serviços concluídos e avaliados dos dois lados. É a ÚNICA fonte das notas e das conexões.
   Sem valores nem endereços: só o que as pessoas envolvidas aceitaram tornar público. */
const L = (c: string, p: string, cat: CatKey, title: string, sp: number, tp: string, sc: number, tc: string, date: string): Omit<Order, 'id'> => ({clientId:c, proId:p, cat, title, date, day:null, time:'', price:null, status: 'rated' as const, seed:true, ratePro:{stars:sp, text:tp}, rateClient:{stars:sc, text:tc}, msgs:[], match:null, desc:''});
export const SEED_ORDERS: Order[] = [
  L('joao','pedro','ele','Troca do quadro de energia',5,'Trocou o quadro antigo, explicou cada disjuntor e deixou tudo identificado.',5,'Cliente organizado, deixou o acesso livre e pagou pelo app.','ago/2026'),
  L('rodrigo','joao','tec','Formatação e backup do notebook',5,'Salvou todos os arquivos e devolveu o notebook no mesmo dia.',5,'Cliente claro sobre o que precisava.','set/2026'),
  L('joao','rosana','lim','Faxina completa',5,'Casa impecável, muito cuidadosa.',4,'Bom cliente, só demorou um pouco para abrir a porta.','set/2026'),
  L('joao','diego','ger','Conserto de vazamento',2,'Atrasou dois dias e o vazamento voltou na semana seguinte.',4,'Cliente educado.','jul/2026'),
  L('joao','bianca','web','Logotipo da assistência técnica',5,'Entendeu a ideia na primeira conversa.',5,'Retornos rápidos e objetivos.','jun/2026'),
  L('maria','pedro','ele','Iluminação do ateliê',5,'Instalou toda a iluminação do ateliê com capricho e no prazo.',5,'Excelente cliente, tudo combinado certinho.','out/2026'),
  L('ana','maria','ger','Pintura do apartamento',5,'Pintou o apartamento inteiro sem sujar nada. Recomendo muito.',5,'Cliente atenciosa, deixou os cômodos livres.','out/2026'),
  L('maria','rosana','lim','Limpeza pós-obra do ateliê',5,'Deixou o ateliê pronto para abrir.',5,'Cliente gentil e pontual no pagamento.','set/2026'),
  L('rodrigo','maria','ger','Pintura da sala',5,'Acabamento perfeito.',5,'Cliente tranquilo, explicou bem as cores.','jul/2026'),
  L('marina','maria','ger','Parede de destaque com textura',4,'Ficou bonita, demorou um pouco mais que o previsto.',5,'Cliente educada, explicou tudo e pagou certinho pelo app.','mai/2026'),
  L('pedro','carlos','ger','Reforma do banheiro',5,'Reforma bem feita e entregue no prazo combinado.',5,'Cliente que entende de obra, facilitou tudo.','set/2026'),
  L('luiza','carlos','ger','Reboco do muro',5,'O muro ficou ótimo.',5,'Cliente muito atenciosa.','ago/2026'),
  L('ana','jorge','jar','Corte de grama e poda',5,'O quintal ficou outro.',5,'Cliente simpática e organizada.','set/2026'),
  L('ana','thiago','eve','Fotos do aniversário da filha',5,'Fotos lindas e entregues em 5 dias.',5,'Cliente que sabia exatamente o que queria.','ago/2026'),
  L('patricia','pedro','ele','Instalação de tomadas',5,'Chegou no horário e deixou tudo limpo.',5,'Cliente educada.','jul/2026'),
  L('helena','pedro','ele','Revisão da fiação',4,'Bom serviço, só remarcou uma vez.',5,'Cliente paciente.','jun/2026'),
  L('rafael','vinicius','ele','Troca de disjuntor',4,'Resolveu rápido.',4,'Cliente tranquilo.','ago/2026'),
  L('marcos','vinicius','ele','Instalação de chuveiro',3,'Resolveu, mas cobrou acima do combinado no chat.',5,'Cliente tranquilo.','jul/2026'),
  L('luiza','rodrigo','mon','Montagem de guarda-roupa',5,'Montou um guarda-roupa de 6 portas em 3 horas, tudo alinhado.',5,'Cliente gentil.','set/2026'),
  L('bruno','rodrigo','mon','Painel de TV',5,'Pontual e educado. Ainda recolheu as caixas.',5,'Cliente objetivo.','out/2026'),
  L('escritorio','camila','mon','Estações de trabalho',5,'Montou 12 estações de trabalho num dia.',5,'Empresa organizada.','ago/2026'),
  L('cecilia','camila','mon','Estante sob medida',5,'Muito caprichosa.',4,'Cliente atenciosa.','jun/2026'),
  L('joana','rosana','lim','Faxina mensal',5,'Confiança total, já é a terceira vez.',5,'Cliente excelente.','out/2026'),
  L('marina','rosana','lim','Limpeza pós-obra',5,'Deixou o apartamento impecável depois da reforma.',5,'Cliente educada e pontual.','abr/2026'),
  L('cecilia','jorge','jar','Jardim vertical',5,'Ficou lindo.',5,'Cliente muito querida.','mai/2026'),
  L('helena','jorge','jar','Poda de árvores',4,'Ótimo trabalho, voltarei a chamar.',5,'Cliente educada.','jul/2026'),
  L('hamburgueria','lucas','web','Cardápio digital',5,'Site lindo e entregue antes do prazo.',5,'Cliente com briefing claro.','jun/2026'),
  L('atelie','lucas','web','Loja virtual',4,'Explicou tudo de um jeito simples.',4,'Cliente atenciosa.','abr/2026'),
  L('atelie','bianca','web','Identidade visual',5,'Criativa e rápida.',5,'Cliente com ótimas referências.','mai/2026'),
  L('escritorio','paula','tec','Rede Wi-Fi do escritório',5,'Resolveu o Wi-Fi em meia hora.',5,'Ambiente organizado.','set/2026'),
  L('ricardo','paula','tec','Formatação de computador',4,'Atenciosa e paciente.',3,'Remarcou duas vezes em cima da hora.','jul/2026'),
  L('sofia','fernanda','aul','Aulas de inglês',5,'Passei na entrevista em inglês!',5,'Aluna dedicada.','out/2026'),
  L('bruno','fernanda','aul','Conversação em inglês',5,'Aulas leves e objetivas.',5,'Aluno pontual.','ago/2026'),
  L('gabriel','thiago','eve','Ensaio de família',5,'Muito profissional.',4,'Cliente simpático.','set/2026'),
  L('marcos','sergio','ger','Suporte de TV e prateleiras',5,'Resolveu cinco coisas numa visita só.',5,'Cliente objetivo.','ago/2026'),
  L('ricardo','sergio','ger','Troca de torneiras',4,'Rápido e preço justo.',4,'Cliente tranquilo.','jun/2026'),
  L('condominio','renata','ger','Pintura da garagem',5,'Acabamento perfeito e nada de sujeira.',5,'Síndico organizado.','set/2026'),
  L('helena','renata','ger','Pintura da fachada',5,'Cumpriu o prazo certinho.',5,'Cliente educada.','mai/2026'),
  L('joana','diego','ger','Desentupimento',4,'Bom serviço, chegou no horário.',5,'Cliente atenciosa.','ago/2026'),
  L('rafael','diego','ger','Caça-vazamento',5,'Achou o vazamento sem quebrar a parede.',4,'Cliente tranquilo.','jun/2026'),
  L('marcos','wagner','ger','Carreto de geladeira',5,'Cuidadoso com os móveis.',5,'Cliente organizado.','set/2026'),
  L('luiza','wagner','ger','Mudança pequena',3,'Chegou rápido, mas arranhou o sofá.',5,'Cliente educada.','jul/2026'),
  L('marina','jorge','jar','Corte de grama',5,'Pontual e cuidadoso.',5,'Muito atenciosa. Recomendo como cliente.','mar/2026')
].map((o, i) => ({...o, id: 's' + (i + 1)}));

/* Pedidos que já chegaram para o usuário logado (João) na área de quem trabalha */
const IN = (id: string, clientId: string, title: string, desc: string, day: number, time: string): Order =>
  ({id, clientId, proId: 'joao', cat: 'tec', title, desc, date: null, day, time, price: null, status: 'sent', ratePro: null, rateClient: null,
    msgs: [{from: 'client', text: desc}], match: null});
export const SEED_INCOMING: Order[] = [
  IN('in1', 'patricia', 'Formatar notebook e instalar programas', 'Notebook lento, preciso salvar as fotos antes de formatar.', 10, '14h'),
  IN('in2', 'helena', 'Configurar impressora e Wi-Fi', 'A impressora não conecta no Wi-Fi novo.', 12, '9h')
];

export const SKILLSUG: Record<CatKey, string[]> = {ele:['Chuveiros','Tomadas e iluminação','Quadro de energia','Automação residencial','Fiação'],mon:['Guarda-roupas','Cozinhas planejadas','Painéis de TV','Prateleiras','Escritórios'],lim:['Faxina completa','Limpeza pós-obra','Passar roupa','Organização'],jar:['Corte de grama','Poda','Paisagismo','Jardim vertical'],web:['Sites','Lojas virtuais','Landing pages','Logotipos'],tec:['Formatação','Redes Wi-Fi','Montagem de PC','Backup'],aul:['Conversação','Inglês para entrevistas','Reforço escolar'],eve:['Aniversários','Casamentos','Ensaios'],ger:['Pequenos reparos','Pintura de paredes','Vazamentos','Carretos','Instalação de suportes']};
export const CITIES = ['Criciúma','Içara','Forquilhinha','Cocal do Sul','Morro da Fumaça','Nova Veneza','Siderópolis','Urussanga'];
export const CRI_HOODS = ['Centro','Pio Corrêa','Comerciário','Michel','Santa Bárbara','Próspera','São Luiz','Rio Maina'];
/** Usuário logado. Uma conta só para contratar e trabalhar. */
export const ME = 'joao';
