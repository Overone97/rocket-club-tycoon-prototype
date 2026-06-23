const SAVE_KEY = "rocket-club-tycoon-save-v2";

const actionLibrary = [
  {
    id: "day-job",
    title: "Prendre un shift de plus",
    tag: "Survie",
    description: "Tu bosses tard pour payer les cables, le loyer et deux claviers qui tiennent encore debout.",
    effects: { cash: 180, fatigue: 9, hype: -1 },
    scene: "Tu rentres du boulot avec les jambes lourdes et un sachet de kebab tiede pour l'equipe.",
  },
  {
    id: "garage-scrim",
    title: "Scrims dans le garage",
    tag: "Equipe",
    description: "La porte vibre a chaque celebration. Le voisin vous deteste deja un peu.",
    effects: { cohesion: 8, skill: 6, fatigue: 7 },
    scene: "Les trois joueurs hurlent sur un overtime de scrim. C'est brouillon, mais ca ressemble a une equipe.",
  },
  {
    id: "vod-night",
    title: "Soiree review VOD",
    tag: "Vision",
    description: "Moins spectaculaire, plus malin. Tu notes tout dans un cahier qui prend la graisse de pizza.",
    effects: { cohesion: 5, skill: 4, fatigue: 3, ambition: 5 },
    scene: "Vous coupez les erreurs frame par frame. Ca chambre moins, ca comprend mieux.",
  },
  {
    id: "clip-post",
    title: "Poster un clip",
    tag: "Visibilite",
    description: "Un beau move, une bonne miniature, et peut-etre quelques curieux qui regardent enfin le projet.",
    effects: { hype: 9, cash: 40, fatigue: 2 },
    scene: "Le clip tourne un peu. Pas viral, mais assez pour entendre le mot 'potentiel' dans la bouche de quelqu'un.",
  },
  {
    id: "local-cup",
    title: "Tenter une cup locale",
    tag: "Competition",
    description: "Petit cash prize, gros stress, et des inconnus qui veulent vous remettre a votre place.",
    minWeek: 3,
    effects: { fatigue: 6, ambition: 8 },
    special: "cup",
    scene: "Vous posez trois tours sur une table pliante. Les mains tremblent un peu, l'ego beaucoup plus.",
  },
  {
    id: "buy-gear",
    title: "Acheter du matos correct",
    tag: "Upgrade",
    description: "Fini les ecrans qui clignotent. Enfin, moins qu'avant.",
    minCash: 320,
    effects: { cash: -320, cohesion: 4, skill: 3, ambition: 10 },
    scene: "Le garage a toujours l'air miteux, mais maintenant les setups ne semblent plus voles au musee du lag.",
  },
  {
    id: "look-for-sponsor",
    title: "Chercher un mini sponsor",
    tag: "Business",
    minHype: 30,
    description: "Tu spammes des DM, tu fais semblant d'etre deja serieux, et parfois ca mord.",
    effects: { fatigue: 4, ambition: 6 },
    special: "sponsor",
    scene: "Tu vends une vision. Pour l'instant, elle tient surtout avec ton culot.",
  },
  {
    id: "mental-night",
    title: "Couper tout une soiree",
    tag: "Mental",
    description: "Pas de grind. On souffle, on mange ensemble, on se rappelle pourquoi on fait ca.",
    effects: { fatigue: -10, cohesion: 6, hype: -2 },
    scene: "Une pause sans rankeds. Etonnamment, personne n'explose.",
  },
];

const venues = [
  {
    id: "garage",
    chapter: "Chapitre 1",
    title: "Le vieux garage",
    scene:
      "Trois PC fatigues, un plafond bas, et une odeur de pizza froide. C'est moche, mais c'est a vous.",
    manager: "Tu sors du taf et tu comptes tes billets.",
  },
  {
    id: "basement",
    chapter: "Chapitre 2",
    title: "Le sous-sol propre",
    scene:
      "Vous avez remplace deux ampoules, pose un vrai neon et cache les fils. Ce n'est plus glorieux, mais c'est presentable.",
    manager: "Tu commences a parler du projet comme d'une vraie structure.",
  },
  {
    id: "studio",
    chapter: "Chapitre 3",
    title: "Le mini local",
    scene:
      "Il y a enfin un mur digne d'une photo d'equipe. Les scrims sentent moins la debrouille, plus l'ambition.",
    manager: "Tu negocies des heures, des factures, et des reves un peu trop gros pour ton sommeil.",
  },
];

