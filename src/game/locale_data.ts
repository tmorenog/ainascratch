/**
 * Locale tables for content that doesn't fit the strict TKey union in
 * i18n.ts — recipe names/descriptions, ingredient names, customer
 * greetings, and dialog phrases. Missing entries fall back to English.
 *
 * All keys are recipe / ingredient / archetype ids from the game data.
 * Add a locale by dropping in a partial map — you don't have to translate
 * every field for every language.
 */
import type { Lang } from "./i18n";

type Partial4<T> = { es?: T; fr?: T; it?: T; pt?: T };

interface RecipeText {
  name: string;
  description?: string;
}
interface IngredientText {
  name: string;
  unit?: string;
}

export const RECIPE_LOCALE: Record<string, Partial4<RecipeText>> = {
  hot_chocolate: {
    es: { name: "Chocolate Caliente", description: "Vaporoso, acogedor y suavecito." },
    fr: { name: "Chocolat Chaud", description: "Vaporeux, doux et réconfortant." },
    it: { name: "Cioccolata Calda", description: "Fumante, coccolosa, morbida sopra." },
    pt: { name: "Chocolate Quente", description: "Fumegante, aconchegante e macio." },
  },
  milkshake: {
    es: { name: "Batido de Fresa", description: "Rosa, espumoso, hace reír." },
    fr: { name: "Milkshake Fraise", description: "Rose, mousseux, ça fait rire." },
    it: { name: "Frullato di Fragola", description: "Rosa, spumoso, fa ridacchiare." },
    pt: { name: "Milkshake de Morango", description: "Rosa, espumoso, dá risinhos." },
  },
  smoothie: {
    es: { name: "Smoothie Solar", description: "Sol frutal en un vaso." },
    fr: { name: "Smoothie Soleil", description: "Du soleil fruité en verre." },
    it: { name: "Smoothie del Sole", description: "Sole fruttato in un bicchiere." },
    pt: { name: "Smoothie Solar", description: "Sol frutado num copo." },
  },
  lemonade: {
    es: { name: "Limonada Chispeante", description: "Ácida, burbujeante, verano en taza." },
    fr: { name: "Limonade Pétillante", description: "Acidulée, pétillante, l'été en tasse." },
    it: { name: "Limonata Frizzante", description: "Acidula, frizzante, estate in tazza." },
    pt: { name: "Limonada Borbulhante", description: "Ácida, borbulhante, verão no copo." },
  },
  coffee: {
    es: { name: "Café Acogedor", description: "Un abrazo cálido para los mayores dormilones." },
    fr: { name: "Café Douillet", description: "Un câlin chaud pour les grands endormis." },
    it: { name: "Caffè Coccoloso", description: "Un abbraccio caldo per i grandi assonnati." },
    pt: { name: "Café Aconchegante", description: "Um abraço quente para os adultos sonolentos." },
  },
  tea: {
    es: { name: "Té del Jardín", description: "Calmado, herbal y elegante." },
    fr: { name: "Thé du Jardin", description: "Calme, végétal et élégant." },
    it: { name: "Tè del Giardino", description: "Calmo, erbaceo, elegante." },
    pt: { name: "Chá do Jardim", description: "Calmo, herbal e elegante." },
  },
  mocha: {
    es: { name: "Moca con Malvaviscos", description: "Café + chocolate = magia." },
    fr: { name: "Moka aux Guimauves", description: "Café + chocolat = magie." },
    it: { name: "Mocaccino Marshmallow", description: "Caffè + cioccolato = magia." },
    pt: { name: "Mocha com Marshmallow", description: "Café + chocolate = magia." },
  },
  pineapple_juice: {
    es: { name: "Jugo de Piña", description: "Sol tropical y ácido en un vaso." },
    fr: { name: "Jus d'Ananas", description: "Soleil tropical acidulé en verre." },
    it: { name: "Succo d'Ananas", description: "Sole tropicale e frizzante nel bicchiere." },
    pt: { name: "Suco de Abacaxi", description: "Sol tropical e ácido num copo." },
  },
  almond_milk: {
    es: { name: "Leche de Almendras", description: "Sedosa, con sabor a nuez, sin lácteos." },
    fr: { name: "Lait d'Amande", description: "Soyeux, boisé, sans lactose." },
    it: { name: "Latte di Mandorla", description: "Setoso, nocciolato, senza latte." },
    pt: { name: "Leite de Amêndoas", description: "Sedoso, com sabor a noz, sem lactose." },
  },
  berry_smoothie: {
    es: { name: "Smoothie de Bayas", description: "Morado brillante y lleno de energía." },
    fr: { name: "Smoothie Baies Éclat", description: "Violet vif, plein d'énergie." },
    it: { name: "Smoothie ai Frutti di Bosco", description: "Viola vivo, pieno di grinta." },
    pt: { name: "Smoothie de Frutas Vermelhas", description: "Roxo brilhante, cheio de energia." },
  },
  glazed_donut: {
    es: { name: "Rosquilla Glaseada", description: "Aro clásico de alegría." },
    fr: { name: "Beignet Glacé", description: "Anneau classique de bonheur." },
    it: { name: "Ciambella Glassata", description: "Classico anello di felicità." },
    pt: { name: "Rosquinha Glaceada", description: "Anel clássico de alegria." },
  },
  sprinkle_donut: {
    es: { name: "Rosquilla con Chispas", description: "Confeti para comer." },
    fr: { name: "Beignet aux Vermicelles", description: "Des confettis à manger." },
    it: { name: "Ciambella con Codette", description: "Coriandoli da mangiare." },
    pt: { name: "Rosquinha com Confeitos", description: "Confete de comer." },
  },
  munchkins: {
    es: { name: "Bolitas de Rosquilla", description: "Mini rosquillas — un puñado de alegría." },
    fr: { name: "Mini Beignets", description: "Petites boules de donut — une poignée de bonheur." },
    it: { name: "Mini Ciambelline", description: "Palline di ciambella — una manciata di felicità." },
    pt: { name: "Bolinhas de Rosquinha", description: "Mini donuts — um punhado de alegria." },
  },
  chocolate_cupcake: {
    es: { name: "Cupcake de Chocolate", description: "Alto, esponjoso y muy chocolatoso." },
    fr: { name: "Cupcake au Chocolat", description: "Haut, moelleux, tout choco." },
    it: { name: "Cupcake al Cioccolato", description: "Alto, soffice e cioccolatoso." },
    pt: { name: "Cupcake de Chocolate", description: "Alto, fofinho e bem chocolatudo." },
  },
  blueberry_muffin: {
    es: { name: "Muffin de Arándanos", description: "Lleno de joyitas jugosas." },
    fr: { name: "Muffin aux Myrtilles", description: "Rempli de petits joyaux juteux." },
    it: { name: "Muffin ai Mirtilli", description: "Pieno di gemme succose." },
    pt: { name: "Muffin de Mirtilo", description: "Recheado de joinhas suculentas." },
  },
  cinnamon_roll: {
    es: { name: "Rollo de Canela", description: "Abrazo tibio en forma de espiral." },
    fr: { name: "Roulé à la Cannelle", description: "Câlin tiède en spirale." },
    it: { name: "Rotolo alla Cannella", description: "Abbraccio tiepido a spirale." },
    pt: { name: "Rocambole de Canela", description: "Abraço morno em espiral." },
  },
  butter_cookie: {
    es: { name: "Galleta de Mantequilla", description: "Desmenuzable, dorada, sencilla, perfecta." },
    fr: { name: "Biscuit au Beurre", description: "Friable, doré, simple, parfait." },
    it: { name: "Biscotto al Burro", description: "Friabile, dorato, semplice, perfetto." },
    pt: { name: "Biscoito Amanteigado", description: "Esfarelento, dourado, simples, perfeito." },
  },
  scratch_donut: {
    es: { name: "Rosquilla Recién Hecha", description: "Masa de verdad — esponjosa y dorada." },
    fr: { name: "Beignet Frais", description: "Pâte maison — moelleuse et dorée." },
    it: { name: "Ciambella Fresca", description: "Impasto vero — soffice e dorata." },
    pt: { name: "Rosquinha Fresquinha", description: "Massa de verdade — fofa e dourada." },
  },
  scratch_cookies: {
    es: { name: "Galletas con Chips", description: "Bordes crujientes, centro tierno." },
    fr: { name: "Cookies aux Pépites", description: "Bords croquants, cœur fondant." },
    it: { name: "Biscotti alle Gocce", description: "Bordi croccanti, cuore morbido." },
    pt: { name: "Cookies com Gotas", description: "Bordas crocantes, meio molinho." },
  },
  scratch_pie: {
    es: { name: "Tarta de Bayas", description: "Un enrejado de cariño sobre bayas tibias." },
    fr: { name: "Tarte aux Baies", description: "Un treillis de tendresse sur les baies chaudes." },
    it: { name: "Crostata ai Frutti di Bosco", description: "Un intreccio d'amore sui frutti caldi." },
    pt: { name: "Torta de Frutas Vermelhas", description: "Uma treliça de amor sobre frutas quentes." },
  },
  decorated_cake: {
    es: { name: "Pastel Decorado", description: "Una celebración en cada rebanada." },
    fr: { name: "Gâteau Décoré", description: "Une fête à chaque part." },
    it: { name: "Torta Decorata", description: "Una festa in ogni fetta." },
    pt: { name: "Bolo Decorado", description: "Uma festa em cada fatia." },
  },
  croissant: {
    es: { name: "Cruasán Mantecoso", description: "Capas y capas de alegría mantecosa." },
    fr: { name: "Croissant Beurré", description: "Des couches et des couches de bonheur beurré." },
    it: { name: "Cornetto al Burro", description: "Strati e strati di gioia burrosa." },
    pt: { name: "Croissant Amanteigado", description: "Camadas e camadas de alegria amanteigada." },
  },
  chocolate_croissant: {
    es: { name: "Cruasán de Chocolate", description: "Capas hojaldradas con corazón de chocolate fundido." },
    fr: { name: "Croissant Chocolat", description: "Des feuillets autour d'un cœur de chocolat fondant." },
    it: { name: "Cornetto al Cioccolato", description: "Strati sfogliati con cuore di cioccolato fuso." },
    pt: { name: "Croissant de Chocolate", description: "Camadas folhadas abraçando chocolate derretido." },
  },
  white_choc_muffin: {
    es: { name: "Muffin de Chocolate Blanco", description: "Chocolate blanco cremoso, confeti encima." },
    fr: { name: "Muffin Choco Blanc", description: "Chocolat blanc crémeux, confettis dessus." },
    it: { name: "Muffin al Cioccolato Bianco", description: "Cioccolato bianco cremoso, coriandoli sopra." },
    pt: { name: "Muffin de Chocolate Branco", description: "Chocolate branco cremoso, confetes por cima." },
  },
  red_velvet_muffin: {
    es: { name: "Muffin Red Velvet", description: "Miga aterciopelada con glaseado de queso." },
    fr: { name: "Muffin Red Velvet", description: "Mie veloutée, glaçage au fromage." },
    it: { name: "Muffin Red Velvet", description: "Impasto vellutato, glassa al formaggio." },
    pt: { name: "Muffin Red Velvet", description: "Massa aveludada com glacê de cream cheese." },
  },
  olive_oil_cake: {
    es: { name: "Bizcocho de Aceite de Oliva", description: "Húmedo, cítrico, con un toque de oliva." },
    fr: { name: "Gâteau à l'Huile d'Olive", description: "Moelleux, citronné, une touche d'olive." },
    it: { name: "Torta all'Olio d'Oliva", description: "Umida, agrumata, con un tocco d'oliva." },
    pt: { name: "Bolo de Azeite", description: "Úmido, cítrico, com um toque de azeite." },
  },
  dog_bone: {
    es: { name: "Galleta Huesito", description: "Crujiente huesito que hace mover la cola." },
    fr: { name: "Biscuit Os", description: "Petit os croquant qui fait remuer la queue." },
    it: { name: "Biscotto Ossicino", description: "Ossicino croccante che fa scodinzolare." },
    pt: { name: "Biscoito Ossinho", description: "Ossinho crocante que faz o rabo abanar." },
  },
  cat_fish: {
    es: { name: "Galleta Pescadito", description: "Pequeños peces crujientes purrfectos." },
    fr: { name: "Biscuit Poisson", description: "Petits poissons croquants purr-faits." },
    it: { name: "Biscotto Pesciolino", description: "Pesciolini croccanti purr-fetti." },
    pt: { name: "Biscoito Peixinho", description: "Peixinhos crocantes purr-feitos." },
  },
  donut_bear_plush: {
    es: { name: "Peluche Osito Donut", description: "Osito con sombrero de rosquilla — muy achuchable." },
    fr: { name: "Peluche Ourson Beignet", description: "Ourson avec un chapeau donut — tout doux." },
    it: { name: "Peluche Orsetto Ciambella", description: "Orsetto con cappello a ciambella — coccolosissimo." },
    pt: { name: "Pelúcia Ursinho Donut", description: "Ursinho de chapéu de rosquinha — abraçável." },
  },
  croissant_cat_plush: {
    es: { name: "Peluche Gatito Cruasán", description: "Gatito dentro de un cruasán mantecoso — demasiado tierno." },
    fr: { name: "Peluche Chaton Croissant", description: "Chaton lové dans un croissant beurré — trop mignon." },
    it: { name: "Peluche Gattino Cornetto", description: "Gattino dentro un cornetto burroso — troppo tenero." },
    pt: { name: "Pelúcia Gatinho Croissant", description: "Gatinho dentro de um croissant — fofura pura." },
  },
  cupcake_bunny_plush: {
    es: { name: "Peluche Conejito Cupcake", description: "Conejito en envoltura de cupcake, con orejas de glaseado." },
    fr: { name: "Peluche Lapin Cupcake", description: "Lapin blotti dans un cupcake, oreilles en glaçage." },
    it: { name: "Peluche Coniglietto Cupcake", description: "Coniglietto in un cupcake, orecchie di glassa." },
    pt: { name: "Pelúcia Coelhinho Cupcake", description: "Coelhinho num cupcake, orelhas de glacê." },
  },
  coffee_cup_puppy_plush: {
    es: { name: "Peluche Perrito Café", description: "Perrito asomándose de un latte — el barista más lindo." },
    fr: { name: "Peluche Chiot Café", description: "Chiot qui sort d'un latte — le plus mignon des baristas." },
    it: { name: "Peluche Cucciolo Caffè", description: "Cucciolo che sbuca da un latte — il barista più tenero." },
    pt: { name: "Pelúcia Cachorrinho Café", description: "Cachorrinho saindo de um latte — o barista mais fofo." },
  },
  rubber_bone_toy: {
    es: { name: "Hueso de Goma Chirriante", description: "Hueso rebotante con un chirrido feliz." },
    fr: { name: "Os en Caoutchouc Couinant", description: "Os rebondi qui couine joyeusement." },
    it: { name: "Osso di Gomma con Squittio", description: "Osso rimbalzante che squittisce felice." },
    pt: { name: "Osso de Borracha Squeaky", description: "Osso saltitante com um chiado alegre." },
  },
  rope_tug_toy: {
    es: { name: "Cuerda Arcoíris para Tirar", description: "Cuerda de algodón trenzada — perfecta para tira y afloja." },
    fr: { name: "Corde Arc-en-ciel", description: "Corde de coton tressée — parfaite pour tirer." },
    it: { name: "Corda Arcobaleno da Tirare", description: "Corda di cotone intrecciata — perfetta per tira-e-molla." },
    pt: { name: "Corda Arco-íris de Puxar", description: "Corda de algodão trançada — perfeita pra cabo-de-guerra." },
  },
  feather_wand_toy: {
    es: { name: "Varita con Plumas", description: "Pluma brillante en un palito flexible — los gatitos saltan." },
    fr: { name: "Baguette à Plumes", description: "Une plume qui scintille au bout d'une baguette — les chats bondissent." },
    it: { name: "Bacchetta con Piume", description: "Piuma scintillante su bastoncino flessibile — i gattini balzano." },
    pt: { name: "Varinha de Penas", description: "Pena brilhante numa varinha flexível — os gatinhos pulam." },
  },
  tennis_ball_toy: {
    es: { name: "Pelota de Tenis Rebotona", description: "La clásica pelota mullida — para jugar a buscar todo el día." },
    fr: { name: "Balle de Tennis Bondissante", description: "La classique balle molletonnée — parfaite pour aller chercher." },
    it: { name: "Pallina da Tennis Rimbalzina", description: "La classica pallina morbidosa — riporto tutto il giorno." },
    pt: { name: "Bolinha de Tênis Saltitante", description: "A clássica bolinha macia — buscar o dia todo." },
  },
};

