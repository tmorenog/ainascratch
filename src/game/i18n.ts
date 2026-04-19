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
  | "dareExtra";

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