const starters = [
  { name: "Niko", role: "Meca pure", mood: "veut tout forcer" },
  { name: "Lem", role: "Second man", mood: "parle peu, clutch beaucoup" },
  { name: "Ysa", role: "Dernier rempart", mood: "tilte rarement, oublie jamais" },
];

const state = createInitialState();

const els = {
  playWeek: document.querySelector("#play-week"),
  resetSave: document.querySelector("#reset-save"),
  saveStatus: document.querySelector("#save-status"),
  chapterLabel: document.querySelector("#chapter-label"),
  locationTitle: document.querySelector("#location-title"),
  weekPill: document.querySelector("#week-pill"),
  cash: document.querySelector("#cash-label"),
  hype: document.querySelector("#hype-label"),
  cohesion: document.querySelector("#cohesion-label"),
  fatigue: document.querySelector("#fatigue-label"),
  ambitionMeter: document.querySelector("#ambition-meter"),
  stressMeter: document.querySelector("#stress-meter"),
  choicesList: document.querySelector("#choices-list"),
  journalList: document.querySelector("#journal-list"),
  journalTemplate: document.querySelector("#journal-item-template"),
  sceneRoom: document.querySelector("#scene-room"),
  sceneText: document.querySelector("#scene-text"),
  managerCaption: document.querySelector("#manager-caption"),
  teamStrip: document.querySelector("#team-strip"),
};

boot();

function boot() {
  const restored = loadGame();
  if (!restored) {
    queueWeekChoices();
    pushJournal(
      "Debut",
      "Le projet commence dans un garage. Tu bosses la journee, eux grindent le soir, et tout le monde fait semblant d'y croire tres fort."
    );
    saveGame("Nouvelle run initialisee");
  }

  render();

  els.playWeek.addEventListener("click", playWeek);
  els.resetSave.addEventListener("click", resetGame);
  window.addEventListener("beforeunload", () => saveGame("Sauvegarde locale mise a jour"));
}

function createInitialState() {
  return {
    week: 1,
    cash: 240,
    hype: 6,
    cohesion: 18,
    fatigue: 14,
    ambition: 22,
    skill: 14,
    venueIndex: 0,
    selectedChoiceId: null,
    choices: [],
    team: starters.map((player) => ({ ...player })),
    journal: [],
  };
}

function render() {
  const venue = venues[state.venueIndex];
  els.chapterLabel.textContent = venue.chapter;
  els.locationTitle.textContent = venue.title;
  els.weekPill.textContent = `Semaine ${state.week}`;
  els.cash.textContent = `${formatNumber(state.cash)} €`;
  els.hype.textContent = `${state.hype}`;
  els.cohesion.textContent = `${state.cohesion}`;
  els.fatigue.textContent = `${state.fatigue}`;
  setMeter(els.ambitionMeter, state.ambition);
  setMeter(els.stressMeter, state.fatigue);
  els.sceneRoom.dataset.stage = venue.id;
  els.sceneText.textContent = venue.scene;
  els.managerCaption.textContent = venue.manager;
  renderChoices();
  renderTeam();
  renderJournal();
}

function renderChoices() {
  els.choicesList.innerHTML = "";
  state.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = `choice-card ${state.selectedChoiceId === choice.id ? "selected" : ""}`;
    button.innerHTML = `
      <span class="choice-tag">${choice.tag}</span>
      <strong>${choice.title}</strong>
      <p>${choice.description}</p>
    `;
    button.addEventListener("click", () => {
      state.selectedChoiceId = choice.id;
      renderChoices();
      saveGame(`Choix de semaine memorise: ${choice.title}`);
    });
    els.choicesList.appendChild(button);
  });
}

function renderTeam() {
  els.teamStrip.innerHTML = "";
  state.team.forEach((player) => {
    const card = document.createElement("article");
    card.className = "team-card";
    card.innerHTML = `
      <strong>${player.name}</strong>
      <span>${player.role}</span>
      <p>${player.mood}</p>
    `;
    els.teamStrip.appendChild(card);
  });
}

