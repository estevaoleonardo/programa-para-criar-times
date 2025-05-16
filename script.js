const playerForm = document.getElementById("playerForm");
const playerList = document.getElementById("playerList");
const createTeamsButton = document.getElementById("createTeams");
const reshuffleTeamsButton = document.getElementById("reshuffleTeams");
const resetTeamsButton = document.getElementById("resetTeams");
const clearPlayersButton = document.getElementById("clearPlayers");
const randomizeTeamsCheckbox = document.getElementById("randomizeTeams");
const fullRandomCheckbox = document.getElementById("fullRandom");
const teamsDisplay = document.querySelector(".teams-display");

// Mensagem de erro
const errorMessageDiv = document.createElement("div");
errorMessageDiv.id = "errorMessage";
errorMessageDiv.style.color = "red";
errorMessageDiv.style.marginTop = "10px";
playerForm.appendChild(errorMessageDiv);

let players = [];

const formation = {
  "Goleiro": 1,
  "Zagueiro": 2,
  "Lateral Direito": 1,
  "Lateral Esquerdo": 1,
  "Volante": 1,
  "Atacante": 1,
};

const savedPlayers = localStorage.getItem("jogadores");
if (savedPlayers) {
  players = JSON.parse(savedPlayers);
  players.forEach(renderPlayer);
}

function salvarJogadores() {
  localStorage.setItem("jogadores", JSON.stringify(players));
}

function renderPlayer(player) {
  const listItem = document.createElement("li");
  listItem.setAttribute("data-id", player.id);

  const text = document.createElement("span");
  text.textContent = `${player.name} - ${player.position}`;
  listItem.appendChild(text);

  const editBtn = document.createElement("button");
  editBtn.textContent = "Editar";
  editBtn.classList.add("edit-btn");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Excluir";
  deleteBtn.classList.add("delete-btn");

  editBtn.addEventListener("click", () => {
    const select = document.createElement("select");
    Object.keys(formation).forEach(pos => {
      const option = document.createElement("option");
      option.value = pos;
      option.textContent = pos;
      if (pos === player.position) option.selected = true;
      select.appendChild(option);
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Salvar";
    saveBtn.classList.add("save-btn");

    saveBtn.addEventListener("click", () => {
      const newPos = select.value;
      player.position = newPos;
      text.textContent = `${player.name} - ${newPos}`;
      listItem.removeChild(select);
      listItem.removeChild(saveBtn);
      listItem.appendChild(editBtn);
      listItem.appendChild(deleteBtn);
      salvarJogadores();
    });

    listItem.innerHTML = '';
    listItem.appendChild(text);
    listItem.appendChild(select);
    listItem.appendChild(saveBtn);
  });

  deleteBtn.addEventListener("click", () => {
    players = players.filter(p => p.id !== player.id);
    playerList.removeChild(listItem);
    salvarJogadores();
  });

  listItem.appendChild(editBtn);
  listItem.appendChild(deleteBtn);
  playerList.appendChild(listItem);
}

playerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const nameInput = document.getElementById("playerName");
  const position = document.getElementById("playerPosition").value;
  const name = nameInput.value.trim();

  errorMessageDiv.textContent = "";

  if (!name || !position) return;

  if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    errorMessageDiv.textContent = "⚠️ Já existe um jogador com esse nome!";
    return;
  }

  const player = { id: Date.now(), name, position, used: false };
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

function createTeams() {
  teamsDisplay.innerHTML = "";

  if (randomizeTeamsCheckbox.checked && fullRandomCheckbox.checked) {
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

    teams = Array.from({ length: numTeams }, () => []);
    Object.entries(formation).forEach(([pos, qty]) => {
      let list = playersByPosition[pos];
      if (randomizeTeamsCheckbox.checked) list = shuffleArray(list);
      for (let i = 0; i < numTeams * qty; i++) {
        teams[i % numTeams].push(list[i]);
      }
    });

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
    teamDiv.innerHTML = `<h4>Time ${i + 1}</h4><ul>${
      team.map(p => `<li>${p.name} - ${p.position}</li>`).join("")
    }</ul>`;
    rodadaDiv.appendChild(teamDiv);
  });

  teamsDisplay.appendChild(rodadaDiv);

  const remaining = players.filter(p => !p.used);
  if (remaining.length > 0) {
    const div = document.createElement("div");
    div.classList.add("shortage-message");
    div.innerHTML = `<strong>Jogadores que sobraram:</strong><ul>${remaining.map(p => `<li>${p.name} - ${p.position}</li>`).join("")}</ul>`;
    teamsDisplay.appendChild(div);
  }

  salvarJogadores();
}

createTeamsButton.addEventListener("click", createTeams);
reshuffleTeamsButton.addEventListener("click", createTeams);

resetTeamsButton.addEventListener("click", function () {
  players.forEach(p => p.used = false);
  teamsDisplay.innerHTML = "<p>Todos os jogadores foram liberados para nova formação de times.</p>";
  salvarJogadores();
  randomizeTeamsCheckbox.checked = false;
  fullRandomCheckbox.checked = false;
});

