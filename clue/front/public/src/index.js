import { createGame } from "./requests.js";

import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/+esm";

const socket = io("http://localhost:5500");
socket.on("connect", () => {
    console.log("conectou!", socket.id);
});

const gameList = document.getElementById('games');

socket.on('game_list', (response) => {
    gameList.innerHTML = "";
    console.log(response.games);
    for (let i = 0; i < response.games.length; i++) {
        console.log(response.games[i]);
        var li = document.createElement("li");
        li.id = response.games[i];
        li.textContent = response.games[i];
        gameList.appendChild(li);
    }
});

if (sessionStorage.getItem('user_id') === null) {
    socket.emit('user_id');
    socket.on('user_id', (response) => {
        console.log(`user id received: ${response.user_id}`)
        sessionStorage.setItem('user_id', response.user_id)
        console.log(sessionStorage.getItem('user_id'));
    });
} else {
    socket.emit('user_id', sessionStorage.getItem('user_id'));
};

const createGameButton = document.getElementById("new_game");
createGameButton.addEventListener("click", evt => {
    const n_players = parseInt(document.getElementById("n_players").value);
    console.log(`n_players: ${n_players}`);
    createGame(socket, n_players);
  }); 

const test = document.getElementById("test");

document.addEventListener("change", evt => {
    var game_id = localStorage.getItem("game_id");
    test.textContent = game_id;

});

document.getElementById("games").addEventListener("click", function(e) {
    if(e.target && e.target.nodeName == "LI") {
        sessionStorage.setItem('selected_game', e.target.id);
        window.location.href = '../dist/game.html';
    }
});

// console.log(game_id);
// sessionStorage.setItem('user_id', uuid);
// window.location.href = '../dist/game.html';