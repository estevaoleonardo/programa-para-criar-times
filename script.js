const playerForm = document.getElementById("playerForm");
const playerList = document.getElementById("playerList");
const createTeamsButton = document.getElementById("createTeams");
const resetTeamsButton = document.getElementById("resetTeams");
const teamsDisplay = document.querySelector(".teams-display");

let players = [];

// Formação desejada: 7 jogadores
const formation = {
    "Goleiro": 1,
    "Zagueiro": 2,
    "Lateral Direito": 1,
    "Lateral Esquerdo": 1,
    "Volante": 1,
    "Atacante": 1
};

playerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("playerName").value.trim();
    const position = document.getElementById("playerPosition").value;

    if (!name || !position) return;

    players.push({ name, position, used: false });

   const index = players.length - 1;
const listItem = document.createElement("li");
listItem.setAttribute("data-index", index);

const text = document.createElement("span");
text.textContent = `${name} - ${position}`;
listItem.appendChild(text);

// Botão Editar
const editBtn = document.createElement("button");
editBtn.textContent = "Editar";
editBtn.classList.add("edit-btn");
editBtn.addEventListener("click", () => {
    const currentPlayer = players[index];
    const select = document.createElement("select");

    Object.keys(formation).forEach(pos => {
        const option = document.createElement("option");
        option.value = pos;
        option.textContent = pos;
        if (pos === currentPlayer.position) option.selected = true;
        select.appendChild(option);
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Salvar";
    saveBtn.classList.add("save-btn");

    saveBtn.addEventListener("click", () => {
        const newPos = select.value;
        players[index].position = newPos;
        text.textContent = `${players[index].name} - ${newPos}`;
        listItem.removeChild(select);
        listItem.removeChild(saveBtn);
        listItem.appendChild(editBtn);
        listItem.appendChild(deleteBtn);
    });

    listItem.removeChild(editBtn);
    listItem.removeChild(deleteBtn);
    listItem.appendChild(select);
    listItem.appendChild(saveBtn);
});

// Botão Excluir
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Excluir";
deleteBtn.classList.add("delete-btn");
deleteBtn.addEventListener("click", () => {
    players.splice(index, 1); // remove do array
    playerList.removeChild(listItem); // remove da tela
});

listItem.appendChild(editBtn);
listItem.appendChild(deleteBtn);
playerList.appendChild(listItem);


    playerForm.reset();
});

createTeamsButton.addEventListener("click", function () {
    const availablePlayers = players.filter(p => !p.used);

    const playersByPosition = {};
    Object.keys(formation).forEach(pos => playersByPosition[pos] = []);
    availablePlayers.forEach(player => {
        if (playersByPosition[player.position]) {
            playersByPosition[player.position].push(player);
        }
    });

    const maxTeamsPerPosition = Object.entries(formation).map(([pos, qty]) => {
        return Math.floor(playersByPosition[pos].length / qty);
    });

    const numTeams = Math.min(...maxTeamsPerPosition);

    if (numTeams === 0) {
        const message = document.createElement("p");
        message.textContent = "Não há jogadores suficientes para formar times completos.";
        teamsDisplay.appendChild(message);
    } else {
        const rodadaDiv = document.createElement("div");
        rodadaDiv.classList.add("rodada");

        const rodadaNum = document.querySelectorAll(".rodada").length + 1;
        const rodadaTitle = document.createElement("h3");
        rodadaTitle.textContent = `Rodada ${rodadaNum}`;
        rodadaDiv.appendChild(rodadaTitle);

        for (let i = 0; i < numTeams; i++) {
            const teamDiv = document.createElement("div");
            teamDiv.classList.add("team");

            const teamTitle = document.createElement("h4");
            teamTitle.textContent = `Time ${i + 1}`;
            teamDiv.appendChild(teamTitle);

            const ul = document.createElement("ul");

            Object.entries(formation).forEach(([pos, qty]) => {
                for (let j = 0; j < qty; j++) {
                    const player = playersByPosition[pos].shift();
                    player.used = true;
                    const li = document.createElement("li");
                    li.textContent = `${player.name} - ${pos}`;
                    ul.appendChild(li);
                }
            });

            teamDiv.appendChild(ul);
            rodadaDiv.appendChild(teamDiv);
        }

        teamsDisplay.appendChild(rodadaDiv);
    }

    // Verifica posições faltantes
    const shortages = {};
    Object.entries(formation).forEach(([pos, qty]) => {
        const remaining = playersByPosition[pos].length;
        const needed = qty;
        if (remaining < needed) {
            shortages[pos] = needed - remaining;
        }
    });

    if (Object.keys(shortages).length > 0) {
        const shortageMessage = document.createElement("div");
        shortageMessage.classList.add("shortage-message");

        let msg = `<strong>Faltam jogadores para formar mais um time:</strong><ul>`;
        for (const [pos, qty] of Object.entries(shortages)) {
            msg += `<li>${pos}: precisa de mais ${qty}</li>`;
        }
        msg += `</ul>`;

        shortageMessage.innerHTML = msg;
        teamsDisplay.appendChild(shortageMessage);
    }

    // Lista jogadores restantes
    const remainingPlayers = players.filter(p => !p.used);
    if (remainingPlayers.length > 0) {
        const leftovers = document.createElement("div");
        leftovers.classList.add("shortage-message");

        let msg = `<strong>Jogadores que sobraram:</strong><ul>`;
        remainingPlayers.forEach(p => {
            msg += `<li>${p.name} - ${p.position}</li>`;
        });
        msg += `</ul>`;

        leftovers.innerHTML = msg;
        teamsDisplay.appendChild(leftovers);
    }
});

// Botão para resetar times e liberar todos os jogadores
resetTeamsButton.addEventListener("click", function () {
    players.forEach(player => {
        player.used = false;
    });

    teamsDisplay.innerHTML = "<p>Todos os jogadores foram liberados para nova formação de times.</p>";
});
