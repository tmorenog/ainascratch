"use client";

/**
 * Tiny homegrown i18n. No library — just a dictionary per language and a
 * hook that pulls the current language from the game store. Only the
 * most visible shell UI is translated (buttons, Settings, Welcome,
 * outcome toasts). Recipe names, customer chat, and reviews remain in
 * English for now.
 */
import { useGame } from "./store";

export type Lang = "en" | "es" | "fr" | "it" | "pt";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

export type TKey =
  // Topbar
  | "welcomeTo"
  | "level"
  | "recipeBook"
  | "supermarket"
  | "reviews"
  | "settings"
  // HUD
  | "openShop"
  | "closeShop"
  | "furniture"
  | "music"
  | "muteMusic"
  | "unmuteMusic"
  | "warmingOvens"
  // Settings
  | "settingsTitle"
  | "bakeryName"
  | "save"
  | "pace"
  | "startFresh"
  | "startFreshBlurb"
  | "resetSave"
  | "yesReset"
  | "cancel"
  | "language"
  // Difficulty
  | "cozy"
  | "justRight"
  | "rush"
  | "cozyBlurb"
  | "justRightBlurb"
  | "rushBlurb"
  // Welcome
  | "tagline"
  | "nameBakery"
  | "bakeryPlaceholder"
  | "funnyName"
  | "choosePace"
  | "savesBlurb"
  | "openBakeryCta"
  // Dialog
  | "theirOrder"
  | "sayHi"
  | "chargeThem"
  | "close"
  | "keepPrepping"
  | "grabThemBtn"
  | "letThemGo"
  | "robberSwiped"
  | "robberQuick"
  // Outcomes
  | "paid"
  | "paidExtra"
  | "gotEm"
  | "theyGotAway"
  | "tooExpensive"
  | "leftPet"
  // Serve buttons
  | "serveFor"
  | "tryExtra"
  | "dareExtra"
  // Recipe creator
  | "inventRecipe"
  | "inventRecipeTitle"
  | "inventBlurb"
  | "recipeName"
  | "recipePlaceholder"
  | "recipeCategory"
  | "drinks"
  | "pastries"
  | "baked"
  | "petTreats"
  | "everyoneSafe"
  | "plushies"
  | "everyoneSafeBlurb"
  | "safeFilterHint"
  | "recipeIcon"
  | "recipeIngredients"
  | "recipePrice"
  | "recipeDesc"
  | "recipeDescPlaceholder"
  | "ingredientCostHint"
  | "useSuggested"
  | "markSpecial"
  | "markSpecialBlurb"
  | "markRecommended"
  | "markRecommendedBlurb"
  | "special"
  | "recommended"
  | "addToMenu"
  | "chefsSpecial"
  | "removeRecipe"
  | "yourCreations"
  | "noCreationsYet";

type Dict = Record<TKey, string>;

