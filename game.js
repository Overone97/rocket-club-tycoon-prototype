const activities = [
  {
    id: "scrims",
    name: "Bloc de scrims intensifs",
    type: "Performance",
    description: "Monte le niveau brut, mais les joueurs finissent la semaine sur les rotules.",
    effects: { skill: 2, synergy: 4, morale: -2, fatigue: 10 },
  },
  {
    id: "vod",
    name: "Review VOD + coaching",
    type: "Macro",
    description: "Travail propre sur la prise de decision. Ca gagne moins vite, mais plus intelligemment.",
    effects: { skill: 1, synergy: 3, morale: 1, fatigue: 4 },
  },
  {
    id: "rest",
    name: "Repos + mental reset",
    type: "Gestion",
    description: "On coupe un peu. Les mecs respirent, le roster evite l'implosion.",
    effects: { skill: 0, synergy: 1, morale: 8, fatigue: -12 },
  },
  {
    id: "content",
    name: "Semaine contenu + sponsor",
    type: "Business",
    description: "Moins optimal en jeu, mais la caisse se remplit et les fans se pointent.",
    effects: { skill: 0, synergy: 0, morale: 2, fatigue: 2, cash: 1800, fans: 120 },
  },
];

const playerPool = [
  ["Kaydop", 88, 84, 95, 90, 52000],
  ["Zen", 97, 96, 94, 94, 99000],
  ["Atow", 95, 94, 90, 93, 91000],
  ["Vatira", 96, 93, 91, 92, 94000],
  ["M0nkey M00n", 94, 95, 96, 93, 90000],
  ["Seikoo", 92, 91, 89, 88, 76000],
  ["Rise", 90, 89, 94, 91, 74000],
  ["Daniel", 93, 92, 88, 90, 81000],
  ["Firstkiller", 94, 95, 87, 86, 84000],
  ["BeastMode", 95, 93, 89, 91, 87000],
  ["Lj", 90, 91, 85, 87, 63000],
  ["Radosin", 88, 87, 91, 88, 57000],
  ["AcroniK", 89, 88, 86, 85, 56000],
  ["Oski", 92, 90, 86, 89, 72000],
  ["Juicy", 90, 89, 87, 90, 60000],
];

const prospectNames = ["Nox", "Mira", "Kelys", "Drift", "Arven", "Skarn", "Luma", "Pico", "Rift", "Soren"];

const state = {
  week: 1,
  seasonLength: 12,
  cash: 18000,
  reputation: 12,
  fans: 85,
  morale: 66,
  synergy: 52,
  fatigue: 20,
  selectedActivity: "vod",
  audioEnabled: false,
  audioContext: null,
  audioMaster: null,
  roster: [
    makePlayer("Niko", 61, 56, 63, 60, 0),
    makePlayer("Lem", 58, 64, 57, 61, 0),
    makePlayer("Ysa", 63, 59, 55, 58, 0),
  ],
  standings: [],
  market: [],
  matchInProgress: false,
  phase: "Open Qualifier",
};

const els = {
  week: document.querySelector("#week-label"),
  cash: document.querySelector("#cash-label"),
  rep: document.querySelector("#rep-label"),
  fans: document.querySelector("#fans-label"),
  morale: document.querySelector("#morale-meter"),
  synergy: document.querySelector("#synergy-meter"),
  fatigue: document.querySelector("#fatigue-meter"),
  activityList: document.querySelector("#activity-list"),
  rosterList: document.querySelector("#roster-list"),
  marketList: document.querySelector("#market-list"),
  commentaryFeed: document.querySelector("#commentary-feed"),
  commentaryTemplate: document.querySelector("#commentary-item-template"),
  homeScore: document.querySelector("#home-score"),
  awayScore: document.querySelector("#away-score"),
  awayName: document.querySelector("#away-name"),
  standingsList: document.querySelector("#standings-list"),
  advanceWeek: document.querySelector("#advance-week"),
  toggleAudio: document.querySelector("#toggle-audio"),
  matchStatus: document.querySelector("#match-status"),
  phaseBadge: document.querySelector("#phase-badge"),
};

