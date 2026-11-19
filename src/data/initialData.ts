import { Bottle, Wish, GameQuestion, AppSettings, PastEdition, RitualData, SecondLifeData } from '../types';
import { generateDefaultBottleToken } from '../utils/bottleTokens';

export const DEFAULT_SITE_IMAGES = {
  heroBottle: '/src/assets/images/stella_bottle_orange_1793994968538.jpg',
  ritualGlass: '/src/assets/images/ritual_punch_glass_1793994969480.jpg',
  storyKitchen: '/src/assets/images/artisan_storytelling_kitchen_1793994970709.jpg',
  secondLifeLantern: '/src/assets/images/bottle_lantern_lights_1793994970737.jpg',
  pastEditionBottle: '/src/assets/images/stella_bottle_past_2025_1793998085152.jpg',
};

export const INITIAL_SETTINGS: AppSettings = {
  videoUrl: 'https://www.youtube.com/embed/fDqZ9w78QdY?si=xXv7Bqf483gq1y0d',
  playlistUrl: 'https://www.youtube.com/embed/videoseries?list=PL442749EB6183B552',
  editionYear: 2026,
  totalBottles: 50,
  bottleColor: 'Ámbar Cálido & Naranja Solar',
  heroKicker: 'COSECHA LIMITADA DE NOCHEBUENA 2026',
  heroSubtitle: 'Ponche Crema Artesanal de Autor · 2026',
  heroDescription:
    'Bajo la guía de la Estrella Polar nace nuestra edición conmemorativa más íntima. Elaborada a fuego lento con ron añejo venezolano, leche entera de granja, vainilla bourbon de Madagascar y un velo de especias aromáticas. Este año, guardada en un exclusivo cristal ámbar naranja en sólo 50 botellas numeradas a mano.',
  storyDescription:
    'Una historia de cuatro generaciones que se reunían alrededor del calor del fogón y de una olla de cobre para celebrar la Nochebuena.',
  storyQuote:
    '“Todo empezó en una noche gélida de diciembre. En la casona de montaña, la olla de cobre silbaba a fuego lento. Mi abuelo siempre decía: ‘El ponche crema no se hace para tener prisa, se hace para que la familia tenga una razón para quedarse sentada a la mesa’.”',
  wishesDescription:
    'Un espacio cálido donde los poseedores de la edición de este año y amigos de la casa comparten sus bendiciones, recuerdos y deseos para esta Nochebuena 2026.',
  footerDescription:
    'Cada botella es una oda a la lentitud, al aroma del ron macerado y al calor del reencuentro de Nochebuena. Producido en un lote único de 50 botellas en cristal ámbar naranja.',
  images: {
    heroBottle: DEFAULT_SITE_IMAGES.heroBottle,
    ritualGlass: DEFAULT_SITE_IMAGES.ritualGlass,
    storyKitchen: DEFAULT_SITE_IMAGES.storyKitchen,
    secondLifeLantern: DEFAULT_SITE_IMAGES.secondLifeLantern,
  },
};

