import { 
  getAvailableChars
} from './requests.js';
import { getSocket } from './utils.js';
import { 
  CHARACTERS_COLORS,
  buttonsActions
} from './constants.js';
import { isArrayInArray } from './utils.js';
import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.7.2/+esm";


// functions 
const chooseCharacter = (availableChars, user_id, game_id) => {
  if (sessionStorage.getItem(`character_${game_id}`) === null) {
    characterSelectionDiv.hidden = false;
    for (let i = 0; i < availableChars.length; i++) {
      const char = document.createElement("img");
      char.id = `${availableChars[i]}`;
      char.className = "char";
      char.src =  `../assets/cards/${availableChars[i]}.jpg`;
      characterSelectionDiv.appendChild(char);
    }
    characterSelectionDiv.addEventListener("click", function(e) {
      if(e.target && e.target.nodeName == "IMG") {
        sessionStorage.setItem(`character_${game_id}`, e.target.id);
        socket.emit('selected_character', {'user_id' : user_id, 'game_id' : game_id, 'selected_character' : e.target.id});
        socket.emit('game_users', {'game_id' : game_id});
        characterSelectionDiv.hidden = true;
        boardDiv.hidden = false;
        uiDiv.hidden = false;
      }
    });
  }
};

const displayCards = (cards) => {
  for (let i = 0; i < cards.length; i++) {
    const card = document.createElement("img");
    card.id = `${cards[i]}`;
    card.className = 'player_card';
    card.src = `../assets/cards/${cards[i]}.jpg`;
    cardsDiv.appendChild(card);
  }
}

const appendCard = (element, value) => {

  const newElement = document.createElement('img');
  newElement.src = `../assets/cards/${value}.jpg`;;
  newElement.className = 'player_card';
  newElement.id = `${value}`;
  element.appendChild(newElement);
}

const disableButtons = () => {
  document.querySelectorAll('button.action_button').forEach(elem => {
    elem.disabled = true;
});
}

const startGame = (game_id, socket) => {
  socket.emit('start_game', {'game_id' : game_id});
  // const gameState = JSON.parse(sessionStorage.getItem('game_state'));
};

const drawPin = (color, coords, ctx, tileSize) => {
  const pinX = (coords[0] * tileSize) + tileSize / 2;
  const pinY = (coords[1] * tileSize) + tileSize / 2;
  ctx.beginPath();
  ctx.arc(pinX, pinY, tileSize / 2, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.stroke();
};

const removeChilds = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

// Elements
const characterSelectionDiv = document.getElementById("character_selection");
const img = document.getElementById("board_bkg");
const startGameButton = document.getElementById("start_game");
const boardDiv = document.getElementById("board");
const uiDiv = document.getElementById("ui");
const cardsDiv = document.getElementById("cards");
const diceDisplay = document.getElementById("dice_display");
const askPopup = document.getElementById("ask_ui");
const askRoomCardDiv = document.getElementById("ask_room_card");
const askCharsCardsDiv = document.getElementById("ask_character");
const askWeaponsCardsDiv = document.getElementById("ask_weapon");
const answerPopup = document.getElementById("answer_ui");
const answerCardsDiv = document.getElementById("answer_cards");



//// Buttons
const buttonsDiv = document.getElementById("buttons");
const accuseButton = document.getElementById('ACCUSE');
const rollDiceButton = document.getElementById('ROLL_DICE');
const askButton = document.getElementById('ASK');
const endTurnButton = document.getElementById('END_PLAY');
const walkButton = document.getElementById('WALK');
const askConfirmButton = document.getElementById('confirm_ask');
const askCancelButton = document.getElementById('cancel_ask');
const answerConfirmButton = document.getElementById('confirm_answer');
const answerCancelButton = document.getElementById('cancel_answer');

const socket = io("http://localhost:5500");
socket.on("connect", () => {
    console.log("aaaa!", socket.id);
});

// init
//const socket = getSocket();
const game_id = sessionStorage.getItem("selected_game");
const user_id = sessionStorage.getItem('user_id');
socket.emit('user_id',user_id)
socket.emit('enter_game', {'game_id' : game_id, 'user_id' : user_id});
const availableChars = await getAvailableChars(socket, game_id);
startGameButton.disabled = true;
buttonsDiv.hidden = true;
chooseCharacter(availableChars, user_id, game_id);

socket.on('game_users', (response) => {
  console.log(response);
  if (response.users.length === response.n_players) {
    startGameButton.disabled = false;
  }
});

if (sessionStorage.getItem(`character_${game_id}`) === null) {
  boardDiv.hidden = true;
  uiDiv.hidden = true;
};

if (sessionStorage.getItem('game_state') !== null) {
  const gameState = JSON.parse(sessionStorage.getItem('game_state'));
  if (user_id == gameState.actual_player_id) {
    buttonsDiv.hidden = false;
  };
  if (gameState.users.length === gameState.n_players) {
    // console.log('entered if');
    startGameButton.hidden = true;
    const cards = JSON.parse(sessionStorage.getItem('cards'));
    // console.log(cards);
    displayCards(cards);
  };
}

// Buttons events
startGameButton.addEventListener("click", e =>{
  startGame(game_id, socket);
});

accuseButton.addEventListener('click', e => {
  console.log(sessionStorage.getItem('game_state'));
  // socket.emit('game_state', {'game_id' : game_id});
});

rollDiceButton.addEventListener('click', e => {
  socket.emit('do_action', {'action' : 'ROLL_DICE', 'game_id' : game_id});
});

walkButton.addEventListener('click', e => {
  console.log(`inside walk button`);
  const pickedPosition = JSON.parse(sessionStorage.getItem('temp_position'));
  sessionStorage.setItem('walkable_path', false);
  sessionStorage.setItem('temp_position', null);
  const gameState = JSON.parse(sessionStorage.getItem('game_state'));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, 900, 900);
  drawGrid(canvas, ctx, tileSize, null, gameState, false);
  // drawPins(ctx, tileSize, gameState);
  socket.emit('do_action', {'action' : 'WALK', 'game_id' : game_id, 'args' : pickedPosition});

});

