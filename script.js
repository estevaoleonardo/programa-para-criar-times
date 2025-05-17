// Seleciona elementos do DOM
const playerForm = document.getElementById("playerForm");
const playerList = document.getElementById("playerList");
const createTeamsButton = document.getElementById("createTeams");
const reshuffleTeamsButton = document.getElementById("reshuffleTeams");
const resetTeamsButton = document.getElementById("resetTeams");
const clearPlayersButton = document.getElementById("clearPlayers");
const randomizeTeamsCheckbox = document.getElementById("randomizeTeams");
const fullRandomCheckbox = document.getElementById("fullRandom");
const balanceBySkillCheckbox = document.getElementById("balanceBySkill");
const teamsDisplay = document.querySelector(".teams-display");
const errorMessageDiv = document.getElementById("errorMessage");

// Formação padrão do time
const formation = {
  "Goleiro": 1,
  "Zagueiro": 2,
  "Lateral Direito": 1,
  "Lateral Esquerdo": 1,
  "Volante": 1,
  "Atacante": 1,
};

let players = [];

// Recupera jogadores do localStorage
const savedPlayers = localStorage.getItem("jogadores");
if (savedPlayers) {
  players = JSON.parse(savedPlayers);
  players.forEach(renderPlayer);
}

// Salva jogadores no localStorage
function salvarJogadores() {
  localStorage.setItem("jogadores", JSON.stringify(players));
}

// Renderiza um jogador na lista
function renderPlayer(player) {
  const listItem = document.createElement("li");
  listItem.setAttribute("data-id", player.id);
  listItem.setAttribute("tabindex", "0");

  const text = document.createElement("span");
  text.textContent = `${player.name} - ${player.position} - ${"⭐".repeat(player.skill)}`;
  listItem.appendChild(text);

  const editBtn = document.createElement("button");
  editBtn.textContent = "Editar";
  editBtn.classList.add("edit-btn");
  editBtn.setAttribute("aria-label", `Editar ${player.name}`);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Excluir";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.setAttribute("aria-label", `Excluir ${player.name}`);

  editBtn.addEventListener("click", () => {
    const selectPos = document.createElement("select");
    Object.keys(formation).forEach(pos => {
      const option = document.createElement("option");
      option.value = pos;
      option.textContent = pos;
      if (pos === player.position) option.selected = true;
      selectPos.appendChild(option);
    });

    const selectSkill = document.createElement("select");
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = "⭐".repeat(i);
      if (i === player.skill) option.selected = true;
      selectSkill.appendChild(option);
    }

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = player.name;
    nameInput.required = true;
    nameInput.style.marginRight = "8px";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Salvar";
    saveBtn.classList.add("save-btn");

    saveBtn.addEventListener("click", () => {
      const newName = nameInput.value.trim();
      const newPos = selectPos.value;
      const newSkill = parseInt(selectSkill.value, 10);

      if (!newName) {
        alert("Nome do jogador não pode ser vazio.");
        return;
      }
      if (players.some(p => p.name.toLowerCase() === newName.toLowerCase() && p.id !== player.id)) {
        alert("Já existe um jogador com esse nome.");
        return;
      }

      player.name = newName;
      player.position = newPos;
      player.skill = newSkill;

      text.textContent = `${player.name} - ${player.position} - ${"⭐".repeat(player.skill)}`;

      listItem.innerHTML = "";
      listItem.appendChild(text);
      listItem.appendChild(editBtn);
      listItem.appendChild(deleteBtn);

      salvarJogadores();
    });

    listItem.innerHTML = "";
    listItem.appendChild(nameInput);
    listItem.appendChild(selectPos);
    listItem.appendChild(selectSkill);
    listItem.appendChild(saveBtn);
  });

  deleteBtn.addEventListener("click", () => {
    showConfirmation(`Deseja realmente excluir o jogador ${player.name}?`, () => {
      players = players.filter(p => p.id !== player.id);
      playerList.removeChild(listItem);
      salvarJogadores();
      updateTeamsDisplayAfterChange();
    });
  });

  listItem.appendChild(editBtn);
  listItem.appendChild(deleteBtn);
  playerList.appendChild(listItem);
}

function showConfirmation(message, onConfirm) {
  if (confirm(message)) {
    onConfirm();
  }
}

playerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nameInput = document.getElementById("playerName");
  const positionSelect = document.getElementById("playerPosition");
  const skillSelect = document.getElementById("playerSkill");

  const name = nameInput.value.trim();
  const position = positionSelect.value;
  const skill = parseInt(skillSelect.value, 10);

  errorMessageDiv.textContent = "";

  if (!name || !position || !skill) {
    errorMessageDiv.textContent = "Por favor, preencha todos os campos corretamente.";
    return;
  }

  if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    errorMessageDiv.textContent = "⚠️ Já existe um jogador com esse nome!";
    return;
  }

  const player = { id: Date.now(), name, position, skill, used: false };
  players.push(player);
  renderPlayer(player);
  salvarJogadores();
  playerForm.reset();
});

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function balanceTeamsBySkill(players, numTeams) {
  const teams = Array.from({ length: numTeams }, () => []);
  const sorted = [...players].sort((a, b) => b.skill - a.skill);
  let direction = 1;
  let i = 0;
  for (const player of sorted) {
    teams[i].push(player);
    i += direction;
    if (i === numTeams || i < 0) {
      direction *= -1;
      i += direction;
    }
  }
  return teams;
}

