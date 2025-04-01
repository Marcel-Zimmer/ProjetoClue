const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer();
const Game = require("./class/Game");
const Session = require("./class/Sessions")
const Player = require('./class/Player');
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5501", 
    methods: ["GET", "POST"]
  }
});
const session = new Session();
const users = {};

//conexão do cliente com o socket do servidor
io.on('connection', socket =>{
  sendNumberOfGames(socket)//assim que o cliente se conecta o servidor emite as sessões ativas 
  const player = new Player() //cria um objeto do tipo player 
  
  //Função do socket para lidar com o user_id e adicionar no users para ter atualizado os sockets ids
  socket.on('user_id',(response)=>{
    //caso seja passado um id ele é atualizado com o nome id do socket 
    if(response != null){
      player.user_id = response
      if (!users[player.user_id]) {
        users[player.user_id] = {}
      }
      users[player.user_id].socket_id = socket.id
    //caso contrario é criado um novo id e atribuido ele o id do socket 
    }else{
      player.user_id = socket.id
      users[socket.id] = {user_id:socket.id, socket_id:socket.id}
      socket.emit('user_id', player)
    }
  })

    //cria um novo jogo utilizando o total de jogos como id 
    socket.on("create_game", (players) =>{
      var numberOfPlayers = 0
        if(players.n_players === null){
          numberOfPlayers = 2
        }else{
          numberOfPlayers = Math.trunc(Number(players.n_players))
        }
        session.totalOfGames +=1;
        var game = new Game(session.totalOfGames,numberOfPlayers); //cria um novo objeto do tipo game
        session.games.push(game.gameId)  //adiciona a sessão mais um jogo
        session.listOfGames.push(game)    //adiciona o objeto do jogo na sessão
        game.createLinkedList()         //cria a linked list do jogo 
        sendNumberOfGames(io)         //informa para o front que houve mudança no numero de jogos
        io.emit("create_game",game.exportGameToJson())   //retorna para o front o objeto criado

    });

    //função do socket para um jogador entrar em um game 
    socket.on("enter_game",(response)=>{
      var game = session.searchGame(Math.trunc(Number(response.game_id)))
      if(response.user_id !== null && game != null && game.players.length < game.numberOfPlayers){
        game.addUserToGame(response.user_id)
      }
      io.emit("game_state",game.exportGameToJson())
    })

    //função que retorna os personagens possiveis de escolha 
    socket.on("get_available_chars",(response)=>{
      var game = session.searchGame(Math.trunc(Number(response.game_id)))
      if(game != null){
        io.emit("get_available_chars", game.exportGameToJson())
      }
    });

    //função que recebe o personagem selecionado 
    socket.on("selected_character",(response) => {
      var game = session.searchGame(Math.trunc(Number(response.game_id)))
      if(game != null){
        var player = game.searchPlayer(response.user_id)
        player.cards.push(response.selected_character)
        player.name = response.selected_character
        game.removeCharacter(response.selected_character)
        io.emit("get_available_chars", game.exportGameToJson())
      }
    });

    //função que retorna um json com todas as informações do jogo 
    socket.on("game_users",(response)=>{
      var game = session.searchGame(Math.trunc(Number(response.game_id)))
      if(game != null){
        io.emit("game_users",game.exportGameToJson())
      }
    });

    //função que inicia o jogo 
    socket.on("start_game",(response)=>{
      var game = session.searchGame(Math.trunc(Number(response.game_id)))
      if(game != null){
        game.startGame();
        io.emit("game_state",game.exportGameToJson()) //emite o estado do jogo
        game.players.forEach(element => { //para cada jogador envia as cartas correspondentes 
          io.to(users[element.id].socket_id).emit("player_cards",element.cards)
        });
      }

    });

    //envia o estado do jogo em json 
    socket.on("game_state", (response)=>{
      if(response.game_id !=null ){
        var game = session.searchGame(Math.trunc(Number(response.game_id)))
        if(game != null){
        socket.emit("game_state",game.exportGameToJson())
        }
      }
    });

    //função que cuida das ações do jogo 
    socket.on('do_action',(response)=>{
      var game = session.searchGame(Math.trunc(Number(response.game_id)))
      if(game != null){
        //caso o jogador role o dado 
        if(response.action === 'ROLL_DICE'){
          if(game.playerCanRollDice()){
            game.rollDice()
            game.walkablePath()
          } 

        //caso o jogador ande   
        }else if(response.action === 'WALK'){
          game.playerWalk(response.args)
          if(response.args != null && game.isCoordinateARoom(response.args)){
            io.to(users[game.actualPlayerId].socket_id).emit('action_cards',game.getCardsForPlayerId(game.actualPlayerId,response.args))
          }else{
            game.walkIsNull()
          }

        //caso o jogador encerre o tunro 
        }else if(response.action ==='END_PLAY'){
          game.nextPlayer()

        //caso o jogador pergunte 
        }else if(response.action ==='ASK'){
          let answer = game.answerToPlayers(response.args)  
          game.setAnseredCards(response.args)
          if(answer.answer_card.length>0){
            game.anwserToPlayer(users[answer.player_id].user_id);  
          }

        //caso o jogador responda 
        }else if(response.action ==='ANSWER'){
          game.askAnswered()
        }
        io.emit("game_state", game.exportGameToJson())//emite o estado do jogo 
      }
    })
});

//função que avisa o front que houve mudança no numero de jogos 
function sendNumberOfGames(io){
  io.emit("game_list", session)
}

const port = 5500
server.listen(port, () => console.log("ligou"))