askButton.addEventListener('click', e => {
  askCancelButton.disabled = false;
  askPopup.style.display = 'block';
  var charCount = 0;
  var weaponCount = 0;

  sessionStorage.setItem('ask_selected_char', null);
  sessionStorage.setItem('ask_selected_weapon', null);

  removeChilds(askRoomCardDiv);
  removeChilds(askCharsCardsDiv);
  removeChilds(askWeaponsCardsDiv);

  const roomCardDiv = document.getElementById("ask_room_card");
  const charsCardsDiv = document.getElementById("ask_character");
  const weaponsCardsDiv = document.getElementById("ask_weapon");


  const actionCards = JSON.parse(sessionStorage.getItem('action_cards'));
  // display cards
  appendCard(roomCardDiv, actionCards.room);
  
  for (let i = 0; i < actionCards.characters.length; i++) {
    appendCard(charsCardsDiv, actionCards.characters[i]);
  };

  for (let i = 0; i < actionCards.weapons.length; i++) {
    appendCard(weaponsCardsDiv, actionCards.weapons[i]);
  };


  // add click event to cards, when clicked select a card
  for (let i = 0; i < charsCardsDiv.children.length; i++) {
    const child = charsCardsDiv.children[i];
    child.addEventListener('click', e => {
      sessionStorage.setItem('ask_selected_char', e.target.id);
      charCount += 1;
    });
  };

  for (let i = 0; i < weaponsCardsDiv.children.length; i++) {
    const child = weaponsCardsDiv.children[i];
    child.addEventListener('click', e => {
      sessionStorage.setItem('ask_selected_weapon', e.target.id);
      weaponCount += 1;
    });
  };

  // add outer event to ui feedback of selected card
  askPopup.addEventListener('click', e => {

    for (let i = 0; i < weaponsCardsDiv.children.length; i++) {
      const child = weaponsCardsDiv.children[i];
      if (child.id == sessionStorage.getItem('ask_selected_weapon')) {
        child.style.opacity = '0.5';
      } else {
        child.style.opacity = '1';
      };
    }

    for (let i = 0; i < charsCardsDiv.children.length; i++) {
      const child = charsCardsDiv.children[i];
      if (child.id == sessionStorage.getItem('ask_selected_char')) {
        child.style.opacity = '0.5';
      } else {
        child.style.opacity = '1';
      };
    } 

    if (charCount > 0 && weaponCount > 0) {
      askConfirmButton.disabled = false;
    }
  });
});

endTurnButton.addEventListener('click', e => {
  socket.emit('do_action', {'action' : 'END_PLAY', 'game_id' : game_id})
});

askCancelButton.addEventListener('click', e => {
  removeChilds(askRoomCardDiv);
  removeChilds(askCharsCardsDiv);
  removeChilds(askWeaponsCardsDiv);
  askPopup.style.display = 'none';
});

askConfirmButton.addEventListener('click', e => {
    socket.emit('do_action', {
      'action' : 'ASK', 
      'game_id' : game_id, 
      'args' : [
        sessionStorage.getItem('ask_selected_char'),
        sessionStorage.getItem('ask_selected_weapon')
      ]
    })
    askPopup.style.display = 'none';
});