export const INITIAL_RITUAL_DATA: RitualData = {
  sectionTitle: 'El Ritual de la Estrella Polar',
  sectionDescription:
    'Beber Stella Polaris no es simplemente abrir una botella: es detener el reloj, reunir a quienes amas y celebrar con todos los sentidos.',
  glassCardTitle: 'Copa Recomendada',
  glassCardSubtitle: 'Coupette escarchada de cristal labrado',
  temperatureBadge: '4°C – 6°C',
  pairings: [
    'Panettone artesanal de naranja y chocolate',
    'Torta negra navideña con frutos macerados',
    'Pan de jamón tradicional tibio recién horneado',
    'Higos turcos y turrón blando de Jijona',
  ],
  steps: [
    {
      number: '01',
      title: 'El Frío Glacial (4°C – 6°C)',
      subtitle: 'La temperatura sagrada del ponche',
      desc: 'El ponche crema Stella Polaris jamás debe aguarse con cubos de hielo. Reposa la botella en la parte más fría de la nevera durante al menos 4 horas antes de servir, o sumérgela en una cubitera con hielo grueso y sal marina.',
      tip: 'Temperatura ideal de servicio: 5°C. La textura debe deslizarse como terciopelo líquido.',
      iconName: 'ThermometerSnowflake',
    },
    {
      number: '02',
      title: 'El Agitado en Ochos',
      subtitle: 'Despertar la emulsión dorada',
      desc: 'Antes de descorchar, toma la botella con ambas manos e inclínala dibujando suavemente la figura de un ocho (el infinito ∞). Este movimiento lento amalgama los aceites de la vainilla bourbon con el ron añejo sin crear burbujas de aire innecesarias.',
      tip: 'Haz 5 balanceos lentos. Escucha el susurro espeso del néctar contra el cristal ámbar.',
      iconName: 'RefreshCw',
    },
    {
      number: '03',
      title: 'El Cristal Escarchado',
      subtitle: 'La copa adecuada para la fiesta',
      desc: 'Elige una copa coupette o un vaso de cristal tallado antiguo previamente enfriado. Si lo deseas, humedece apenas el borde con unas gotas de naranja fresca y pósalo sobre una mezcla de azúcar moreno con canela de Ceilán en polvo.',
      tip: 'El cristal frío mantiene la consistencia untuosa de la crema hasta el último sorbo.',
      iconName: 'Wine',
    },
    {
      number: '04',
      title: 'La Lluvia de Nuez Moscada',
      subtitle: 'El toque maestro aromático',
      desc: 'Sirve 90 ml de Stella Polaris en un flujo continuo y sereno. Ralla en el instante mismo una leve lluvia de nuez moscada entera y acaricia el borde con un twist fino de cáscara de naranja recién torcida para liberar sus aceites cítricos.',
      tip: 'La nuez moscada fresca eleva los tonos amaderados del ron venezolano de solera.',
      iconName: 'Sparkles',
    },
    {
      number: '05',
      title: 'El Brindis de la Estrella Polar',
      subtitle: 'El momento que reúne a los tuyos',
      desc: 'Alza la copa con la mano derecha. Busca la estrella polar en el cielo o la luz más brillante de la sala. Cierra los ojos un segundo, agradece por las personas que te acompañan (las que están en la mesa y las que viven en el recuerdo) y haz un deseo íntimo antes del primer sorbo.',
      tip: '¡Salud, dicha y Nochebuena! Bebe despacio y deja que el calor del ron abrace el paladar.',
      iconName: 'Star',
    },
  ],
};

// Past Limited Collector Edition 2025
export const PAST_EDITION_2025: PastEdition = {
  year: 2025,
  bottleColor: 'Verde Esmeralda Bosque Imperial',
  quantityMade: 35,
  quantityLabel: '35 Botellas Numeradas a Mano (01/35 a 35/35)',
  status: 'Archivo 2025 · Agotada',
  description:
    'La histórica edición de Nochebuena 2025 de Stella Polaris fue embotellada en un imponente cristal verde esmeralda con tapón dorado y tipografía victoriana en relieve. Su producción artesanal estuvo estrictamente reservada a sólo 35 unidades numeradas.',
  tastingNotes:
    'Infusión de ron añejo de solera 10 años, cacao criollo silvestre, vainilla de Papúa y nuez moscada tostada. Textura sedosa con cuerpo untuoso y notas cálidas a madera de cedro.',
  imageSrc: DEFAULT_SITE_IMAGES.pastEditionBottle,
  waxSealColor: 'Oro Viejo Antiguo Estampado',
  keyFeatures: [
    '35 Botellas Únicas en todo el mundo',
    'Cristal soplado Verde Esmeralda Antiguo',
    'Embotellado en Diciembre de 2025',
    'Agotado en preventa el 21 de Diciembre de 2025',
  ],
  archiveNote:
    'Las 35 botellas de la edición 2025 fueron asignadas a coleccionistas privados y familias fundadoras entre el 1 y el 21 de diciembre de 2025. Hoy en día reposan como piezas históricas de nuestra casa licorera.',
};