boot();

function boot() {
  buildStandings();
  buildMarket();
  render();
  logCommentary("00:00", "Le staff pose les plans. On part de rien, mais la salle sent deja la montée de crack.");
  els.advanceWeek.addEventListener("click", playWeek);
  els.toggleAudio.addEventListener("click", toggleAudio);
}

function makePlayer(name, mechanics, speed, gameSense, clutch, salary) {
  return {
    name,
    mechanics,
    speed,
    gameSense,
    clutch,
    salary,
  };
}

function buildStandings() {
  const teamNames = [
    "Team Vitality",
    "Karmine Corp",
    "Gentle Mates",
    "BDS",
    "Gen.G",
    "G2 Stride",
    "Falcons",
    "Oxygen",
    "Moist",
    "Solary",
    "Dignitas",
  ];

  state.standings = [
    { name: "Votre club", points: 8, trend: "Petit nom, gros reve" },
    ...teamNames.map((name, index) => ({
      name,
      points: 26 - index * 2,
      trend: index < 4 ? "Cadors du circuit" : "Dans la meute",
    })),
  ].sort((a, b) => b.points - a.points);
}

function buildMarket() {
  const elite = playerPool.slice(0, 5).map(([name, mechanics, speed, gameSense, clutch, salary]) =>
    makePlayer(name, mechanics, speed, gameSense, clutch, salary)
  );

  const prospects = prospectNames.slice(0, 4).map((name, index) =>
    makePlayer(
      name,
      68 + index * 2,
      66 + ((index + 2) % 4),
      62 + index,
      64 + ((index + 1) % 3),
      12000 + index * 2500
    )
  );

  state.market = [...elite, ...prospects];
}

function render() {
  els.week.textContent = `${state.week} / ${state.seasonLength}`;
  els.cash.textContent = `${formatNumber(state.cash)} €`;
  els.rep.textContent = `${state.reputation}`;
  els.fans.textContent = `${formatNumber(state.fans)}`;
  els.phaseBadge.textContent = state.phase;
  setMeter(els.morale, state.morale);
  setMeter(els.synergy, state.synergy);
  setMeter(els.fatigue, state.fatigue);
  renderActivities();
  renderRoster();
  renderMarket();
  renderStandings();
}

function setMeter(el, value) {
  el.style.width = `${clamp(value, 0, 100)}%`;
}

function renderActivities() {
  els.activityList.innerHTML = "";
  activities.forEach((activity) => {
    const card = document.createElement("button");
    card.className = `activity-card ${state.selectedActivity === activity.id ? "selected" : ""}`;
    card.innerHTML = `
      <div class="activity-head">
        <div>
          <strong>${activity.name}</strong>
          <p>${activity.description}</p>
        </div>
        <span class="activity-type">${activity.type}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      state.selectedActivity = activity.id;
      renderActivities();
    });
    els.activityList.appendChild(card);
  });
}

function renderRoster() {
  els.rosterList.innerHTML = "";
  state.roster.forEach((player, index) => {
    const overall = Math.round((player.mechanics + player.speed + player.gameSense + player.clutch) / 4);
    const card = document.createElement("article");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-head">
        <div>
          <strong>${player.name}</strong>
          <p>${index === 0 ? "Striker" : index === 1 ? "Second man" : "Third man"}</p>
        </div>
        <span class="badge">${overall} OVR</span>
      </div>
      <div class="player-grid">
        <div class="stat-chip"><span>Meca</span><strong>${player.mechanics}</strong></div>
        <div class="stat-chip"><span>Vitesse</span><strong>${player.speed}</strong></div>
        <div class="stat-chip"><span>Lecture</span><strong>${player.gameSense}</strong></div>
        <div class="stat-chip"><span>Clutch</span><strong>${player.clutch}</strong></div>
      </div>
    `;
    els.rosterList.appendChild(card);
  });
}