function renderJournal() {
  els.journalList.innerHTML = "";
  state.journal.slice(0, 6).forEach((entry) => {
    const node = els.journalTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".journal-kicker").textContent = entry.kicker;
    node.querySelector("p").textContent = entry.text;
    els.journalList.appendChild(node);
  });
}

function playWeek() {
  const choice = state.choices.find((item) => item.id === state.selectedChoiceId) || state.choices[0];
  if (!choice) {
    return;
  }

  applyEffects(choice.effects);
  pushJournal("Semaine", choice.scene);

  if (choice.special === "cup") {
    resolveCup();
  }
  if (choice.special === "sponsor") {
    resolveSponsor();
  }

  maybeTriggerStoryBeat(choice);
  updateVenue();
  updateTeamMoods(choice);

  state.week += 1;
  queueWeekChoices();
  saveGame(`Semaine ${state.week - 1} enregistree`);
  render();
}

function applyEffects(effects) {
  state.cash = Math.max(0, state.cash + (effects.cash || 0));
  state.hype = clamp(state.hype + (effects.hype || 0), 0, 100);
  state.cohesion = clamp(state.cohesion + (effects.cohesion || 0), 0, 100);
  state.fatigue = clamp(state.fatigue + (effects.fatigue || 0), 0, 100);
  state.ambition = clamp(state.ambition + (effects.ambition || 0), 0, 100);
  state.skill = clamp(state.skill + (effects.skill || 0), 0, 100);
}

function resolveCup() {
  const power = state.skill * 0.5 + state.cohesion * 0.35 + state.hype * 0.15 - state.fatigue * 0.2;
  const win = Math.random() * 100 < clamp(power, 18, 78);
  if (win) {
    state.cash += 320;
    state.hype = clamp(state.hype + 12, 0, 100);
    state.ambition = clamp(state.ambition + 8, 0, 100);
    pushJournal("Cup", "Petite cup, vrai choc. Vous rentrez avec un peu de cash et surtout cette sensation dangereuse: 'on peut vraiment le faire'.");
  } else {
    state.fatigue = clamp(state.fatigue + 4, 0, 100);
    state.hype = clamp(state.hype + 3, 0, 100);
    pushJournal("Cup", "Vous sautez vite, mais pas honteusement. Le garage parait plus petit au retour, les ambitions un peu plus grandes.");
  }
}

function resolveSponsor() {
  const successChance = clamp(state.hype + state.ambition * 0.5, 20, 80);
  const success = Math.random() * 100 < successChance;
  if (success) {
    state.cash += 540;
    state.hype = clamp(state.hype + 7, 0, 100);
    pushJournal("Sponsor", "Une petite structure locale lache quelques billets et un post Instagram. Ce n'est pas glam, mais ca paie une vraie semaine.");
  } else {
    pushJournal("Sponsor", "Beaucoup de messages, peu de reponses. Classique. Au moins tu commences a apprendre le langage du bullshit esport.");
  }
}

function maybeTriggerStoryBeat(choice) {
  if (state.fatigue >= 70) {
    state.fatigue = clamp(state.fatigue - 8, 0, 100);
    state.cohesion = clamp(state.cohesion - 4, 0, 100);
    pushJournal("Tension", "Les regards deviennent plus longs, les phrases plus courtes. Il fallait souffler un peu avant d'en arriver la.");
    return;
  }

  if (state.hype >= 45 && state.week > 4 && Math.random() < 0.45) {
    state.cash += 160;
    pushJournal("Buzz", "Un clip tourne mieux que prevu. Pas assez pour changer votre vie, assez pour changer l'ambiance de la piece.");
    return;
  }

  if (choice.id === "garage-scrim" && Math.random() < 0.4) {
    state.skill = clamp(state.skill + 3, 0, 100);
    pushJournal("Declic", "D'un coup, une rotation devient naturelle. Le genre de petit truc qui se sent avant de se comprendre.");
  }
}

function updateVenue() {
  if (state.venueIndex === 0 && state.cash >= 600 && state.hype >= 18) {
    state.venueIndex = 1;
    pushJournal("Upgrade", "Vous nettoyez le bordel, remplacez deux tables et transformez le garage en vrai repaire de grind.");
  } else if (state.venueIndex === 1 && state.cash >= 1200 && state.hype >= 42 && state.skill >= 34) {
    state.venueIndex = 2;
    pushJournal("Upgrade", "Vous prenez un mini local. Ce n'est pas le grand luxe, mais pour la premiere fois, le reve a une adresse.");
  }
}