export const INGREDIENT_LOCALE: Record<string, Partial4<IngredientText>> = {
  flour: {
    es: { name: "Harina", unit: "taza" },
    fr: { name: "Farine", unit: "tasse" },
    it: { name: "Farina", unit: "tazza" },
    pt: { name: "Farinha", unit: "xícara" },
  },
  sugar: {
    es: { name: "Azúcar", unit: "taza" },
    fr: { name: "Sucre", unit: "tasse" },
    it: { name: "Zucchero", unit: "tazza" },
    pt: { name: "Açúcar", unit: "xícara" },
  },
  butter: {
    es: { name: "Mantequilla", unit: "barra" },
    fr: { name: "Beurre", unit: "plaquette" },
    it: { name: "Burro", unit: "panetto" },
    pt: { name: "Manteiga", unit: "tablete" },
  },
  eggs: {
    es: { name: "Huevos", unit: "huevo" },
    fr: { name: "Œufs", unit: "œuf" },
    it: { name: "Uova", unit: "uovo" },
    pt: { name: "Ovos", unit: "ovo" },
  },
  milk: {
    es: { name: "Leche", unit: "taza" },
    fr: { name: "Lait", unit: "tasse" },
    it: { name: "Latte", unit: "tazza" },
    pt: { name: "Leite", unit: "xícara" },
  },
  chocolate: {
    es: { name: "Chocolate", unit: "barra" },
    fr: { name: "Chocolat", unit: "tablette" },
    it: { name: "Cioccolato", unit: "tavoletta" },
    pt: { name: "Chocolate", unit: "barra" },
  },
  yeast: {
    es: { name: "Levadura", unit: "sobre" },
    fr: { name: "Levure", unit: "sachet" },
    it: { name: "Lievito", unit: "bustina" },
    pt: { name: "Fermento", unit: "sachê" },
  },
  fruit: {
    es: { name: "Fruta Fresca", unit: "taza" },
    fr: { name: "Fruits Frais", unit: "tasse" },
    it: { name: "Frutta Fresca", unit: "tazza" },
    pt: { name: "Frutas Frescas", unit: "xícara" },
  },
  coffee_beans: {
    es: { name: "Granos de Café", unit: "cucharada" },
    fr: { name: "Grains de Café", unit: "cuillère" },
    it: { name: "Chicchi di Caffè", unit: "cucchiaio" },
    pt: { name: "Grãos de Café", unit: "colher" },
  },
  tea_leaves: {
    es: { name: "Hojas de Té", unit: "cucharada" },
    fr: { name: "Feuilles de Thé", unit: "cuillère" },
    it: { name: "Foglie di Tè", unit: "cucchiaio" },
    pt: { name: "Folhas de Chá", unit: "colher" },
  },
  icing: {
    es: { name: "Glaseado", unit: "espiral" },
    fr: { name: "Glaçage", unit: "spirale" },
    it: { name: "Glassa", unit: "spirale" },
    pt: { name: "Glacê", unit: "espiral" },
  },
  lemon: {
    es: { name: "Limones", unit: "limón" },
    fr: { name: "Citrons", unit: "citron" },
    it: { name: "Limoni", unit: "limone" },
    pt: { name: "Limões", unit: "limão" },
  },
  cinnamon: {
    es: { name: "Canela", unit: "pizca" },
    fr: { name: "Cannelle", unit: "pincée" },
    it: { name: "Cannella", unit: "pizzico" },
    pt: { name: "Canela", unit: "pitada" },
  },
  pineapple: {
    es: { name: "Piña", unit: "rodaja" },
    fr: { name: "Ananas", unit: "tranche" },
    it: { name: "Ananas", unit: "fetta" },
    pt: { name: "Abacaxi", unit: "fatia" },
  },
  almond: {
    es: { name: "Almendras", unit: "puñado" },
    fr: { name: "Amandes", unit: "poignée" },
    it: { name: "Mandorle", unit: "manciata" },
    pt: { name: "Amêndoas", unit: "punhado" },
  },
  pet_mix: {
    es: { name: "Mezcla para Mascotas", unit: "cucharada" },
    fr: { name: "Mélange Animaux", unit: "cuillère" },
    it: { name: "Mix per Animali", unit: "cucchiaio" },
    pt: { name: "Mistura Pet", unit: "colher" },
  },
};