// Generate 50 bottles for 2026 — all 50 bottles pre-authenticated!
export const generateInitialBottles = (): Bottle[] => {
  const bottles: Bottle[] = [];
  const claimedIndices: { [key: number]: { owner: string; date: string; dedication: string; location: string } } = {
    1: {
      owner: 'Familia Mendoza Rangel',
      date: '1 de Diciembre, 2026',
      dedication: 'Para el primer brindis con los abuelos en nochebuena.',
      location: 'Caracas, VE',
    },
    7: {
      owner: 'Valentina & Gabriel',
      date: '3 de Diciembre, 2026',
      dedication: 'Nuestra primera navidad en nuestro nuevo hogar.',
      location: 'Madrid, ES',
    },
    12: {
      owner: 'Carlos Eduardo Silva',
      date: '5 de Diciembre, 2026',
      dedication: 'En honor a la receta de mamá que siempre nos unía.',
      location: 'Bogotá, CO',
    },
    24: {
      owner: 'Sofía Arismendi',
      date: '7 de Diciembre, 2026',
      dedication: 'Esperando las 12 con quienes más quiero.',
      location: 'Miami, FL',
    },
    25: {
      owner: 'Andrés & Mariana',
      date: '10 de Diciembre, 2026',
      dedication: 'Por los que están cerca y los que brindan desde lejos.',
      location: 'Santiago, CL',
    },
    50: {
      owner: 'Colección de la Casa Stella Polaris',
      date: '15 de Noviembre, 2026',
      dedication: 'Botella Maestra archivada en la bodega de autor.',
      location: 'Taller de Destilación',
    },
  };

  for (let i = 1; i <= 50; i++) {
    const formatted = `${i.toString().padStart(2, '0')}/50`;
    const code = `SP26-${i.toString().padStart(2, '0')}`;
    const claimData = claimedIndices[i];

    bottles.push({
      number: i,
      formattedNumber: formatted,
      code,
      authToken: generateDefaultBottleToken(i),
      claimed: true,
      ownerName: claimData?.owner || `Propietario Ejemplar ${formatted}`,
      claimDate: claimData?.date || 'Diciembre 2026',
      dedication: claimData?.dedication || 'Brindis de Nochebuena Stella Polaris',
      location: claimData?.location || 'Edición Limitada 2026',
    });
  }

  return bottles;
};

export const INITIAL_WISHES: Wish[] = [
  {
    id: 'w-1',
    author: 'Familia Mendoza Rangel',
    bottleNumber: 1,
    location: 'Caracas, VE',
    message: 'Que la luz de la Estrella Polar guíe a todas las familias que esta nochebuena tienen una silla vacía. Brindamos por el amor que trasciende cualquier distancia.',
    category: 'Paz & Familia',
    createdAt: 'Hace 2 días',
    approved: true,
    pinned: true,
    likes: 42,
  },
  {
    id: 'w-2',
    author: 'Valentina & Gabriel',
    bottleNumber: 7,
    location: 'Madrid, ES',
    message: 'Desde la distancia un brindis bien frío con sabor a hogar. Gracias por crear este tesoro de ponche crema que huele a infancia y a nochebuena.',
    category: 'Brindis Navideño',
    createdAt: 'Hace 3 días',
    approved: true,
    pinned: true,
    likes: 28,
  },
  {
    id: 'w-3',
    author: 'Lucía Fernández',
    location: 'Buenos Aires, AR',
    message: 'Mi deseo para este 2027 es que nunca nos falte tiempo para mirarnos a los ojos, abrazar a los que amamos y reírnos de las cosas sencillas.',
    category: 'Gratitud',
    createdAt: 'Hace 4 días',
    approved: true,
    pinned: false,
    likes: 19,
  },
  {
    id: 'w-4',
    author: 'Carlos Eduardo Silva',
    bottleNumber: 12,
    location: 'Bogotá, CO',
    message: 'Un año de muchos retos pero infinitas bendiciones. Abrir esta botella naranja de Stella Polaris será el broche de oro de nuestra cena.',
    category: 'Nuevos Comienzos',
    createdAt: 'Hace 5 días',
    approved: true,
    pinned: false,
    likes: 15,
  },
  {
    id: 'w-5',
    author: 'Mariana & Mateo',
    location: 'Valencia, ES',
    message: '¡Paz, salud y sobremesas eternas sin prisa ni teléfonos!',
    category: 'Paz & Familia',
    createdAt: 'Hace 6 horas',
    approved: false, // Pending moderation for testing admin panel
    likes: 0,
  },
];