function renderMarket() {
  els.marketList.innerHTML = "";
  state.market.forEach((player, index) => {
    const overall = Math.round((player.mechanics + player.speed + player.gameSense + player.clutch) / 4);
    const price = player.salary * 2.4;
    const card = document.createElement("article");
    card.className = "market-card";
    card.innerHTML = `
      <div class="market-head">
        <div>
          <strong>${player.name}</strong>
          <p>${index < 5 ? "Top joueur du circuit" : "Prospect a polir"}</p>
        </div>
        <span class="badge">${overall} OVR</span>
      </div>
      <div class="market-grid">
        <div class="stat-chip"><span>Meca</span><strong>${player.mechanics}</strong></div>
        <div class="stat-chip"><span>Vitesse</span><strong>${player.speed}</strong></div>
        <div class="stat-chip"><span>Lecture</span><strong>${player.gameSense}</strong></div>
        <div class="stat-chip"><span>Cout</span><strong>${formatNumber(price)} €</strong></div>
      </div>
    `;
    const button = document.createElement("button");
    button.className = "secondary";
    button.textContent = `Signer pour ${formatNumber(price)} €`;
    button.disabled = state.cash < price;
    button.addEventListener("click", () => signPlayer(index, price));
    card.appendChild(button);
    els.marketList.appendChild(card);
  });
}

function renderStandings() {
  els.standingsList.innerHTML = "";
  state.standings
    .sort((a, b) => b.points - a.points)
    .forEach((team, index) => {
      const row = document.createElement("div");
      row.className = "standing-row";
      row.innerHTML = `
        <div>
          <small>#${index + 1}</small>
          <strong>${team.name}</strong>
        </div>
        <div>
          <strong>${team.points}</strong>
          <small>${team.trend}</small>
        </div>
      `;
      els.standingsList.appendChild(row);
    });
}

function signPlayer(index, price) {
  const player = state.market[index];
  state.cash -= Math.round(price);
  state.reputation += player.mechanics > 90 ? 8 : 4;
  state.fans += player.mechanics > 90 ? 900 : 180;
  state.roster.sort((a, b) => averagePlayer(a) - averagePlayer(b));
  state.roster[0] = player;
  state.synergy = clamp(state.synergy - 6, 0, 100);
  state.morale = clamp(state.morale + 2, 0, 100);
  state.market.splice(index, 1);
  render();
  logCommentary(
    "Mercato",
    `${player.name} rejoint le projet. Le chat explose, les vieux titulaires serrent un peu les dents. C'est le business.`
  );
}

function playWeek() {
  if (state.matchInProgress || state.week > state.seasonLength) {
    return;
  }

  applyActivity();
  const match = scheduleMatch();
  render();
  runMatch(match);
}

function applyActivity() {
  const chosen = activities.find((activity) => activity.id === state.selectedActivity);
  state.roster = state.roster.map((player) => ({
    ...player,
    mechanics: clamp(player.mechanics + chosen.effects.skill, 40, 99),
    speed: clamp(player.speed + chosen.effects.skill, 40, 99),
    gameSense: clamp(player.gameSense + Math.ceil(chosen.effects.synergy / 3), 40, 99),
    clutch: clamp(player.clutch + (chosen.id === "rest" ? 1 : 0), 40, 99),
  }));
  state.synergy = clamp(state.synergy + chosen.effects.synergy, 0, 100);
  state.morale = clamp(state.morale + chosen.effects.morale, 0, 100);
  state.fatigue = clamp(state.fatigue + chosen.effects.fatigue, 0, 100);
  state.cash += chosen.effects.cash || 0;
  state.fans += chosen.effects.fans || 0;
}

function scheduleMatch() {
  const opponents = [
    ["Solary", 70],
    ["Dignitas", 76],
    ["Oxygen", 81],
    ["Gentle Mates", 84],
    ["Karmine Corp", 93],
    ["Team Vitality", 95],
  ];
  const [name, power] = opponents[Math.min(state.week - 1, opponents.length - 1)];
  state.phase = state.week < 4 ? "Open Qualifier" : state.week < 8 ? "Regional" : state.week < 11 ? "Major Race" : "Worlds Push";
  return { name, power };
}