// Simple placeholder interpolation: replaces {x} with values.name.
function fill(tpl: string, vars?: Record<string, string | number>): string {
  if (!vars) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

const en: Dict = {
  welcomeTo: "Welcome to",
  level: "Lv",
  recipeBook: "Recipe book",
  supermarket: "Supermarket",
  reviews: "Reviews",
  settings: "Settings",
  openShop: "Open Shop",
  closeShop: "Close Shop",
  furniture: "Furniture",
  music: "Music",
  muteMusic: "Mute music",
  unmuteMusic: "Unmute music",
  warmingOvens: "Warming the ovens…",
  settingsTitle: "Settings",
  bakeryName: "Bakery name",
  save: "Save",
  pace: "Pace",
  startFresh: "Start fresh",
  startFreshBlurb:
    "Deletes your save and takes you back to the welcome screen.",
  resetSave: "Reset save",
  yesReset: "Yes, reset everything",
  cancel: "Cancel",
  language: "Language",
  cozy: "Cozy",
  justRight: "Just right",
  rush: "Rush",
  cozyBlurb: "Very patient customers.",
  justRightBlurb: "Balanced flow.",
  rushBlurb: "Faster, bigger tips.",
  tagline: "A cozy baking & drink shop simulator",
  nameBakery: "Name your bakery",
  bakeryPlaceholder: "Bunkin Bonuts",
  funnyName: "🎲 Funny name",
  choosePace: "Choose your pace",
  savesBlurb:
    "Progress saves automatically in your browser. No sign-in, no ads, just cozy baking.",
  openBakeryCta: "Open the bakery →",
  theirOrder: "Their order",
  sayHi: "Say hi to {name}!",
  chargeThem: "Charge them",
  close: "Close",
  keepPrepping: "Keep prepping",
  grabThemBtn: "✋ Grab them!",
  letThemGo: "Let them go",
  robberSwiped: "They swiped {item}!",
  robberQuick: "Grab it back before they escape. Quick!",
  paid: "Paid!",
  paidExtra: "Paid! (+${extra} extra)",
  gotEm: "Got 'em! Item saved!",
  theyGotAway: "They got away!",
  tooExpensive: "Too expensive — walked out!",
  leftPet: "They loved it! Left their {pet} with you!",
  serveFor: "Serve for ${price}",
  tryExtra: "Try +${extra}",
  dareExtra: "Dare +${extra}",
  inventRecipe: "Invent recipe",
  inventRecipeTitle: "Invent a recipe",
  inventBlurb: "Dream up your own dish and put it on the menu.",
  recipeName: "Recipe name",
  recipePlaceholder: "Aina's Rainbow Cloud",
  recipeCategory: "Category",
  drinks: "Drinks",
  pastries: "Pastries",
  baked: "Baked",
  petTreats: "Pet treats",
  everyoneSafe: "Everyone-Safe",
  plushies: "Plushies",
  everyoneSafeBlurb: "No nuts, no chocolate, no coffee — safe for people and pets alike.",
  safeFilterHint: "Only allergy-friendly ingredients are shown.",
  recipeIcon: "Icon",
  recipeIngredients: "Ingredients",
  recipePrice: "Price",
  recipeDesc: "Description",
  recipeDescPlaceholder: "A magical new treat…",
  ingredientCostHint: "Ingredient cost: ${cost} · suggested price: ${suggested}",
  useSuggested: "Use suggested",
  markSpecial: "Chef's special",
  markSpecialBlurb: "Spotlighted — customers order it much more.",
  markRecommended: "Recommended",
  markRecommendedBlurb: "A friendly nudge — ordered a little more.",
  special: "Special",
  recommended: "Recommended",
  addToMenu: "Add to menu ✨",
  chefsSpecial: "Chef's Special",
  removeRecipe: "Remove",
  yourCreations: "Your creations",
  noCreationsYet: "Nothing invented yet — hit the + Invent button to get cooking!",
};

const es: Dict = {
  welcomeTo: "Bienvenido a",
  level: "Nv",
  recipeBook: "Recetario",
  supermarket: "Supermercado",
  reviews: "Reseñas",
  settings: "Ajustes",
  openShop: "Abrir tienda",
  closeShop: "Cerrar tienda",
  furniture: "Muebles",
  music: "Música",
  muteMusic: "Silenciar música",
  unmuteMusic: "Activar música",
  warmingOvens: "Calentando los hornos…",
  settingsTitle: "Ajustes",
  bakeryName: "Nombre de la panadería",
  save: "Guardar",
  pace: "Ritmo",
  startFresh: "Empezar de nuevo",
  startFreshBlurb:
    "Borra tu partida y vuelve a la pantalla de bienvenida.",
  resetSave: "Reiniciar partida",
  yesReset: "Sí, borrar todo",
  cancel: "Cancelar",
  language: "Idioma",
  cozy: "Tranquilo",
  justRight: "Justo",
  rush: "Ajetreado",
  cozyBlurb: "Clientes muy pacientes.",
  justRightBlurb: "Ritmo equilibrado.",
  rushBlurb: "Más rápido, más propinas.",
  tagline: "Un simulador acogedor de panadería y bebidas",
  nameBakery: "Ponle nombre a tu panadería",
  bakeryPlaceholder: "La Dona Feliz",
  funnyName: "🎲 Nombre gracioso",
  choosePace: "Elige tu ritmo",
  savesBlurb:
    "Tu progreso se guarda automáticamente en el navegador. Sin registro, sin anuncios, solo repostería acogedora.",
  openBakeryCta: "Abrir la panadería →",
  theirOrder: "Su pedido",
  sayHi: "¡Saluda a {name}!",
  chargeThem: "Cóbrale",
  close: "Cerrar",
  keepPrepping: "Sigue cocinando",
  grabThemBtn: "✋ ¡Atrápalos!",
  letThemGo: "Déjalos ir",
  robberSwiped: "¡Se llevaron {item}!",
  robberQuick: "¡Recupéralo antes de que escape!",
  paid: "¡Pagado!",
  paidExtra: "¡Pagado! (+${extra} extra)",
  gotEm: "¡Los atrapaste!",
  theyGotAway: "¡Se escaparon!",
  tooExpensive: "Demasiado caro — ¡se fue!",
  leftPet: "¡Les encantó! Te dejaron su {pet}.",
  serveFor: "Servir por ${price}",
  tryExtra: "Prueba +${extra}",
  dareExtra: "Atrévete +${extra}",
  inventRecipe: "Inventar receta",
  inventRecipeTitle: "Inventa una receta",
  inventBlurb: "Inventa tu propio plato y ponlo en la carta.",
  recipeName: "Nombre de la receta",
  recipePlaceholder: "Nube Arcoíris de Aina",
  recipeCategory: "Categoría",
  drinks: "Bebidas",
  pastries: "Pastelería",
  baked: "Horneado",
  petTreats: "Para mascotas",
  everyoneSafe: "Apto para todos",
  plushies: "Peluches",
  everyoneSafeBlurb:
    "Sin frutos secos, chocolate ni café — seguro para personas y mascotas.",
  safeFilterHint: "Solo se muestran ingredientes sin alérgenos.",
  recipeIcon: "Icono",
  recipeIngredients: "Ingredientes",
  recipePrice: "Precio",
  recipeDesc: "Descripción",
  recipeDescPlaceholder: "Un nuevo capricho mágico…",
  ingredientCostHint:
    "Coste de ingredientes: ${cost} · precio sugerido: ${suggested}",
  useSuggested: "Usar sugerido",
  markSpecial: "Especial del chef",
  markSpecialBlurb: "Destacado — los clientes lo piden mucho más.",
  markRecommended: "Recomendado",
  markRecommendedBlurb: "Un guiño amable — se pide un poco más.",
  special: "Especial",
  recommended: "Recomendado",
  addToMenu: "Añadir al menú ✨",
  chefsSpecial: "Especial del chef",
  removeRecipe: "Quitar",
  yourCreations: "Tus creaciones",
  noCreationsYet: "Aún no has inventado nada — ¡pulsa + Inventar y a cocinar!",
};

const fr: Dict = {
  welcomeTo: "Bienvenue à",
  level: "Nv",
  recipeBook: "Livre de recettes",
  supermarket: "Supermarché",
  reviews: "Avis",
  settings: "Paramètres",
  openShop: "Ouvrir la boutique",
  closeShop: "Fermer la boutique",
  furniture: "Meubles",
  music: "Musique",
  muteMusic: "Couper la musique",
  unmuteMusic: "Remettre la musique",
  warmingOvens: "Les fours chauffent…",
  settingsTitle: "Paramètres",
  bakeryName: "Nom de la boulangerie",
  save: "Enregistrer",
  pace: "Rythme",
  startFresh: "Recommencer",
  startFreshBlurb:
    "Efface ta sauvegarde et te ramène à l'écran d'accueil.",
  resetSave: "Réinitialiser",
  yesReset: "Oui, tout effacer",
  cancel: "Annuler",
  language: "Langue",
  cozy: "Tranquille",
  justRight: "Juste ce qu'il faut",
  rush: "Rush",
  cozyBlurb: "Clients très patients.",
  justRightBlurb: "Rythme équilibré.",
  rushBlurb: "Plus rapide, plus de pourboires.",
  tagline: "Un petit simulateur de boulangerie tout doux",
  nameBakery: "Donne un nom à ta boulangerie",
  bakeryPlaceholder: "Aux Délices",
  funnyName: "🎲 Nom rigolo",
  choosePace: "Choisis ton rythme",
  savesBlurb:
    "Ta partie s'enregistre automatiquement dans le navigateur. Pas d'inscription, pas de pubs.",
  openBakeryCta: "Ouvrir la boulangerie →",
  theirOrder: "Leur commande",
  sayHi: "Dis bonjour à {name} !",
  chargeThem: "Fais payer",
  close: "Fermer",
  keepPrepping: "Continue à préparer",
  grabThemBtn: "✋ Attrape-les !",
  letThemGo: "Laisse-les partir",
  robberSwiped: "Ils ont piqué {item} !",
  robberQuick: "Récupère-le avant qu'ils s'enfuient !",
  paid: "Payé !",
  paidExtra: "Payé ! (+{extra} $ en plus)",
  gotEm: "Attrapés !",
  theyGotAway: "Ils se sont enfuis !",
  tooExpensive: "Trop cher — parti !",
  leftPet: "Ils ont adoré ! Ils t'ont laissé leur {pet} !",
  serveFor: "Servir pour {price} $",
  tryExtra: "Tente +{extra} $",
  dareExtra: "Ose +{extra} $",
  inventRecipe: "Inventer une recette",
  inventRecipeTitle: "Invente une recette",
  inventBlurb: "Imagine ton propre plat et mets-le à la carte.",
  recipeName: "Nom de la recette",
  recipePlaceholder: "Nuage arc-en-ciel d'Aina",
  recipeCategory: "Catégorie",
  drinks: "Boissons",
  pastries: "Pâtisseries",
  baked: "Au four",
  petTreats: "Friandises animales",
  everyoneSafe: "Pour tout le monde",
  plushies: "Peluches",
  everyoneSafeBlurb:
    "Sans noix, sans chocolat, sans café — sans risque pour petits et animaux.",
  safeFilterHint: "Seuls les ingrédients sans allergènes sont affichés.",
  recipeIcon: "Icône",
  recipeIngredients: "Ingrédients",
  recipePrice: "Prix",
  recipeDesc: "Description",
  recipeDescPlaceholder: "Une nouvelle gourmandise magique…",
  ingredientCostHint:
    "Coût des ingrédients : {cost} $ · prix conseillé : {suggested} $",
  useSuggested: "Utiliser conseillé",
  markSpecial: "Spéciale du chef",
  markSpecialBlurb: "À l'honneur — les clients en commandent bien plus.",
  markRecommended: "Recommandé",
  markRecommendedBlurb: "Un petit clin d'œil — commandé un peu plus souvent.",
  special: "Spéciale",
  recommended: "Recommandé",
  addToMenu: "Ajouter au menu ✨",
  chefsSpecial: "Spéciale du chef",
  removeRecipe: "Retirer",
  yourCreations: "Tes créations",
  noCreationsYet:
    "Rien d'inventé pour l'instant — clique sur + Inventer pour commencer !",
};

const it: Dict = {
  welcomeTo: "Benvenuto da",
  level: "Lv",
  recipeBook: "Ricettario",
  supermarket: "Supermercato",
  reviews: "Recensioni",
  settings: "Impostazioni",
  openShop: "Apri negozio",
  closeShop: "Chiudi negozio",
  furniture: "Arredamento",
  music: "Musica",
  muteMusic: "Silenzia musica",
  unmuteMusic: "Riattiva musica",
  warmingOvens: "Scaldando i forni…",
  settingsTitle: "Impostazioni",
  bakeryName: "Nome della pasticceria",
  save: "Salva",
  pace: "Ritmo",
  startFresh: "Ricomincia",
  startFreshBlurb:
    "Cancella il salvataggio e torna alla schermata iniziale.",
  resetSave: "Reimposta salvataggio",
  yesReset: "Sì, cancella tutto",
  cancel: "Annulla",
  language: "Lingua",
  cozy: "Rilassato",
  justRight: "Giusto",
  rush: "Frenetico",
  cozyBlurb: "Clienti molto pazienti.",
  justRightBlurb: "Ritmo equilibrato.",
  rushBlurb: "Più veloce, più mance.",
  tagline: "Un simulatore accogliente di pasticceria e bevande",
  nameBakery: "Dai un nome alla pasticceria",
  bakeryPlaceholder: "Dolce Casa",
  funnyName: "🎲 Nome buffo",
  choosePace: "Scegli il ritmo",
  savesBlurb:
    "I progressi si salvano automaticamente nel browser. Niente registrazione, niente pubblicità.",
  openBakeryCta: "Apri la pasticceria →",
  theirOrder: "Il loro ordine",
  sayHi: "Saluta {name}!",
  chargeThem: "Fai pagare",
  close: "Chiudi",
  keepPrepping: "Continua a preparare",
  grabThemBtn: "✋ Prendili!",
  letThemGo: "Lasciali andare",
  robberSwiped: "Hanno rubato {item}!",
  robberQuick: "Recuperalo prima che scappi!",
  paid: "Pagato!",
  paidExtra: "Pagato! (+${extra} extra)",
  gotEm: "Presi!",
  theyGotAway: "Sono scappati!",
  tooExpensive: "Troppo caro — se ne sono andati!",
  leftPet: "Gli è piaciuto! Ti hanno lasciato il loro {pet}!",
  serveFor: "Servi per ${price}",
  tryExtra: "Prova +${extra}",
  dareExtra: "Osa +${extra}",
  inventRecipe: "Inventa ricetta",
  inventRecipeTitle: "Inventa una ricetta",
  inventBlurb: "Inventa il tuo piatto e mettilo nel menu.",
  recipeName: "Nome della ricetta",
  recipePlaceholder: "Nuvola arcobaleno di Aina",
  recipeCategory: "Categoria",
  drinks: "Bevande",
  pastries: "Pasticceria",
  baked: "Al forno",
  petTreats: "Per animali",
  everyoneSafe: "Per tutti",
  plushies: "Peluche",
  everyoneSafeBlurb:
    "Senza frutta secca, cioccolato o caffè — sicuro per persone e animali.",
  safeFilterHint: "Vengono mostrati solo ingredienti senza allergeni.",
  recipeIcon: "Icona",
  recipeIngredients: "Ingredienti",
  recipePrice: "Prezzo",
  recipeDesc: "Descrizione",
  recipeDescPlaceholder: "Una nuova golosità magica…",
  ingredientCostHint:
    "Costo ingredienti: ${cost} · prezzo consigliato: ${suggested}",
  useSuggested: "Usa consigliato",
  markSpecial: "Speciale dello chef",
  markSpecialBlurb: "In primo piano — i clienti lo ordinano molto di più.",
  markRecommended: "Consigliato",
  markRecommendedBlurb: "Un piccolo cenno — ordinato un po' più spesso.",
  special: "Speciale",
  recommended: "Consigliato",
  addToMenu: "Aggiungi al menu ✨",
  chefsSpecial: "Speciale dello chef",
  removeRecipe: "Rimuovi",
  yourCreations: "Le tue creazioni",
  noCreationsYet:
    "Ancora nessuna invenzione — premi + Inventa per iniziare!",
};

const pt: Dict = {
  welcomeTo: "Bem-vindo a",
  level: "Nv",
  recipeBook: "Livro de receitas",
  supermarket: "Supermercado",
  reviews: "Avaliações",
  settings: "Configurações",
  openShop: "Abrir loja",
  closeShop: "Fechar loja",
  furniture: "Móveis",
  music: "Música",
  muteMusic: "Silenciar música",
  unmuteMusic: "Ativar música",
  warmingOvens: "Aquecendo os fornos…",
  settingsTitle: "Configurações",
  bakeryName: "Nome da padaria",
  save: "Salvar",
  pace: "Ritmo",
  startFresh: "Começar de novo",
  startFreshBlurb:
    "Apaga seu progresso e volta para a tela inicial.",
  resetSave: "Redefinir",
  yesReset: "Sim, apagar tudo",
  cancel: "Cancelar",
  language: "Idioma",
  cozy: "Tranquilo",
  justRight: "No ponto",
  rush: "Corrido",
  cozyBlurb: "Clientes bem pacientes.",
  justRightBlurb: "Ritmo equilibrado.",
  rushBlurb: "Mais rápido, mais gorjetas.",
  tagline: "Um simulador aconchegante de padaria e bebidas",
  nameBakery: "Dê um nome à sua padaria",
  bakeryPlaceholder: "Docinho Feliz",
  funnyName: "🎲 Nome engraçado",
  choosePace: "Escolha o ritmo",
  savesBlurb:
    "Seu progresso é salvo automaticamente no navegador. Sem cadastro, sem anúncios.",
  openBakeryCta: "Abrir a padaria →",
  theirOrder: "O pedido",
  sayHi: "Diga oi para {name}!",
  chargeThem: "Cobrar",
  close: "Fechar",
  keepPrepping: "Continue preparando",
  grabThemBtn: "✋ Pegue-os!",
  letThemGo: "Deixe ir",
  robberSwiped: "Roubaram {item}!",
  robberQuick: "Pegue de volta antes que escape!",
  paid: "Pago!",
  paidExtra: "Pago! (+${extra} extra)",
  gotEm: "Peguei!",
  theyGotAway: "Escaparam!",
  tooExpensive: "Muito caro — foi embora!",
  leftPet: "Adoraram! Deixaram o {pet} com você!",
  serveFor: "Servir por ${price}",
  tryExtra: "Tente +${extra}",
  dareExtra: "Ouse +${extra}",
  inventRecipe: "Inventar receita",
  inventRecipeTitle: "Invente uma receita",
  inventBlurb: "Invente seu próprio prato e coloque no cardápio.",
  recipeName: "Nome da receita",
  recipePlaceholder: "Nuvem Arco-íris da Aina",
  recipeCategory: "Categoria",
  drinks: "Bebidas",
  pastries: "Doces",
  baked: "Assados",
  petTreats: "Para pets",
  everyoneSafe: "Para todos",
  plushies: "Pelúcias",
  everyoneSafeBlurb:
    "Sem castanhas, chocolate ou café — seguro para pessoas e bichinhos.",
  safeFilterHint: "Só aparecem ingredientes sem alergênicos.",
  recipeIcon: "Ícone",
  recipeIngredients: "Ingredientes",
  recipePrice: "Preço",
  recipeDesc: "Descrição",
  recipeDescPlaceholder: "Uma nova delícia mágica…",
  ingredientCostHint:
    "Custo dos ingredientes: ${cost} · preço sugerido: ${suggested}",
  useSuggested: "Usar sugerido",
  markSpecial: "Especial do chef",
  markSpecialBlurb: "Em destaque — clientes pedem muito mais.",
  markRecommended: "Recomendado",
  markRecommendedBlurb: "Um incentivo amigável — pedido um pouco mais.",
  special: "Especial",
  recommended: "Recomendado",
  addToMenu: "Adicionar ao menu ✨",
  chefsSpecial: "Especial do chef",
  removeRecipe: "Remover",
  yourCreations: "Suas criações",
  noCreationsYet:
    "Nada inventado ainda — toque em + Inventar para começar!",
};

const DICTS: Record<Lang, Dict> = { en, es, fr, it, pt };

export function t(
  lang: Lang,
  key: TKey,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTS[lang] ?? en;
  return fill(dict[key] ?? en[key] ?? key, vars);
}

/** Returns a translate function bound to the current language. */
export function useT(): (
  key: TKey,
  vars?: Record<string, string | number>,
) => string {
  const lang = useGame((s) => s.language);
  return (key, vars) => t(lang, key, vars);
}