answerCancelButton.addEventListener('click', e => {
  removeChilds(answerCardsDiv);
  answerPopup.style.display = 'none';
});

answerConfirmButton.addEventListener('click', e => {
  console.log("chamou")
  socket.emit('do_action', {
    'action' : 'ANSWER', 
    'game_id' : game_id, 
    'args' : sessionStorage.getItem('answer_card')});
    answerPopup.style.display = 'none';
    sessionStorage.setItem
});

//// canvas
const size = 26;
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 900;
const ctx = canvas.getContext("2d");
ctx.font = "11px courier";
ctx.textBaseline = "top";
const tileSize = canvas.width / size;
const status = document.createElement("pre");
let lastTile = -1;

// mainloop

// ON GAME_STATE

socket.on('game_state', (response) => {
  console.log(response)
  startGameButton.hidden = true;
  disableButtons();
  console.log(`actual_play ${JSON.stringify(response.actual_play)}`);
  sessionStorage.setItem('game_state', JSON.stringify(response));
  drawGrid(canvas, ctx, tileSize, null, response, false);
  drawPins(ctx, tileSize, response);
  diceDisplay.textContent = `Dice: ${response.dice}`;
  console.log(`user_id ${user_id}/ actual_player_id ${response.actual_player_id}`);
  if (user_id == response.actual_player_id) {
    buttonsDiv.hidden = false;
    const possibleActions = response.actual_play.possible_actions;
    console.log(possibleActions);
    for (let i = 0; i < possibleActions.length; i++) {
      if (buttonsActions.includes(possibleActions[i])) {
        const button = document.getElementById(possibleActions[i]);
        button.disabled = false;
      }
      if (possibleActions[i] === 'WALK') {
        sessionStorage.setItem('walkable_path', true);
        drawGrid(canvas, ctx, tileSize, null, response, true);
        drawPins(ctx, tileSize, response);
        canvas.addEventListener("click",  (event) => {
          const tileX = ~~(event.offsetX / tileSize);
          const tileY = ~~(event.offsetY / tileSize);
          if (isArrayInArray(response._walk.walkable_path, [tileX, tileY])) {
            sessionStorage.setItem('temp_position', JSON.stringify([tileX, tileY]));
            walkButton.disabled = false;
          }
        });
      };
    };
  } else if (user_id == response.actual_play.answer_player && response.actual_play.answered == false) {
    console.log(`ANSWER: ${user_id} / ${response.actual_play.answer_player}`)
    answerCancelButton.disabled = false;
    answerPopup.style.display = 'block';
    sessionStorage.setItem('answer_card', null);
    const answerCardsDiv = document.getElementById('answer_cards');
    const answerTitle = document.getElementById('answer_h1'); 
    const player_cards = JSON.parse(sessionStorage.getItem('cards'));

    answerTitle.textContent = `Select a card to answer ${response.actual_player_id}:`;

    for (let i = 0; i < response.actual_play.picked_cards.length; i++) {
      const cardValue = response.actual_play.picked_cards[i];
      if (player_cards.includes(cardValue)) {
        appendCard(answerCardsDiv, response.actual_play.picked_cards[i]);
      };
    };

    for (let i = 0; i < answerCardsDiv.children.length; i++) {
      const child = answerCardsDiv.children[i];
      child.addEventListener('click', e => {
        sessionStorage.setItem('answer_card', e.target.id);
      });
    };

    answerPopup.addEventListener('click', e => {
      for (let i = 0; i < answerCardsDiv.children.length; i++) {
        const child = answerCardsDiv.children[i];
        if (child.id == sessionStorage.getItem('answer_card')) {
          child.style.opacity = '0.5';
        } else {
          child.style.opacity = '1';
        };
      }
  
      if (sessionStorage.getItem('answer_card') != null) {
        console.log(sessionStorage.getItem('answer_card'));
        answerConfirmButton.disabled = false;
      }
    });
  };
});

socket.on('player_cards', (response) => {
  sessionStorage.setItem('cards', JSON.stringify(response));
  displayCards(response);
});

socket.on('action_cards', (response) => {
  sessionStorage.setItem('action_cards', JSON.stringify(response));
  console.log(`received private action_cards ${response}`);
});

