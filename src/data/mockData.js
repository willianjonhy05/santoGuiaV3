export const MOCK_CHURCHES = [
  {
    id: '1',
    name: 'Catedral Metropolitana de Nossa Senhora das Dores',
    address: 'Praça Saraiva, Centro, Teresina - PI',
    distance: 1.2,
    masses: ['07:00', '12:00', '18:00'],
  },
  {
    id: '2',
    name: 'Paróquia Nossa Senhora de Fátima',
    address: 'Av. Nossa Senhora de Fátima, Teresina - PI',
    distance: 2.8,
    masses: ['06:30', '17:30', '19:00'],
  },
  {
    id: '3',
    name: 'Igreja São Benedito',
    address: 'Av. Frei Serafim, Centro, Teresina - PI',
    distance: 3.1,
    masses: ['07:00', '11:30', '18:00'],
  },
  {
    id: '4',
    name: 'Paróquia Cristo Rei',
    address: 'Bairro Cristo Rei, Teresina - PI',
    distance: 4.4,
    masses: ['07:00', '18:30'],
  },
  {
    id: '5',
    name: 'Paróquia São Cristóvão',
    address: 'Bairro São Cristóvão, Teresina - PI',
    distance: 5.6,
    masses: ['06:30', '17:00', '19:00'],
  },
];

export const MOCK_NEWS = [
  {
    id: '1',
    title: 'Arquidiocese divulga programação pastoral da semana',
    date: '17 jul. 2026',
  },
  {
    id: '2',
    title: 'Comunidades se preparam para celebrações especiais',
    date: '16 jul. 2026',
  },
  {
    id: '3',
    title: 'Ação solidária reúne paróquias de Teresina',
    date: '15 jul. 2026',
  },
];

export const MOCK_MASSES = [
  { id: '1', time: '17:30', churchName: 'Paróquia Nossa Senhora de Fátima', distance: 2.8 },
  { id: '2', time: '18:00', churchName: 'Igreja São Benedito', distance: 3.1 },
  { id: '3', time: '18:30', churchName: 'Paróquia Cristo Rei', distance: 4.4 },
  { id: '4', time: '19:00', churchName: 'Paróquia São Cristóvão', distance: 5.6 },
];

export const MOCK_PRAYERS = [
  {
    id: '1',
    title: 'Pai-Nosso',
    description: 'A oração ensinada por Jesus.',
    content: 'Pai nosso que estais nos céus, santificado seja o vosso nome. Venha a nós o vosso Reino. Seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje. Perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido. E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
  },
  {
    id: '2',
    title: 'Ave-Maria',
    description: 'Oração mariana tradicional.',
    content: 'Ave Maria, cheia de graça, o Senhor é convosco. Bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.',
  },
  {
    id: '3',
    title: 'Santo Anjo',
    description: 'Oração ao anjo da guarda.',
    content: 'Santo Anjo do Senhor, meu zeloso guardador, se a ti me confiou a piedade divina, sempre me rege, guarda, governa e ilumina. Amém.',
  },
];