function updateTeamMoods(choice) {
  const moods = [
    "commence a y croire",
    "tilte sur des details idiots",
    "sent le niveau monter",
    "dort trop peu, parle trop fort",
    "voit enfin une vraie direction",
    "gratte encore des heures de ranked",
  ];

  state.team = state.team.map((player, index) => ({
    ...player,
    mood:
      choice.id === "mental-night"
        ? "respire enfin un peu"
        : choice.id === "day-job" && index === 0
          ? "trouve le grind trop lent"
          : sample(moods),
  }));
}

function queueWeekChoices() {
  const available = actionLibrary.filter((action) => {
    if (action.minWeek && state.week < action.minWeek) {
      return false;
    }
    if (action.minCash && state.cash < action.minCash) {
      return false;
    }
    if (action.minHype && state.hype < action.minHype) {
      return false;
    }
    return true;
  });

  const weighted = [...available].sort((a, b) => scoreAction(b) - scoreAction(a));
  const selected = [];

  while (weighted.length && selected.length < 3) {
    const next = weighted.shift();
    if (!selected.some((item) => item.id === next.id)) {
      selected.push(next);
    }
  }

  state.choices = selected;
  state.selectedChoiceId = selected[0]?.id || null;
}

function scoreAction(action) {
  let score = Math.random() * 4;

  if (state.cash < 240 && action.id === "day-job") {
    score += 20;
  }
  if (state.fatigue > 55 && action.id === "mental-night") {
    score += 18;
  }
  if (state.cohesion < 40 && action.id === "garage-scrim") {
    score += 14;
  }
  if (state.hype < 28 && action.id === "clip-post") {
    score += 12;
  }
  if (state.week >= 3 && action.id === "local-cup") {
    score += 11;
  }
  if (state.cash >= 320 && action.id === "buy-gear" && state.venueIndex === 0) {
    score += 10;
  }

  return score;
}

function pushJournal(kicker, text) {
  state.journal.unshift({ kicker, text });
  state.journal = state.journal.slice(0, 12);
}

function setMeter(el, value) {
  el.style.width = `${clamp(value, 0, 100)}%`;
}

function updateSaveStatus(message, timestamp = Date.now()) {
  const time = new Intl.DateTimeFormat("fr-BE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
  els.saveStatus.textContent = `${message} a ${time}`;
}

function serializeState() {
  return {
    week: state.week,
    cash: state.cash,
    hype: state.hype,
    cohesion: state.cohesion,
    fatigue: state.fatigue,
    ambition: state.ambition,
    skill: state.skill,
    venueIndex: state.venueIndex,
    selectedChoiceId: state.selectedChoiceId,
    choices: state.choices,
    team: state.team,
    journal: state.journal,
  };
}

function saveGame(message = "Sauvegarde locale mise a jour") {
  try {
    const payload = {
      savedAt: Date.now(),
      data: serializeState(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    updateSaveStatus(message, payload.savedAt);
  } catch {
    els.saveStatus.textContent = "Sauvegarde locale indisponible sur ce navigateur";
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.data) {
      return false;
    }

    Object.assign(state, createInitialState(), parsed.data);
    if (!Array.isArray(state.choices) || !state.choices.length) {
      queueWeekChoices();
    }
    updateSaveStatus("Sauvegarde rechargee", parsed.savedAt || Date.now());
    return true;
  } catch {
    els.saveStatus.textContent = "Sauvegarde corrompue, nouvelle run chargee";
    return false;
  }
}

function resetGame() {
  const confirmed = window.confirm("Effacer la sauvegarde locale et recommencer depuis le garage ?");
  if (!confirmed) {
    return;
  }

  localStorage.removeItem(SAVE_KEY);
  Object.assign(state, createInitialState());
  queueWeekChoices();
  pushJournal("Reset", "Retour au garage. Trois PC bancals, zero prestige, et toute l'envie du monde.");
  saveGame("Nouvelle partie reinitialisee");
  render();
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}