socket.on('answer_card', (response) => {
  answerPopup.style.display = 'block';
  answerConfirmButton.style.display = 'none';
  answerCancelButton.textContent = 'Ok';
  answerCancelButton.disabled = false
  const gameState = JSON.parse(sessionStorage.getItem('game_state'));
  console.log(`answer_card ${response}`);
  const answerCardsDiv = document.getElementById('answer_cards');
  const answerTitle = document.getElementById('answer_h1');
  console.log(gameState)
  answerTitle.textContent = `Answer from ${gameState.actual_play.answer_player}`;
  appendCard(answerCardsDiv, response);
  
});


// Draws
const drawPins = (ctx, tileSize, gameState) => {
  const isWalkablePath = JSON.parse(sessionStorage.getItem('walkable_path'));
  for (let i = 0; i < gameState.players.length; i++) {
    if (isWalkablePath == true && gameState.players[i].id == gameState.actual_player_id) {
      const tempPosition = JSON.parse(sessionStorage.getItem('temp_position'));
      if (tempPosition != null) {
        const coords = tempPosition;
        const color = CHARACTERS_COLORS[gameState.players[i].name];
        drawPin(color, coords, ctx, tileSize);
        
      } else {
        const coords = gameState.players_positions[gameState.players[i].id];
        const color = CHARACTERS_COLORS[gameState.players[i].name];
        drawPin(color, coords, ctx, tileSize);
        
      }
    } else {
      const coords = gameState.players_positions[gameState.players[i].id];
      const color = CHARACTERS_COLORS[gameState.players[i].name];
      drawPin(color, coords, ctx, tileSize);
      
    }
  }
}

const drawGrid = (canvas, ctx, tileSize, highlightNum, gameState, isWalkablePath) => {
  console.log(gameState)

  for (let y = 0; y < canvas.width / tileSize; y++) {
    for (let x = 0; x < canvas.height / tileSize; x++) {
      // const parity = (x + y) % 2;
      const tileNum = x + canvas.width / tileSize * y;
      const xx = x * tileSize;
      const yy = y * tileSize;
      // const isWalkablePath = sessionStorage.getItem('walkable_path');

      if (gameState.board.static[y][x] != 0) {
        ctx.strokeStyle = "black";
        ctx.strokeRect(xx, yy, tileSize, tileSize);
      }
      if (isWalkablePath == true) {
        const char = sessionStorage.getItem(`character_${game_id}`);
        const color = CHARACTERS_COLORS[char];
        const rooms = gameState._walk.walkable_rooms_;
        if (isArrayInArray(gameState._walk.walkable_path, [x, y])) {
          ctx.fillStyle = "rgba(225, 245, 144, 0.6)";
          ctx.fillRect(xx, yy, tileSize, tileSize);
          if (tileNum === highlightNum) {
            drawPin(color, [x, y], ctx, tileSize);
          }
        }

        if (tileNum === highlightNum) {
          for (let i = 0; i < rooms.length; i++) {
            const roomsRanges = gameState.board.rooms_paths;
            const roomPath = roomsRanges[rooms[i]];
  
            ctx.fillStyle = "rgba(39, 191, 245, 0.4)";
            if (isArrayInArray(roomPath, [x, y])) {
              for (let k = 0; k < roomPath.length; k++) {
                const kxx = roomPath[k][0] * tileSize;
                const kyy = roomPath[k][1] * tileSize;
                ctx.fillRect(kxx, kyy, tileSize, tileSize);
              }
            }
          }
        }

        for (let i = 0; i < rooms.length; i++) {
          const roomsRanges = gameState.board.rooms_paths;
          const roomPath = roomsRanges[rooms[i]];
          ctx.fillStyle = "rgba(250,130,55, 0.02)";
          if (isArrayInArray(roomPath, [x, y])) {
            for (let k = 0; k < roomPath.length; k++) {
              const kxx = roomPath[k][0] * tileSize;
              const kyy = roomPath[k][1] * tileSize;
              ctx.fillRect(kxx, kyy, tileSize, tileSize);
            }
          }
        }
      }
    }
  }
};

ctx.drawImage(img, 0, 0, 900, 900);

boardDiv.appendChild(canvas);
document.body.appendChild(status);

canvas.addEventListener("mousemove", evt => {
  evt.target.style.cursor = "pointer";
  const tileX = ~~(evt.offsetX / tileSize);
  const tileY = ~~(evt.offsetY / tileSize);
  const tileNum = tileX + canvas.width / tileSize * tileY;
  const gameState = JSON.parse(sessionStorage.getItem('game_state'));
  const isWalkablePath = JSON.parse(sessionStorage.getItem('walkable_path'));
  if (tileNum !== lastTile) {
    lastTile = tileNum;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, 900, 900);
    drawGrid(canvas, ctx, tileSize, tileNum, gameState, isWalkablePath);
    drawPins(ctx, tileSize, gameState);
  }
});