export const GAME_QUESTIONS: GameQuestion[] = [
  // ¿Quién es más probable que...?
  {
    id: 'g-1',
    type: 'likely',
    title: '¿Quién es más probable que...',
    prompt: '...se coma las uvas o aceitunas del plato antes de que empiece la cena?',
    tag: 'Humor Familiar',
  },
  {
    id: 'g-2',
    type: 'likely',
    title: '¿Quién es más probable que...',
    prompt: '...se quede dormido en el sofá con la copa de ponche crema en la mano después de medianoche?',
    tag: 'Sobremesa',
  },
  {
    id: 'g-3',
    type: 'likely',
    title: '¿Quién es más probable que...',
    prompt: '...intente adivinar todos los regalos sacudiendo los paquetes con cara de detective?',
    tag: 'Navidad Clásica',
  },
  {
    id: 'g-4',
    type: 'likely',
    title: '¿Quién es más probable que...',
    prompt: '...ponga la música navideña a todo volumen a las 8 de la mañana en pijama?',
    tag: 'Espíritu Festivo',
  },
  {
    id: 'g-5',
    type: 'likely',
    title: '¿Quién es más probable que...',
    prompt: '...se sirva una segunda (o tercera) copa de Stella Polaris antes del postre?',
    tag: 'Cómplices del Sabor',
  },
  {
    id: 'g-6',
    type: 'likely',
    title: '¿Quién es más probable que...',
    prompt: '...haga el brindis más largo, emotivo y con los ojos llorosos de la mesa?',
    tag: 'Emoción Pura',
  },

  // Trivia Navideña
  {
    id: 'g-7',
    type: 'trivia',
    title: 'Trivia de Tradición',
    prompt: '¿Cuál es la especia aromática legendaria que corona tradicionalmente una copa de ponche crema artesanal?',
    options: ['Nuez Moscada recién rallada', 'Pimienta negra en grano', 'Comino tostado', 'Jengibre cristalizado'],
    correctAnswer: 0,
    explanation: '¡Exacto! La nuez moscada recién rallada sobre la crema fría despierta los aceites esenciales del ron añejo y la vainilla bourbon.',
    tag: 'Coctelería',
  },
  {
    id: 'g-8',
    type: 'trivia',
    title: 'Trivia Astronómica',
    prompt: 'La Estrella Polar (Polaris) forma parte de qué famosa constelación que orientaba a los navegantes?',
    options: ['La Osa Menor', 'Orión', 'Casiopea', 'La Cruz del Sur'],
    correctAnswer: 0,
    explanation: 'Polaris es la estrella más brillante de la constelación de la Osa Menor (Ursa Minor), marcando el norte verdadero.',
    tag: 'Historia & Mitos',
  },
  {
    id: 'g-9',
    type: 'trivia',
    title: 'Trivia Festiva',
    prompt: '¿En qué país del mundo es tradición cenar pollo frito en Nochebuena gracias a una famosa campaña de 1974?',
    options: ['Japón', 'Islandia', 'Australia', 'Filipinas'],
    correctAnswer: 0,
    explanation: 'En Japón, pedir "Kurisumasu ni wa Kentakkii" (Kentucky para Navidad) es una tradición que se reserva con semanas de anticipación.',
    tag: 'Curiosidades',
  },
  {
    id: 'g-10',
    type: 'trivia',
    title: 'Trivia de Dulces',
    prompt: '¿Cuál es el ingrediente base que le otorga la textura sedosa y aterciopelada a un auténtico ponche crema casero?',
    options: ['Yemas de huevo batidas a fuego lento con crema y leche condensada', 'Harina de trigo y mantequilla', 'Gelatina sin sabor', 'Aceite de coco batido'],
    correctAnswer: 0,
    explanation: 'El temple delicado de yemas frescas a baja temperatura con leche condensada y crema crea la emulsión aterciopelada que distingue a Stella Polaris.',
    tag: 'Secretos de Cocina',
  },

  // Dinámica de Recuerdos & Gratitud
  {
    id: 'g-11',
    type: 'memory',
    title: 'Recuerdos de Sobremesa',
    prompt: 'Comparte con la mesa: ¿Cuál ha sido el momento más inesperado o divertido que viviste este año que termina?',
    tag: 'Corazón & Risas',
  },
  {
    id: 'g-12',
    type: 'memory',
    title: 'Gratitud en Familia',
    prompt: 'Mira a la persona a tu derecha y dile una cualidad o gesto suyo de este año por el que estás profundamente agradecido.',
    tag: 'Agradecimiento',
  },
  {
    id: 'g-13',
    type: 'memory',
    title: 'Cápsula del Tiempo',
    prompt: 'Si pudieras meter un solo objeto, recuerdo o conversación de este año en la botella vacía de Stella Polaris, ¿cuál sería?',
    tag: 'Nostalgia Festiva',
  },
  {
    id: 'g-14',
    type: 'memory',
    title: 'Planes & Sueños',
    prompt: '¿Qué viaje, proyecto o locura te gustaría cumplir antes de la próxima Navidad?',
    tag: 'Año Nuevo',
  },

  // Ruleta de Brindis
  {
    id: 'g-15',
    type: 'toast',
    title: 'Reto de Brindis',
    prompt: 'Alza tu copa y brinda imitando a un personaje famoso, o canta los dos primeros versos de tu villancico favorito.',
    tag: 'Reto Divertido',
  },
  {
    id: 'g-16',
    type: 'toast',
    title: 'El Brindis de la Estrella',
    prompt: 'Dedica este trago a alguien que hoy está lejos de la mesa física, pero muy presente en tu corazón.',
    tag: 'Brindis Emotivo',
  },
  {
    id: 'g-17',
    type: 'toast',
    title: 'Reto de Sobremesa',
    prompt: 'Di 3 cosas que te hagan feliz en menos de 5 segundos, o bebe un sorbo bien frío de Stella Polaris.',
    tag: 'Reto Rápido',
  },
];