function runMatch(opponent) {
  state.matchInProgress = true;
  els.advanceWeek.disabled = true;
  els.matchStatus.textContent = "Match en cours";
  els.matchStatus.className = "badge";
  els.awayName.textContent = opponent.name;
  els.homeScore.textContent = "0";
  els.awayScore.textContent = "0";
  els.commentaryFeed.innerHTML = "";
  logCommentary("00:00", `Bienvenue sur le stream. Votre club affronte ${opponent.name}. Pas de nom, pas de peur.`);

  const homeStrength = teamStrength(state.roster) + state.synergy * 0.18 + state.morale * 0.12 - state.fatigue * 0.22;
  const awayStrength = opponent.power * 3.2;
  const events = [];
  let homeScore = 0;
  let awayScore = 0;
  const totalStrength = Math.max(homeStrength + awayStrength, 1);
  const homeChance = clamp((homeStrength / totalStrength) * 0.72, 0.18, 0.62);
  const awayChance = clamp((awayStrength / totalStrength) * 0.58, 0.16, 0.52);

  for (let minute = 1; minute <= 5; minute += 1) {
    events.push({ minute, type: "neutral", text: createNeutralLine(opponent.name) });
    const roll = Math.random();
    if (roll < homeChance) {
      homeScore += 1;
      events.push({ minute, type: "goal", team: "home", text: createGoalLine(opponent.name) });
    } else if (roll > 1 - awayChance) {
      awayScore += 1;
      events.push({ minute, type: "goal", team: "away", text: createConcededLine(opponent.name) });
    }
  }

  if (homeScore === awayScore) {
    const overtimeWinner = Math.random() < homeStrength / (homeStrength + awayStrength) ? "home" : "away";
    if (overtimeWinner === "home") {
      homeScore += 1;
    } else {
      awayScore += 1;
    }
    events.push({
      minute: "OT",
      type: "goal",
      team: overtimeWinner,
      text: overtimeWinner === "home"
        ? "Overtime. Ca presse, ca harcele, et votre troisieme homme finit le boulot au second poteau."
        : `${opponent.name} vous plante en overtime. Silence glacial, ca pique.`,
    });
  }

  animateEvents(events, { opponent, homeScore, awayScore });
}

function animateEvents(events, result) {
  let homeScore = 0;
  let awayScore = 0;
  let index = 0;

  const tick = () => {
    if (index >= events.length) {
      finishMatch(result);
      return;
    }

    const event = events[index];
    if (event.type === "goal") {
      if (event.team === "home") {
        homeScore += 1;
        pulseCrowd(220, 0.08);
      } else {
        awayScore += 1;
        pulseCrowd(110, 0.04);
      }
      els.homeScore.textContent = `${homeScore}`;
      els.awayScore.textContent = `${awayScore}`;
    }
    logCommentary(`${event.minute}'`, event.text);
    index += 1;
    setTimeout(tick, event.type === "goal" ? 900 : 520);
  };

  tick();
}

function finishMatch({ opponent, homeScore, awayScore }) {
  const win = homeScore > awayScore;
  state.cash += win ? 6200 : 1800;
  state.reputation = clamp(state.reputation + (win ? 9 : 2), 0, 999);
  state.fans += win ? 540 : 140;
  state.morale = clamp(state.morale + (win ? 7 : -5), 0, 100);
  state.fatigue = clamp(state.fatigue + 14, 0, 100);
  state.synergy = clamp(state.synergy + (win ? 4 : 1), 0, 100);
  awardStandings(win, opponent.name);
  render();
  logCommentary(
    "FT",
    win
      ? `Victoire ${homeScore}-${awayScore}. Le projet n'est plus mignon, il devient franchement chiant a jouer contre.`
      : `Defaite ${homeScore}-${awayScore}. On encaisse, on apprend, et on retourne en salle sans pleurnicher.`
  );
  if (win && state.phase === "Worlds Push" && state.week === state.seasonLength) {
    logCommentary("Scene", "Le plateau s'enflamme. Votre bande de potes a transforme le petit club en pretendant serieux.");
  }
  state.week += 1;
  state.matchInProgress = false;
  render();
  els.advanceWeek.disabled = state.week > state.seasonLength;
  els.matchStatus.textContent = state.week > state.seasonLength ? "Saison terminee" : "En attente";
  els.matchStatus.className = state.week > state.seasonLength ? "badge muted" : "badge danger";
}