/** Customer archetype greetings by lang. Falls back to the archetype's
 *  own English flavorLines when missing. Names stay untranslated — a
 *  name is a name. */
export const ARCHETYPE_LOCALE: Record<string, Partial4<{ flavorLines: string[] }>> = {
  miles: {
    es: {
      flavorLines: [
        "¡Vine en bici hasta aquí por esto!",
        "¡Quiero algo dulce por favor!",
        "¡Que esté súper rico!",
      ],
    },
    fr: {
      flavorLines: [
        "J'ai fait tout le chemin à vélo pour ça !",
        "Je voudrais quelque chose de sucré, s'il te plaît !",
        "Fais-le extra délicieux !",
      ],
    },
    it: {
      flavorLines: [
        "Sono venuto in bici fin qui per questo!",
        "Vorrei qualcosa di dolce per favore!",
        "Rendilo super buono!",
      ],
    },
    pt: {
      flavorLines: [
        "Vim de bicicleta até aqui só por isso!",
        "Quero algo doce por favor!",
        "Faz bem gostoso!",
      ],
    },
  },
  lilly: {
    es: {
      flavorLines: ["¡Hoy es un día especial!", "¡Quiero algo rosa!", "¡Chispas extra, porfa!"],
    },
    fr: {
      flavorLines: ["C'est un jour très spécial !", "Je veux quelque chose de rose !", "Extra vermicelles, s'il te plaît !"],
    },
    it: {
      flavorLines: ["Oggi è un giorno speciale!", "Voglio qualcosa di rosa!", "Codette extra, per favore!"],
    },
    pt: {
      flavorLines: ["Hoje é um dia especial!", "Quero algo rosa!", "Confetes extras, por favor!"],
    },
  },
  bobby: {
    es: {
      flavorLines: ["¡Tengo un poquito de prisa!", "¡Solo agarro el desayuno!", "¡Rápido, rápido por favor!"],
    },
    fr: {
      flavorLines: ["Je suis un tout petit peu pressé !", "Juste le petit déj à emporter !", "Vite vite s'il te plaît !"],
    },
    it: {
      flavorLines: ["Ho un pochino di fretta!", "Prendo solo colazione al volo!", "Veloce veloce per favore!"],
    },
    pt: {
      flavorLines: ["Estou com pressinha!", "Só pegando o café da manhã!", "Rápido, rápido por favor!"],
    },
  },
  sam: {
    es: {
      flavorLines: ["Necesito... café... por favor.", "Mmm, lo que esté calentito.", "¡Emergencia de café!"],
    },
    fr: {
      flavorLines: ["Il me faut... du café... s'il te plaît.", "Mmm, ce qui est chaud.", "Urgence café !"],
    },
    it: {
      flavorLines: ["Serve... caffè... per favore.", "Mmm, quello che è caldo.", "Emergenza caffè!"],
    },
    pt: {
      flavorLines: ["Preciso... de café... por favor.", "Mmm, o que estiver quente.", "Emergência de café!"],
    },
  },
  ava: {
    es: {
      flavorLines: ["¡Mi perrita también quiere un premio!", "¡Hará un truco por un huesito!", "¡No la olvides, por favor!"],
    },
    fr: {
      flavorLines: ["Ma chienne veut aussi une friandise !", "Elle fait un tour pour un os !", "Ne l'oublie pas, s'il te plaît !"],
    },
    it: {
      flavorLines: ["Anche la mia cagnolina vuole uno snack!", "Fa un trucchetto per un ossicino!", "Non dimenticarla, per favore!"],
    },
    pt: {
      flavorLines: ["Minha cachorrinha também quer um petisco!", "Ela faz um truque por um ossinho!", "Não esquece dela, por favor!"],
    },
  },
  noah: {
    es: {
      flavorLines: ["Mittens insiste en una galleta de pescado.", "¡Primero el gato, luego yo!", "Somos clientes fijos, ¿sabes?"],
    },
    fr: {
      flavorLines: ["Mittens insiste pour un biscuit poisson.", "Le chat d'abord, puis moi !", "On est des habitués, tu sais."],
    },
    it: {
      flavorLines: ["Mittens vuole assolutamente un biscotto di pesce.", "Prima il gatto, poi io!", "Siamo clienti abituali, sai."],
    },
    pt: {
      flavorLines: ["Mittens insiste num biscoito de peixe.", "Primeiro o gato, depois eu!", "Somos frequentadores, sabia?"],
    },
  },
  mia: {
    es: {
      flavorLines: ["¡Glaseado extra, siempre glaseado extra!", "¡Si brilla, lo compro!", "¡Que quede bonito por favor!"],
    },
    fr: {
      flavorLines: ["Extra glaçage, toujours extra glaçage !", "Si ça brille, je le prends !", "Fais-le joli s'il te plaît !"],
    },
    it: {
      flavorLines: ["Glassa extra, sempre glassa extra!", "Se brilla, lo compro!", "Fallo carino per favore!"],
    },
    pt: {
      flavorLines: ["Glacê extra, sempre glacê extra!", "Se brilha, eu compro!", "Deixa bonitinho por favor!"],
    },
  },
  liam: {
    es: {
      flavorLines: ["¡Me espera una caminata larga!", "¡Algo contundente, por favor!", "¡Necesito combustible para el sendero!"],
    },
    fr: {
      flavorLines: ["J'ai une longue randonnée devant moi !", "Quelque chose de nourrissant, s'il te plaît !", "Il me faut du carburant pour le sentier !"],
    },
    it: {
      flavorLines: ["Ho una lunga camminata davanti!", "Qualcosa di sostanzioso, per favore!", "Serve carburante per il sentiero!"],
    },
    pt: {
      flavorLines: ["Vou fazer uma longa trilha!", "Algo reforçado, por favor!", "Preciso de combustível pra trilha!"],
    },
  },
  sophie: {
    es: {
      flavorLines: ["Un tecito me vendría genial.", "Algo suave, por favor.", "¿Me lo pones calentito?"],
    },
    fr: {
      flavorLines: ["Un thé serait adorable.", "Quelque chose de doux, s'il te plaît.", "Je peux l'avoir chaud ?"],
    },
    it: {
      flavorLines: ["Un tè sarebbe delizioso.", "Qualcosa di delicato, per favore.", "Me lo puoi dare caldo?"],
    },
    pt: {
      flavorLines: ["Um chazinho seria adorável.", "Algo suave, por favor.", "Pode ser quentinho?"],
    },
  },
  lucas: {
    es: {
      flavorLines: ["¡Lo de siempre!", "¡Uno de cada cosa!", "¿Sorpréndeme?"],
    },
    fr: {
      flavorLines: ["Comme d'hab !", "Un de chaque !", "Fais-moi la surprise ?"],
    },
    it: {
      flavorLines: ["Il solito!", "Uno di tutto!", "Sorprendimi?"],
    },
    pt: {
      flavorLines: ["O de sempre!", "Um de cada!", "Me surpreende?"],
    },
  },
  emma: {
    es: {
      flavorLines: ["¡Papá dijo que puedo elegir lo que quiera!", "¡Estoy celebrando hoy!", "¿Cuál es el más bonito?"],
    },
    fr: {
      flavorLines: ["Papa a dit que je pouvais tout choisir !", "Je fête quelque chose aujourd'hui !", "C'est lequel le plus joli ?"],
    },
    it: {
      flavorLines: ["Papà ha detto che posso scegliere tutto!", "Sto festeggiando oggi!", "Qual è il più bello?"],
    },
    pt: {
      flavorLines: ["Papai disse que posso escolher qualquer coisa!", "Estou comemorando hoje!", "Qual é o mais bonito?"],
    },
  },
};