export const INITIAL_SECOND_LIFE_DATA: SecondLifeData = {
  kicker: 'Sostenibilidad & Memoria Emocional',
  sectionTitle: 'La Segunda Vida de la Botella',
  sectionDescription:
    'Una botella exclusiva de 50 piezas jamás debe terminar en la basura. Transforma el cristal naranja de Stella Polaris en una lámpara de luz cálida que atesore tus recuerdos navideños.',
  guideKicker: 'Guía Paso a Paso para la Familia',
  guideTitle: 'Cómo Crear tu Lámpara Stella Polaris',
  steps: [
    {
      step: '01',
      title: 'El Enjuague de Conservación',
      desc: 'Al terminar la última copa de ponche crema, enjuaga el interior con agua tibia y una gota de jabón neutro. No sumerjas el exterior para proteger la etiqueta numerada a mano y su sello de lacre.',
    },
    {
      step: '02',
      title: 'El Secado Cristalino',
      desc: 'Coloca la botella boca abajo sobre un paño de lino limpio durante unas horas para asegurar que no quede humedad antes de introducir el circuito de luces.',
    },
    {
      step: '03',
      title: 'El Tapón de Corcho Micro-LED',
      desc: 'Adquiere una guirnalda de alambre de cobre con micro-LEDs de luz cálida (2700K) que incorpora el botón de encendido en el propio tapón de corcho. Introduce los 2 metros de cable suavemente en espiral.',
    },
    {
      step: '04',
      title: 'La Lámpara Eterna de Nochebuena',
      desc: 'Añade una cinta de terciopelo burdeos al cuello y una pequeña ramita de pino o canela. Tu botella 01/50 ahora es una lámpara de ambiente que acompañará todas tus navidades futuras.',
    },
  ],
  tipTitle: '¿Dónde conseguir las luces?',
  tipText:
    'Cualquier juego de luces de alambre de cobre tipo corcho para botellas (disponibles en ferreterías o tiendas de decoración navideña) encaja a la perfección en la boca de nuestra botella.',
};
