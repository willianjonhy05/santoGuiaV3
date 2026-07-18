export const LAST_CONFESSION_OPTIONS = [
  {
    label: 'Menos de 1 mês',
    value: 'há menos de 1 mês',
  },
  {
    label: 'Há alguns meses',
    value: 'há alguns meses',
  },
  {
    label: 'Mais de 1 ano',
    value: 'há mais de 1 ano',
  },
  {
    label: 'Há muitos anos',
    value: 'há muitos anos',
  },
];

export const EXAMINATION_SECTIONS = [
  {
    id: 'last-confession',
    title: 'Sobre a última confissão',
    initiallyOpen: true,
    showLastConfessionOptions: true,
    items: [
      {
        id: 'last-hidden-mortal-sins',
        question:
          'Escondi algum pecado mortal por vergonha?',
        statement:
          'Escondi pecados mortais por vergonha em confissões anteriores.',
      },
    ],
  },

  {
    id: 'first-commandment',
    title: '1º Mandamento: Amar a Deus',
    items: [
      {
        id: 'faith-doubts',
        question:
          'Tenho posto em dúvida alguma verdade de fé? Critiquei algum ensinamento da Igreja?',
        statement:
          'Pus em dúvida verdades da fé e critiquei ensinamentos da Igreja.',
      },
      {
        id: 'daily-prayer',
        question:
          'Rezo diariamente? Distraio-me voluntariamente nas orações?',
        statement:
          'Deixei de rezar diariamente e me distraí voluntariamente nas orações.',
      },
      {
        id: 'discouragement-against-god',
        question:
          'Deixei-me levar pelo desânimo? Revoltei-me contra Deus?',
        statement:
          'Deixei-me levar pelo desânimo e me revoltei contra Deus.',
      },
      {
        id: 'superstition',
        question:
          'Frequentei lugares contrários à fé católica? Fiz coisas supersticiosas ou consultei videntes?',
        statement:
          'Frequentei cultos contrários à fé católica, pratiquei superstições ou consultei videntes, cartomantes ou benzedores.',
      },
      {
        id: 'pride-envy',
        question:
          'Tenho sido orgulhoso, vaidoso, teimoso ou invejoso?',
        statement:
          'Fui orgulhoso, vaidoso, teimoso, arrogante ou invejoso.',
      },
      {
        id: 'greed',
        question:
          'Sou avarento? Passo o dia pensando apenas em dinheiro?',
        statement:
          'Fui avarento, apegando-me excessivamente ao dinheiro e a bens materiais.',
      },
    ],
  },

  {
    id: 'second-commandment',
    title: '2º Mandamento: Santo Nome de Deus',
    items: [
      {
        id: 'holy-name',
        question:
          'Tenho pronunciado sem respeito o nome de Deus ou dos Santos?',
        statement:
          'Pronunciei sem o devido respeito o Santo Nome de Deus ou dos Santos.',
      },
      {
        id: 'ridicule-sacred',
        question:
          'Falei sem respeito ou ridicularizei a Igreja e sacerdotes?',
        statement:
          'Falei sem respeito ou ridicularizei coisas sagradas, a Igreja, sacerdotes e religiosos.',
      },
      {
        id: 'false-oath',
        question:
          'Tenho jurado à toa ou jurado falso?',
        statement:
          'Jurei em vão ou jurei falso.',
      },
      {
        id: 'unfulfilled-promises',
        question:
          'Deixei de cumprir alguma promessa que fiz?',
        statement:
          'Deixei de cumprir promessas feitas a Deus.',
      },
    ],
  },

  {
    id: 'third-commandment',
    title: '3º Mandamento: Domingos e Festas',
    items: [
      {
        id: 'missed-mass',
        question:
          'Faltei à Missa no domingo? Cheguei atrasado por culpa própria?',
        statement:
          'Faltei à Santa Missa aos domingos ou dias de guarda, ou cheguei atrasado por culpa própria.',
      },
      {
        id: 'unworthy-communion',
        question:
          'Comunguei consciente de um pecado mortal não confessado?',
        statement:
          'Cometi sacrilégio ao comungar consciente de estar em pecado mortal.',
      },
      {
        id: 'sunday-rest',
        question:
          'Trabalhei ou obriguei outros a trabalhar no domingo sem necessidade?',
        statement:
          'Não guardei o descanso dominical ou obriguei outros a trabalhar sem necessidade.',
      },
      {
        id: 'fast-abstinence',
        question:
          'Deixei de jejuar ou de fazer abstinência de carne nos dias prescritos?',
        statement:
          'Não guardei o jejum ou a abstinência de carne nos dias prescritos pela Igreja.',
      },
    ],
  },

  {
    id: 'fourth-commandment',
    title: '4º Mandamento: Honrar Pai e Mãe',
    items: [
      {
        id: 'parents-respect',
        question:
          'Faltei à obediência ou respeito aos pais?',
        statement:
          'Faltei à obediência ou ao respeito devido aos meus pais e superiores.',
      },
      {
        id: 'spouse-treatment',
        question:
          'Zanguei-me ou tratei mal minha esposa ou meu marido?',
        statement:
          'Tratei mal meu cônjuge com palavras, ações ou acessos de ira.',
      },
      {
        id: 'children-example',
        question:
          'Dei mau exemplo ou descuidei da formação religiosa dos filhos?',
        statement:
          'Dei mau exemplo aos meus filhos ou omiti a correta formação religiosa e moral deles.',
      },
    ],
  },

  {
    id: 'fifth-commandment',
    title: '5º Mandamento: Não Matar',
    items: [
      {
        id: 'hate-resentment',
        question:
          'Tive inimizade, ódio ou rancor contra alguém?',
        statement:
          'Alimentei ódio, rancor ou inimizade contra o próximo.',
      },
      {
        id: 'refused-forgiveness',
        question:
          'Deixei de perdoar as ofensas que recebi?',
        statement:
          'Recusei-me a perdoar as ofensas recebidas.',
      },
      {
        id: 'abortion-euthanasia',
        question:
          'Aconselhei ou facilitei um aborto ou eutanásia?',
        statement:
          'Participei, aconselhei ou apoiei a prática do aborto ou da eutanásia.',
      },
      {
        id: 'health-excesses',
        question:
          'Embriaguei-me, usei drogas ou comi em excesso?',
        statement:
          'Prejudiquei a saúde com embriaguez, excesso de comida ou uso de drogas.',
      },
    ],
  },

  {
    id: 'sixth-ninth-commandments',
    title: '6º e 9º: Castidade e Pureza',
    items: [
      {
        id: 'indecent-content',
        question:
          'Vi coisas indecentes na internet, no celular ou em filmes?',
        statement:
          'Assisti ou busquei conteúdos indecentes ou pornográficos na internet ou no celular.',
      },
      {
        id: 'impure-thoughts',
        question:
          'Pensei ou desejei coisas impuras voluntariamente?',
        statement:
          'Consenti em pensamentos ou desejos impuros.',
      },
      {
        id: 'impure-actions',
        question:
          'Pratiquei ações impuras sozinho ou acompanhado?',
        statement:
          'Pratiquei atos impuros comigo mesmo ou com outros.',
      },
      {
        id: 'dating-marriage-chastity',
        question:
          'Tive liberdades no namoro ou fui infiel no casamento?',
        statement:
          'Faltei à castidade no namoro ou cometi infidelidade conjugal.',
      },
    ],
  },

  {
    id: 'seventh-tenth-commandments',
    title: '7º e 10º: Não Roubar / Cobiçar',
    items: [
      {
        id: 'theft',
        question:
          'Roubei algum objeto ou quantia de dinheiro?',
        statement:
          'Cometi furto de objetos ou valores em dinheiro, ou fui cúmplice.',
      },
      {
        id: 'poor-work',
        question:
          'Desperdicei tempo no trabalho ou trabalhei mal?',
        statement:
          'Fui preguiçoso no trabalho ou desperdicei o tempo pelo qual sou pago.',
      },
    ],
  },

  {
    id: 'eighth-commandment',
    title: '8º Mandamento: Não Mentir',
    items: [
      {
        id: 'lies',
        question:
          'Menti ou tenho o hábito de mentir?',
        statement:
          'Disse mentiras ou tenho o hábito de mentir.',
      },
      {
        id: 'defamation',
        question:
          'Difamei ou caluniei alguém revelando seus defeitos?',
        statement:
          'Difamei ou caluniei o próximo, espalhando boatos ou aumentando seus defeitos.',
      },
      {
        id: 'discord',
        question:
          'Semeei discórdias com minhas palavras?',
        statement:
          'Semeei discórdia ou intriga entre as pessoas.',
      },
    ],
  },
];