export function getRecipeName(id: string, lang: Lang, fallback: string): string {
  if (lang === "en") return fallback;
  return RECIPE_LOCALE[id]?.[lang]?.name ?? fallback;
}
export function getRecipeDescription(id: string, lang: Lang, fallback: string): string {
  if (lang === "en") return fallback;
  return RECIPE_LOCALE[id]?.[lang]?.description ?? fallback;
}
export function getIngredientName(id: string, lang: Lang, fallback: string): string {
  if (lang === "en") return fallback;
  return INGREDIENT_LOCALE[id]?.[lang]?.name ?? fallback;
}
export function getIngredientUnit(id: string, lang: Lang, fallback: string): string {
  if (lang === "en") return fallback;
  return INGREDIENT_LOCALE[id]?.[lang]?.unit ?? fallback;
}
/** Pick a random localized greeting for an archetype in the given lang.
 *  Falls back to the archetype's own English pool if the language has
 *  none — this keeps existing custom archetypes safe. */
export function getArchetypeGreeting(
  archetypeId: string,
  lang: Lang,
  fallbackPool: string[],
): string {
  if (lang === "en") return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
  const pool = ARCHETYPE_LOCALE[archetypeId]?.[lang]?.flavorLines ?? fallbackPool;
  return pool[Math.floor(Math.random() * pool.length)];
}