function createTeams() {
  teamsDisplay.innerHTML = "";

  if ([randomizeTeamsCheckbox.checked, fullRandomCheckbox.checked, balanceBySkillCheckbox.checked].filter(Boolean).length > 1) {
    alert("Por favor, selecione apenas uma opção de aleatoriedade.");
    return;
  }

  const availablePlayers = players.filter(p => !p.used);
  if (availablePlayers.length === 0) {
    teamsDisplay.innerHTML = "<p>Não há jogadores disponíveis para formar times.</p>";
    return;
  }

  let teams = [];
  let numTeamsFormed = null;

  if (fullRandomCheckbox.checked) {
    const shuffled = shuffleArray(availablePlayers);
    const totalPlayersPerTeam = Object.values(formation).reduce((a, b) => a + b, 0);
    const numTeams = Math.floor(shuffled.length / totalPlayersPerTeam);
    if (numTeams === 0) {
      teamsDisplay.innerHTML = "<p>Jogadores insuficientes para formar times completos.</p>";
      return;
    }
    teams = Array.from({ length: numTeams }, () => []);
    for (let i = 0; i < numTeams * totalPlayersPerTeam; i++) {
      teams[i % numTeams].push(shuffled[i]);
    }
    numTeamsFormed = numTeams;
  } else {
    const playersByPosition = {};
    Object.keys(formation).forEach(pos => playersByPosition[pos] = []);
    availablePlayers.forEach(player => {
      if (playersByPosition[player.position]) {
        playersByPosition[player.position].push(player);
      }
    });

    const possibleTeams = Object.entries(formation).map(
      ([pos, qty]) => Math.floor(playersByPosition[pos].length / qty)
    );

    const numTeams = Math.min(...possibleTeams);
    if (numTeams === 0) {
      teamsDisplay.innerHTML = "<p>Jogadores insuficientes para formar times completos.</p>";
      return;
    }

    if (balanceBySkillCheckbox.checked) {
      const combined = [];
      Object.entries(formation).forEach(([pos, qty]) => {
        combined.push(...playersByPosition[pos].slice(0, qty * numTeams));
      });
      teams = balanceTeamsBySkill(combined, numTeams);
    } else {
      teams = Array.from({ length: numTeams }, () => []);
      Object.entries(formation).forEach(([pos, qty]) => {
        let list = playersByPosition[pos];
        if (randomizeTeamsCheckbox.checked) list = shuffleArray(list);
        for (let i = 0; i < numTeams * qty; i++) {
          teams[i % numTeams].push(list[i]);
        }
      });
    }

    numTeamsFormed = numTeams;
  }

  players.forEach(p => p.used = false);
  teams.forEach(team => team.forEach(p => {
    const player = players.find(pl => pl.id === p.id);
    if (player) player.used = true;
  }));

  const rodadaDiv = document.createElement("div");
  rodadaDiv.classList.add("rodada");
  const rodadaNum = document.querySelectorAll(".rodada").length + 1;
  rodadaDiv.innerHTML = `<h3>Rodada ${rodadaNum}</h3>`;

  teams.forEach((team, i) => {
    const teamDiv = document.createElement("div");
    teamDiv.classList.add("team");
    team.sort((a,b) => {
      const posOrder = Object.keys(formation);
      return posOrder.indexOf(a.position) - posOrder.indexOf(b.position);
    });
    teamDiv.innerHTML = `<h4>Time ${i + 1}</h4><ul>${
      team.map(p => `<li>${p.name} - ${p.position} - ${"⭐".repeat(p.skill)}</li>`).join("")
    }</ul>`;
    rodadaDiv.appendChild(teamDiv);
  });

  teamsDisplay.appendChild(rodadaDiv);

  const remaining = players.filter(p => !p.used);
  if (remaining.length > 0) {
    const div = document.createElement("div");
    div.classList.add("shortage-message");
    div.innerHTML = `<strong>Jogadores que sobraram:</strong><ul>${remaining.map(p => `<li>${p.name} - ${p.position} - ${"⭐".repeat(p.skill)}</li>`).join("")}</ul>`;
    teamsDisplay.appendChild(div);
  }

  salvarJogadores();
}

function updateTeamsDisplayAfterChange() {
  players.forEach(p => p.used = false);
  teamsDisplay.innerHTML = "<p>Times resetados devido a alterações na lista de jogadores.</p>";
  salvarJogadores();
}

createTeamsButton.addEventListener("click", createTeams);
reshuffleTeamsButton.addEventListener("click", createTeams);

resetTeamsButton.addEventListener("click", () => {
  showConfirmation("Deseja liberar todos os jogadores para nova formação?", () => {
    players.forEach(p => p.used = false);
    teamsDisplay.innerHTML = "<p>Todos os jogadores foram liberados para nova formação de times.</p>";
    salvarJogadores();
    randomizeTeamsCheckbox.checked = false;
    fullRandomCheckbox.checked = false;
    balanceBySkillCheckbox.checked = false;
  });
});

clearPlayersButton.addEventListener("click", () => {
  showConfirmation("Deseja realmente excluir todos os jogadores?", () => {
    players = [];
    playerList.innerHTML = "";
    teamsDisplay.innerHTML = "<p>Todos os jogadores foram excluídos.</p>";
    salvarJogadores();
  });
});
