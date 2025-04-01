export function createGame (socket, n_players) {
  socket.emit("create_game", {'n_players' : n_players});
  socket.on("create_game", (response) => {
    console.log(`game id from requests ${response.game_id}`);
    localStorage.setItem("game_id", response.game_id);
  });
};

export const getAvailableChars =  function (socket, game_id) {
  return new Promise(function(resolve, reject) {
    socket.emit('get_available_chars', {'game_id' : game_id});
    socket.on('get_available_chars', (response) => { 
      console.log(response)
      resolve(response.available_chars);
    });
  });
}

export const getGameState =  function (socket, game_id) {
  return new Promise(function(resolve, reject) {
    socket.emit("game_state", {'game_id' : game_id});
    socket.on("game_state", (response) => { 
      // localStorage.setItem("game_state", response);
      resolve(response);
    });
  });
}

// export function getGameState (socket, game_id) {
//   socket.emit("game_state", {'game_id' : game_id});
//   socket.on("game_state", (response) => {
//     // localStorage.setItem("game_id", response.game_id);
//     console.log(`game state: ${response.game_id}`)
//   });
// };