function awardStandings(win, opponentName) {
  const yourTeam = state.standings.find((team) => team.name === "Votre club");
  yourTeam.points += win ? 6 : 2;
  yourTeam.trend = win ? `Vous venez de taper ${opponentName}` : "Encore vivant";
}

function teamStrength(roster) {
  return roster.reduce((sum, player) => sum + averagePlayer(player), 0);
}

function averagePlayer(player) {
  return (player.mechanics + player.speed + player.gameSense + player.clutch) / 4;
}

function createNeutralLine(opponentName) {
  const lines = [
    "Rotation propre, ca temporise. On sent que les scrims commencent a payer.",
    "Le coach hurle pour calmer le rythme. Personne n'a envie de donner un but idiot.",
    `Grosse pression de ${opponentName}, mais votre dernier defenseur lit tout avant les autres.`,
    "Ils tentent une combinaison a trois. Ce n'est pas parfait, mais l'intention sent le haut niveau.",
    "50-50 au milieu. C'est moche, c'est sale, c'est exactement le moment ou il faut survivre.",
  ];
  return sample(lines);
}

function createGoalLine(opponentName) {
  const scorer = sample(state.roster).name;
  const lines = [
    `${scorer} dechire le premier duel, centre fort, et ca finit au fond. Le public aime les trucs simples et brutaux.`,
    `Pinch pleine lucarne signe ${scorer}. C'est absurde, magnifique, et ${opponentName} ne comprend toujours pas ce qui vient d'arriver.`,
    `${scorer} coupe la ligne de boost, vole la balle, et transforme ca en but de rat. Le football de parking, version supersonique.`,
    `Quel enchainement. Double commit en face, ${scorer} remercie tout le monde et claque le but du 21e siecle.`,
  ];
  return sample(lines);
}

function createConcededLine(opponentName) {
  const lines = [
    `${opponentName} trouve une ouverture au second poteau. Ca defendait bien, jusqu'au moment ou plus du tout.`,
    "Mauvaise relance, punition immediate. L'ecran geant ne juge personne, mais un peu quand meme.",
    `${opponentName} gagne le duel aerien et ca termine sous la barre. Difficile de faire plus propre.`,
  ];
  return sample(lines);
}

function logCommentary(minute, text) {
  const node = els.commentaryTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".minute").textContent = minute;
  node.querySelector("p").textContent = text;
  els.commentaryFeed.appendChild(node);
  els.commentaryFeed.scrollTop = els.commentaryFeed.scrollHeight;
}

function toggleAudio() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
    state.audioMaster = state.audioContext.createGain();
    state.audioMaster.gain.value = 0.02;
    state.audioMaster.connect(state.audioContext.destination);
  }
  state.audioEnabled = !state.audioEnabled;
  els.toggleAudio.textContent = state.audioEnabled ? "Couper l'ambiance" : "Activer l'ambiance";
  if (state.audioEnabled) {
    pulseCrowd(180, 0.03);
  }
}

function pulseCrowd(frequency, volume) {
  if (!state.audioEnabled || !state.audioContext) {
    return;
  }
  const osc = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, state.audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + 0.55);
  osc.connect(gain);
  gain.connect(state.audioMaster);
  osc.start();
  osc.stop(state.audioContext.currentTime + 0.55);
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
