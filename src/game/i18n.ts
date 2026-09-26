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
  | "noCreationsYet"
  // Plush combiner
  | "pickAnimal"
  | "pickTheme"
  | "combiningPlush"
  | "pickBothToCombine"
  | "plushAnimal_bear"
  | "plushAnimal_bunny"
  | "plushAnimal_cat"
  | "plushAnimal_puppy"
  | "plushAnimal_fox"
  | "plushAnimal_panda"
  | "plushAnimal_penguin"
  | "plushAnimal_frog"
  | "plushAnimal_koala"
  | "plushAnimal_tiger"
  | "plushAnimal_owl"
  | "plushAnimal_unicorn"
  | "plushTheme_pineapple"
  | "plushTheme_donut"
  | "plushTheme_cupcake"
  | "plushTheme_strawberry"
  | "plushTheme_rainbow"
  | "plushTheme_cloud"
  | "plushTheme_star"
  | "plushTheme_croissant"
  | "plushTheme_coffee"
  | "plushTheme_lemon"
  | "plushTheme_flower"
  | "plushTheme_heart"
  | "plushTheme_watermelon"
  | "plushTheme_cherry"
  | "plushTheme_mushroom"
  | "plushTheme_moon"
  // Recipe book
  | "recipeBookTitle"
  | "tabAll"
  | "tabMine"
  | "unlocksAtLevel"
  // Order ticket
  | "todaysOrder"
  | "serveBtn"
  | "prepFirst"
  | "petTreatPlease"
  // Reviews panel
  | "reviewsTitle"
  | "ordersServed"
  | "bestStreak"
  | "avgStars"
  | "totalTips"
  | "noReviewsYet"
  | "tipAmount"
  // Supermarket / pantry
  | "supermarketTitle"
  | "youHave"
  | "deliveryArrivingSoon"
  | "totalLabel"
  | "clearCart"
  | "placeOrder"
  | "incomingDeliveries"
  | "pantryTitle"
  | "deliveriesOnWay"
  | "callSupermarket"
  // Prep scene
  | "stationDrinkTitle"
  | "stationPastryTitle"
  | "stationOvenTitle"
  | "stationScratchTitle"
  | "stationPetTitle"
  | "stationShelfTitle"
  | "stationDrinkAction"
  | "stationPastryAction"
  | "stationOvenAction"
  | "stationScratchAction"
  | "stationPetAction"
  | "stationShelfAction"
  | "allDoneDelicious"
  | "plateIt"
  | "pickRecipeToMake"
  | "nothingUnlockedYet"
  | "combiningRecipe"
  | "tapIngredientsToAdd"
  | "emptyBowl"
  | "back"
  | "addAllIngredientsFirst"
  | "needLabel"
  | "tapToAddIngredient"
  | "almostReady"
  // Tutorial
  | "tutorialSkip"
  | "tutorialNext"
  | "tutorialFinish"
  | "tutorialBack"
  | "tutorialStepLabel"
  | "tutorialTitle_1"
  | "tutorialBody_1"
  | "tutorialTitle_2"
  | "tutorialBody_2"
  | "tutorialTitle_3"
  | "tutorialBody_3"
  | "tutorialTitle_4"
  | "tutorialBody_4"
  | "tutorialTitle_5"
  | "tutorialBody_5"
  | "tutorialTitle_6"
  | "tutorialBody_6"
  | "tutorialTitle_7"
  | "tutorialBody_7"
  | "tutorialTitle_8"
  | "tutorialBody_8"
  | "replayTutorial";

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
  pickAnimal: "Pick an animal 🐾",
  pickTheme: "Pick a theme 🎀",
  combiningPlush: "🧸 Combining {theme} + {animal} → a one-of-a-kind themed plush!",
  pickBothToCombine: "Pick an animal and a theme to combine them into a custom plush.",
  plushAnimal_bear: "Bear",
  plushAnimal_bunny: "Bunny",
  plushAnimal_cat: "Cat",
  plushAnimal_puppy: "Puppy",
  plushAnimal_fox: "Fox",
  plushAnimal_panda: "Panda",
  plushAnimal_penguin: "Penguin",
  plushAnimal_frog: "Frog",
  plushAnimal_koala: "Koala",
  plushAnimal_tiger: "Tiger",
  plushAnimal_owl: "Owl",
  plushAnimal_unicorn: "Unicorn",
  plushTheme_pineapple: "Pineapple",
  plushTheme_donut: "Donut",
  plushTheme_cupcake: "Cupcake",
  plushTheme_strawberry: "Strawberry",
  plushTheme_rainbow: "Rainbow",
  plushTheme_cloud: "Cloud",
  plushTheme_star: "Star",
  plushTheme_croissant: "Croissant",
  plushTheme_coffee: "Coffee",
  plushTheme_lemon: "Lemon",
  plushTheme_flower: "Flower",
  plushTheme_heart: "Heart",
  plushTheme_watermelon: "Watermelon",
  plushTheme_cherry: "Cherry",
  plushTheme_mushroom: "Mushroom",
  plushTheme_moon: "Moon",
  recipeBookTitle: "Recipe Book 📖",
  tabAll: "All",
  tabMine: "Mine",
  unlocksAtLevel: "Unlocks at level {level}",
  todaysOrder: "Today's order",
  serveBtn: "Serve ✨",
  prepFirst: "Prep first",
  petTreatPlease: "pet treat please!",
  reviewsTitle: "Reviews & Progress ⭐",
  ordersServed: "Orders served",
  bestStreak: "Best streak",
  avgStars: "Avg stars",
  totalTips: "Total tips",
  noReviewsYet: "No reviews yet — serve your first customer!",
  tipAmount: "+ ${tip} tip",
  supermarketTitle: "Supermarket 🛒",
  youHave: "You have",
  deliveryArrivingSoon: "🚚 {count} delivery arriving soon…",
  totalLabel: "Total",
  clearCart: "Clear",
  placeOrder: "Place order (arrives in ~8s)",
  incomingDeliveries: "Incoming deliveries",
  pantryTitle: "Pantry Shelf 🧺",
  deliveriesOnWay: "Deliveries on the way",
  callSupermarket: "🛒 Call the supermarket",
  stationDrinkTitle: "Drink Bar",
  stationPastryTitle: "Pastry Counter",
  stationOvenTitle: "Oven",
  stationScratchTitle: "Bakery Oven",
  stationPetTitle: "Pet Treat Nook",
  stationShelfTitle: "Plush Shelf",
  stationDrinkAction: "Squeeze & pour 🍋",
  stationPastryAction: "Decorate 🎀",
  stationOvenAction: "Bake 🔥",
  stationScratchAction: "Roll & bake 🔥",
  stationPetAction: "Shape & bake 🐾",
  stationShelfAction: "Gift-wrap 🎀",
  allDoneDelicious: "All done — looks delicious!",
  plateIt: "Plate it ✨",
  pickRecipeToMake: "Pick a recipe to make",
  nothingUnlockedYet: "Nothing unlocked here yet.",
  combiningRecipe: "Combining: {name}",
  tapIngredientsToAdd: "Tap each ingredient to add it to the bowl.",
  emptyBowl: "empty bowl",
  back: "Back",
  addAllIngredientsFirst: "Add all ingredients first",
  needLabel: "Need:",
  tapToAddIngredient: "tap to add",
  almostReady: "Almost ready…",
  tutorialSkip: "Skip",
  tutorialNext: "Next →",
  tutorialFinish: "Let's bake! 🎂",
  tutorialBack: "← Back",
  tutorialStepLabel: "Step {n} of {total}",
  tutorialTitle_1: "Welcome to your bakery! 🧁",
  tutorialBody_1: "You're the chef, cashier, and boss all rolled into one. Let's do a quick walkthrough so you know what to do.",
  tutorialTitle_2: "Open the shop 🟢",
  tutorialBody_2: "Tap the green Open Shop button (bottom-left). Customers only come in once you're open for business.",
  tutorialTitle_3: "Move around 🚶",
  tutorialBody_3: "Drag to look around and use W A S D (or the joystick on touch) to walk. Get to know the layout: drink bar, pastry counter, ovens, and the service counter with the little bell.",
  tutorialTitle_4: "A customer arrives 🔔",
  tutorialBody_4: "When someone walks up to the counter, walk over and tap them to see their order. Watch the patience clock — hurry helps!",
  tutorialTitle_5: "Make their order 🥣",
  tutorialBody_5: "Look at the black ticket at the bottom. Walk to the matching station (drinks go to the drink bar, pastries to the pastry counter, and so on) and press E to start.",
  tutorialTitle_6: "Combine + cook ✨",
  tutorialBody_6: "Tap each ingredient to add it to the bowl, then hit the big go button. Wait for the timer, then tap Plate it.",
  tutorialTitle_7: "Serve them 🎀",
  tutorialBody_7: "Walk back to the customer at the counter and tap Serve. Fast + correct orders earn stars, coins, and tips!",
  tutorialTitle_8: "You're ready! 🎉",
  tutorialBody_8: "Level up to unlock new recipes, invent your own, and even open a Cat Cafe downstairs. Have fun!",
  replayTutorial: "Replay tutorial",
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
  pickAnimal: "Elige un animal 🐾",
  pickTheme: "Elige un tema 🎀",
  combiningPlush: "🧸 Combinando {theme} + {animal} → ¡un peluche temático único!",
  pickBothToCombine: "Elige un animal y un tema para combinarlos en un peluche único.",
  plushAnimal_bear: "Oso",
  plushAnimal_bunny: "Conejito",
  plushAnimal_cat: "Gato",
  plushAnimal_puppy: "Perrito",
  plushAnimal_fox: "Zorro",
  plushAnimal_panda: "Panda",
  plushAnimal_penguin: "Pingüino",
  plushAnimal_frog: "Rana",
  plushAnimal_koala: "Koala",
  plushAnimal_tiger: "Tigre",
  plushAnimal_owl: "Búho",
  plushAnimal_unicorn: "Unicornio",
  plushTheme_pineapple: "Piña",
  plushTheme_donut: "Rosquilla",
  plushTheme_cupcake: "Cupcake",
  plushTheme_strawberry: "Fresa",
  plushTheme_rainbow: "Arcoíris",
  plushTheme_cloud: "Nube",
  plushTheme_star: "Estrella",
  plushTheme_croissant: "Croissant",
  plushTheme_coffee: "Café",
  plushTheme_lemon: "Limón",
  plushTheme_flower: "Flor",
  plushTheme_heart: "Corazón",
  plushTheme_watermelon: "Sandía",
  plushTheme_cherry: "Cereza",
  plushTheme_mushroom: "Seta",
  plushTheme_moon: "Luna",
  recipeBookTitle: "Recetario 📖",
  tabAll: "Todas",
  tabMine: "Mías",
  unlocksAtLevel: "Se desbloquea en el nivel {level}",
  todaysOrder: "Pedido de hoy",
  serveBtn: "Servir ✨",
  prepFirst: "Prepara primero",
  petTreatPlease: "¡un premio para mi mascota!",
  reviewsTitle: "Reseñas y Progreso ⭐",
  ordersServed: "Pedidos servidos",
  bestStreak: "Mejor racha",
  avgStars: "Estrellas prom.",
  totalTips: "Propinas totales",
  noReviewsYet: "Aún no hay reseñas — ¡atiende a tu primer cliente!",
  tipAmount: "+ ${tip} propina",
  supermarketTitle: "Supermercado 🛒",
  youHave: "Tienes",
  deliveryArrivingSoon: "🚚 {count} entrega llegando pronto…",
  totalLabel: "Total",
  clearCart: "Vaciar",
  placeOrder: "Hacer pedido (llega en ~8s)",
  incomingDeliveries: "Entregas en camino",
  pantryTitle: "Despensa 🧺",
  deliveriesOnWay: "Entregas en camino",
  callSupermarket: "🛒 Llamar al supermercado",
  stationDrinkTitle: "Barra de bebidas",
  stationPastryTitle: "Mesa de pastelería",
  stationOvenTitle: "Horno",
  stationScratchTitle: "Horno de panadería",
  stationPetTitle: "Rincón de mascotas",
  stationShelfTitle: "Estante de peluches",
  stationDrinkAction: "Exprime y vierte 🍋",
  stationPastryAction: "Decora 🎀",
  stationOvenAction: "Hornea 🔥",
  stationScratchAction: "Amasa y hornea 🔥",
  stationPetAction: "Da forma y hornea 🐾",
  stationShelfAction: "Envuelve 🎀",
  allDoneDelicious: "¡Listo — se ve delicioso!",
  plateIt: "¡A emplatar! ✨",
  pickRecipeToMake: "Elige una receta para hacer",
  nothingUnlockedYet: "Aún no hay nada desbloqueado aquí.",
  combiningRecipe: "Combinando: {name}",
  tapIngredientsToAdd: "Toca cada ingrediente para añadirlo al bol.",
  emptyBowl: "bol vacío",
  back: "Atrás",
  addAllIngredientsFirst: "Añade todos los ingredientes primero",
  needLabel: "Faltan:",
  tapToAddIngredient: "toca para añadir",
  almostReady: "Casi listo…",
  tutorialSkip: "Saltar",
  tutorialNext: "Siguiente →",
  tutorialFinish: "¡A hornear! 🎂",
  tutorialBack: "← Atrás",
  tutorialStepLabel: "Paso {n} de {total}",
  tutorialTitle_1: "¡Bienvenido a tu panadería! 🧁",
  tutorialBody_1: "Eres el chef, cajero y jefe todo en uno. Vamos a hacer un pequeño recorrido para que sepas qué hacer.",
  tutorialTitle_2: "Abre la tienda 🟢",
  tutorialBody_2: "Toca el botón verde Abrir Tienda (abajo a la izquierda). Los clientes solo entran cuando estás abierto.",
  tutorialTitle_3: "Muévete 🚶",
  tutorialBody_3: "Arrastra para mirar y usa W A S D (o el joystick en móvil) para caminar. Conoce el lugar: barra de bebidas, pastelería, hornos y el mostrador de servicio con la campanita.",
  tutorialTitle_4: "Llega un cliente 🔔",
  tutorialBody_4: "Cuando alguien se acerque al mostrador, ve y tócalo para ver su pedido. ¡Observa el reloj de paciencia — la prisa ayuda!",
  tutorialTitle_5: "Prepara su pedido 🥣",
  tutorialBody_5: "Mira el ticket negro de abajo. Ve a la estación correcta (bebidas a la barra, pasteles al mostrador, etc.) y pulsa E para empezar.",
  tutorialTitle_6: "Combina y cocina ✨",
  tutorialBody_6: "Toca cada ingrediente para añadirlo al bol y luego pulsa el botón grande. Espera el temporizador y toca ¡A emplatar!",
  tutorialTitle_7: "Sírveselo 🎀",
  tutorialBody_7: "Vuelve donde el cliente en el mostrador y toca Servir. ¡Los pedidos rápidos y correctos ganan estrellas, monedas y propinas!",
  tutorialTitle_8: "¡Ya estás listo! 🎉",
  tutorialBody_8: "Sube de nivel para desbloquear nuevas recetas, inventar las tuyas y hasta abrir un Cat Cafe abajo. ¡Diviértete!",
  replayTutorial: "Repetir tutorial",
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
  pickAnimal: "Choisis un animal 🐾",
  pickTheme: "Choisis un thème 🎀",
  combiningPlush:
    "🧸 On mélange {theme} + {animal} → une peluche unique en son genre !",
  pickBothToCombine:
    "Choisis un animal et un thème pour en faire une peluche personnalisée.",
  plushAnimal_bear: "Ours",
  plushAnimal_bunny: "Lapin",
  plushAnimal_cat: "Chat",
  plushAnimal_puppy: "Chiot",
  plushAnimal_fox: "Renard",
  plushAnimal_panda: "Panda",
  plushAnimal_penguin: "Pingouin",
  plushAnimal_frog: "Grenouille",
  plushAnimal_koala: "Koala",
  plushAnimal_tiger: "Tigre",
  plushAnimal_owl: "Hibou",
  plushAnimal_unicorn: "Licorne",
  plushTheme_pineapple: "Ananas",
  plushTheme_donut: "Beignet",
  plushTheme_cupcake: "Cupcake",
  plushTheme_strawberry: "Fraise",
  plushTheme_rainbow: "Arc-en-ciel",
  plushTheme_cloud: "Nuage",
  plushTheme_star: "Étoile",
  plushTheme_croissant: "Croissant",
  plushTheme_coffee: "Café",
  plushTheme_lemon: "Citron",
  plushTheme_flower: "Fleur",
  plushTheme_heart: "Cœur",
  plushTheme_watermelon: "Pastèque",
  plushTheme_cherry: "Cerise",
  plushTheme_mushroom: "Champignon",
  plushTheme_moon: "Lune",
  recipeBookTitle: "Livre de recettes 📖",
  tabAll: "Tout",
  tabMine: "Les miennes",
  unlocksAtLevel: "Débloqué au niveau {level}",
  todaysOrder: "Commande du jour",
  serveBtn: "Servir ✨",
  prepFirst: "Prépare d'abord",
  petTreatPlease: "une friandise pour mon animal !",
  reviewsTitle: "Avis & Progrès ⭐",
  ordersServed: "Commandes servies",
  bestStreak: "Meilleure série",
  avgStars: "Étoiles moy.",
  totalTips: "Pourboires totaux",
  noReviewsYet: "Aucun avis — sers ton premier client !",
  tipAmount: "+ {tip} $ de pourboire",
  supermarketTitle: "Supermarché 🛒",
  youHave: "Tu as",
  deliveryArrivingSoon: "🚚 {count} livraison en chemin…",
  totalLabel: "Total",
  clearCart: "Vider",
  placeOrder: "Commander (arrive dans ~8s)",
  incomingDeliveries: "Livraisons en cours",
  pantryTitle: "Garde-manger 🧺",
  deliveriesOnWay: "Livraisons en cours",
  callSupermarket: "🛒 Appeler le supermarché",
  stationDrinkTitle: "Bar à boissons",
  stationPastryTitle: "Comptoir pâtisserie",
  stationOvenTitle: "Four",
  stationScratchTitle: "Four de boulangerie",
  stationPetTitle: "Coin animaux",
  stationShelfTitle: "Étagère à peluches",
  stationDrinkAction: "Presse & verse 🍋",
  stationPastryAction: "Décore 🎀",
  stationOvenAction: "Cuis 🔥",
  stationScratchAction: "Étale & cuis 🔥",
  stationPetAction: "Façonne & cuis 🐾",
  stationShelfAction: "Emballe 🎀",
  allDoneDelicious: "C'est prêt — ça a l'air délicieux !",
  plateIt: "À dresser ! ✨",
  pickRecipeToMake: "Choisis une recette à faire",
  nothingUnlockedYet: "Rien de débloqué ici pour l'instant.",
  combiningRecipe: "On assemble : {name}",
  tapIngredientsToAdd: "Clique chaque ingrédient pour l'ajouter au bol.",
  emptyBowl: "bol vide",
  back: "Retour",
  addAllIngredientsFirst: "Ajoute d'abord tous les ingrédients",
  needLabel: "Manque :",
  tapToAddIngredient: "clique pour ajouter",
  almostReady: "Presque prêt…",
  tutorialSkip: "Passer",
  tutorialNext: "Suivant →",
  tutorialFinish: "On cuisine ! 🎂",
  tutorialBack: "← Retour",
  tutorialStepLabel: "Étape {n} sur {total}",
  tutorialTitle_1: "Bienvenue dans ta boulangerie ! 🧁",
  tutorialBody_1: "Tu es le chef, le caissier et le patron, tout en un. On va faire un petit tour pour que tu saches quoi faire.",
  tutorialTitle_2: "Ouvre la boutique 🟢",
  tutorialBody_2: "Clique sur le bouton vert Ouvrir la boutique (en bas à gauche). Les clients n'arrivent que quand tu es ouvert.",
  tutorialTitle_3: "Déplace-toi 🚶",
  tutorialBody_3: "Glisse pour regarder autour et utilise Z Q S D (ou le joystick sur mobile) pour marcher. Repère les lieux : bar à boissons, pâtisserie, fours et comptoir de service.",
  tutorialTitle_4: "Un client arrive 🔔",
  tutorialBody_4: "Quand quelqu'un s'approche du comptoir, va le voir et clique pour voir sa commande. Regarde l'horloge de patience — la vitesse aide !",
  tutorialTitle_5: "Prépare sa commande 🥣",
  tutorialBody_5: "Regarde le ticket noir en bas. Va au poste correspondant (boissons au bar, pâtisseries au comptoir, etc.) et appuie sur E pour commencer.",
  tutorialTitle_6: "Assemble + cuis ✨",
  tutorialBody_6: "Clique chaque ingrédient pour l'ajouter au bol, puis appuie sur le gros bouton. Attends le minuteur, puis clique À dresser.",
  tutorialTitle_7: "Sers-lui 🎀",
  tutorialBody_7: "Retourne voir le client au comptoir et clique Servir. Les commandes rapides et correctes rapportent étoiles, pièces et pourboires !",
  tutorialTitle_8: "Tu es prêt ! 🎉",
  tutorialBody_8: "Monte de niveau pour débloquer de nouvelles recettes, inventer les tiennes et même ouvrir un Cat Cafe en bas. Amuse-toi !",
  replayTutorial: "Rejouer le tutoriel",
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
  pickAnimal: "Scegli un animale 🐾",
  pickTheme: "Scegli un tema 🎀",
  combiningPlush:
    "🧸 Stai unendo {theme} + {animal} → un peluche unico nel suo genere!",
  pickBothToCombine:
    "Scegli un animale e un tema per unirli in un peluche personalizzato.",
  plushAnimal_bear: "Orso",
  plushAnimal_bunny: "Coniglietto",
  plushAnimal_cat: "Gatto",
  plushAnimal_puppy: "Cucciolo",
  plushAnimal_fox: "Volpe",
  plushAnimal_panda: "Panda",
  plushAnimal_penguin: "Pinguino",
  plushAnimal_frog: "Rana",
  plushAnimal_koala: "Koala",
  plushAnimal_tiger: "Tigre",
  plushAnimal_owl: "Gufo",
  plushAnimal_unicorn: "Unicorno",
  plushTheme_pineapple: "Ananas",
  plushTheme_donut: "Ciambella",
  plushTheme_cupcake: "Cupcake",
  plushTheme_strawberry: "Fragola",
  plushTheme_rainbow: "Arcobaleno",
  plushTheme_cloud: "Nuvola",
  plushTheme_star: "Stella",
  plushTheme_croissant: "Cornetto",
  plushTheme_coffee: "Caffè",
  plushTheme_lemon: "Limone",
  plushTheme_flower: "Fiore",
  plushTheme_heart: "Cuore",
  plushTheme_watermelon: "Anguria",
  plushTheme_cherry: "Ciliegia",
  plushTheme_mushroom: "Fungo",
  plushTheme_moon: "Luna",
  recipeBookTitle: "Ricettario 📖",
  tabAll: "Tutte",
  tabMine: "Le mie",
  unlocksAtLevel: "Si sblocca al livello {level}",
  todaysOrder: "Ordine di oggi",
  serveBtn: "Servi ✨",
  prepFirst: "Prepara prima",
  petTreatPlease: "uno snack per il mio animale!",
  reviewsTitle: "Recensioni e Progressi ⭐",
  ordersServed: "Ordini serviti",
  bestStreak: "Miglior striscia",
  avgStars: "Stelle medie",
  totalTips: "Mance totali",
  noReviewsYet: "Ancora nessuna recensione — servi il primo cliente!",
  tipAmount: "+ ${tip} di mancia",
  supermarketTitle: "Supermercato 🛒",
  youHave: "Hai",
  deliveryArrivingSoon: "🚚 {count} consegna in arrivo…",
  totalLabel: "Totale",
  clearCart: "Svuota",
  placeOrder: "Ordina (arriva in ~8s)",
  incomingDeliveries: "Consegne in arrivo",
  pantryTitle: "Dispensa 🧺",
  deliveriesOnWay: "Consegne in arrivo",
  callSupermarket: "🛒 Chiama il supermercato",
  stationDrinkTitle: "Bancone bevande",
  stationPastryTitle: "Bancone pasticceria",
  stationOvenTitle: "Forno",
  stationScratchTitle: "Forno da pasticceria",
  stationPetTitle: "Angolo animali",
  stationShelfTitle: "Scaffale peluche",
  stationDrinkAction: "Spremi e versa 🍋",
  stationPastryAction: "Decora 🎀",
  stationOvenAction: "Inforna 🔥",
  stationScratchAction: "Stendi e inforna 🔥",
  stationPetAction: "Dai forma e inforna 🐾",
  stationShelfAction: "Impacchetta 🎀",
  allDoneDelicious: "Pronto — ha un aspetto delizioso!",
  plateIt: "Impiatta! ✨",
  pickRecipeToMake: "Scegli una ricetta da fare",
  nothingUnlockedYet: "Ancora niente sbloccato qui.",
  combiningRecipe: "Stai unendo: {name}",
  tapIngredientsToAdd: "Tocca ogni ingrediente per aggiungerlo alla ciotola.",
  emptyBowl: "ciotola vuota",
  back: "Indietro",
  addAllIngredientsFirst: "Aggiungi prima tutti gli ingredienti",
  needLabel: "Manca:",
  tapToAddIngredient: "tocca per aggiungere",
  almostReady: "Quasi pronto…",
  tutorialSkip: "Salta",
  tutorialNext: "Avanti →",
  tutorialFinish: "Si cuoce! 🎂",
  tutorialBack: "← Indietro",
  tutorialStepLabel: "Passo {n} di {total}",
  tutorialTitle_1: "Benvenuto nella tua pasticceria! 🧁",
  tutorialBody_1: "Sei chef, cassiere e capo tutto in uno. Facciamo un giro veloce così sai cosa fare.",
  tutorialTitle_2: "Apri il negozio 🟢",
  tutorialBody_2: "Tocca il pulsante verde Apri negozio (in basso a sinistra). I clienti entrano solo se sei aperto.",
  tutorialTitle_3: "Muoviti 🚶",
  tutorialBody_3: "Trascina per guardarti intorno e usa W A S D (o il joystick su mobile) per camminare. Familiarizza con il posto: bancone bevande, pasticceria, forni e bancone servizio con la campanella.",
  tutorialTitle_4: "Arriva un cliente 🔔",
  tutorialBody_4: "Quando qualcuno si avvicina al bancone, vai da lui e toccalo per vedere l'ordine. Guarda l'orologio della pazienza — la velocità aiuta!",
  tutorialTitle_5: "Prepara l'ordine 🥣",
  tutorialBody_5: "Guarda il biglietto nero in basso. Vai alla stazione giusta (bevande al bancone bevande, dolci in pasticceria, ecc.) e premi E per iniziare.",
  tutorialTitle_6: "Combina e cuoci ✨",
  tutorialBody_6: "Tocca ogni ingrediente per aggiungerlo alla ciotola, poi premi il pulsante grosso. Aspetta il timer e tocca Impiatta.",
  tutorialTitle_7: "Servi 🎀",
  tutorialBody_7: "Torna dal cliente al bancone e tocca Servi. Ordini veloci e corretti portano stelle, monete e mance!",
  tutorialTitle_8: "Sei pronto! 🎉",
  tutorialBody_8: "Sali di livello per sbloccare nuove ricette, inventare le tue e persino aprire un Cat Cafe di sotto. Divertiti!",
  replayTutorial: "Rivedi il tutorial",
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
  pickAnimal: "Escolha um animal 🐾",
  pickTheme: "Escolha um tema 🎀",
  combiningPlush:
    "🧸 Combinando {theme} + {animal} → uma pelúcia temática única!",
  pickBothToCombine:
    "Escolha um animal e um tema para combiná-los em uma pelúcia personalizada.",
  plushAnimal_bear: "Urso",
  plushAnimal_bunny: "Coelhinho",
  plushAnimal_cat: "Gato",
  plushAnimal_puppy: "Cachorrinho",
  plushAnimal_fox: "Raposa",
  plushAnimal_panda: "Panda",
  plushAnimal_penguin: "Pinguim",
  plushAnimal_frog: "Sapo",
  plushAnimal_koala: "Coala",
  plushAnimal_tiger: "Tigre",
  plushAnimal_owl: "Coruja",
  plushAnimal_unicorn: "Unicórnio",
  plushTheme_pineapple: "Abacaxi",
  plushTheme_donut: "Rosquinha",
  plushTheme_cupcake: "Cupcake",
  plushTheme_strawberry: "Morango",
  plushTheme_rainbow: "Arco-íris",
  plushTheme_cloud: "Nuvem",
  plushTheme_star: "Estrela",
  plushTheme_croissant: "Croissant",
  plushTheme_coffee: "Café",
  plushTheme_lemon: "Limão",
  plushTheme_flower: "Flor",
  plushTheme_heart: "Coração",
  plushTheme_watermelon: "Melancia",
  plushTheme_cherry: "Cereja",
  plushTheme_mushroom: "Cogumelo",
  plushTheme_moon: "Lua",
  recipeBookTitle: "Livro de receitas 📖",
  tabAll: "Todas",
  tabMine: "Minhas",
  unlocksAtLevel: "Desbloqueia no nível {level}",
  todaysOrder: "Pedido de hoje",
  serveBtn: "Servir ✨",
  prepFirst: "Prepare primeiro",
  petTreatPlease: "um petisco para meu bichinho!",
  reviewsTitle: "Avaliações e Progresso ⭐",
  ordersServed: "Pedidos servidos",
  bestStreak: "Melhor sequência",
  avgStars: "Média de estrelas",
  totalTips: "Gorjetas totais",
  noReviewsYet: "Ainda sem avaliações — atenda seu primeiro cliente!",
  tipAmount: "+ ${tip} de gorjeta",
  supermarketTitle: "Supermercado 🛒",
  youHave: "Você tem",
  deliveryArrivingSoon: "🚚 {count} entrega chegando em breve…",
  totalLabel: "Total",
  clearCart: "Limpar",
  placeOrder: "Fazer pedido (chega em ~8s)",
  incomingDeliveries: "Entregas a caminho",
  pantryTitle: "Despensa 🧺",
  deliveriesOnWay: "Entregas a caminho",
  callSupermarket: "🛒 Chamar o supermercado",
  stationDrinkTitle: "Balcão de bebidas",
  stationPastryTitle: "Balcão de doces",
  stationOvenTitle: "Forno",
  stationScratchTitle: "Forno da padaria",
  stationPetTitle: "Cantinho dos pets",
  stationShelfTitle: "Prateleira de pelúcias",
  stationDrinkAction: "Esprema e despeje 🍋",
  stationPastryAction: "Decore 🎀",
  stationOvenAction: "Assar 🔥",
  stationScratchAction: "Abra e asse 🔥",
  stationPetAction: "Modele e asse 🐾",
  stationShelfAction: "Embrulhe 🎀",
  allDoneDelicious: "Pronto — está com uma cara deliciosa!",
  plateIt: "Empratar! ✨",
  pickRecipeToMake: "Escolha uma receita para fazer",
  nothingUnlockedYet: "Nada desbloqueado aqui ainda.",
  combiningRecipe: "Combinando: {name}",
  tapIngredientsToAdd: "Toque em cada ingrediente para colocá-lo na tigela.",
  emptyBowl: "tigela vazia",
  back: "Voltar",
  addAllIngredientsFirst: "Adicione todos os ingredientes primeiro",
  needLabel: "Falta:",
  tapToAddIngredient: "toque para adicionar",
  almostReady: "Quase pronto…",
  tutorialSkip: "Pular",
  tutorialNext: "Próximo →",
  tutorialFinish: "Bora assar! 🎂",
  tutorialBack: "← Voltar",
  tutorialStepLabel: "Passo {n} de {total}",
  tutorialTitle_1: "Bem-vindo à sua padaria! 🧁",
  tutorialBody_1: "Você é chef, caixa e chefe tudo num só. Vamos dar uma olhadinha rápida pra você saber o que fazer.",
  tutorialTitle_2: "Abra a loja 🟢",
  tutorialBody_2: "Toque no botão verde Abrir Loja (canto inferior esquerdo). Clientes só entram quando você está aberto.",
  tutorialTitle_3: "Ande por aí 🚶",
  tutorialBody_3: "Arraste pra olhar em volta e use W A S D (ou o joystick no celular) pra andar. Conheça o lugar: balcão de bebidas, doces, fornos e o balcão de atendimento com a campainha.",
  tutorialTitle_4: "Um cliente chegou 🔔",
  tutorialBody_4: "Quando alguém se aproximar do balcão, vá até lá e toque nele para ver o pedido. Fique de olho no relógio de paciência — rapidez ajuda!",
  tutorialTitle_5: "Prepare o pedido 🥣",
  tutorialBody_5: "Olhe o ticket preto embaixo. Vá até a estação certa (bebidas no balcão de bebidas, doces no balcão de doces, etc.) e aperte E pra começar.",
  tutorialTitle_6: "Combine e cozinhe ✨",
  tutorialBody_6: "Toque em cada ingrediente pra colocar na tigela, depois aperte o botão grande. Espere o cronômetro e toque Empratar.",
  tutorialTitle_7: "Sirva 🎀",
  tutorialBody_7: "Volte pro cliente no balcão e toque em Servir. Pedidos rápidos e corretos rendem estrelas, moedas e gorjetas!",
  tutorialTitle_8: "Tudo pronto! 🎉",
  tutorialBody_8: "Suba de nível pra desbloquear receitas novas, inventar as suas e até abrir um Cat Cafe embaixo. Divirta-se!",
  replayTutorial: "Repetir tutorial",
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
