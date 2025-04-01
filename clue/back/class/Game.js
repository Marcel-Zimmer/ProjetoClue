const { constChars, constWeapons, constRooms } = require("../consts/constsGame.js");
const Board = require("./Board");
const Player = require("./Player");
const CircularLinkedList = require("./CircularLinkedList");

class Game{
    constructor(id,numberOfPlayers){
        this.boardClass = new Board();
        this.gameId = id;
        this.numberOfPlayers = numberOfPlayers;
        this.board = this.boardClass.getBoard();
        this.availableChars = [...constChars];
        this.auxAvailableChars= [...this.availableChars]
        this.weapons = [...constWeapons];
        this.auxWeapons = [...this.weapons];
        this.rooms = [...constRooms];
        this.players = [];
        this.users=[]
        this.playersPositions = {}
        this.selectChars = []
    }

    getAvaliablesChars(){
        return this.availableChars
    }

    sortMurder(){
        this.murder = [];
        this.sortedCharacter();
        this.sortedRoom();
        this.sortedWeapon()
    }

    sortedCharacter(){         
        let sorted = Math.floor(Math.random() * this.availableChars.length)
        this.murder.push(this.availableChars[sorted])
        this.availableChars.splice(sorted,1)
    }

    sortedWeapon(){
        let sorted = Math.floor(Math.random() * this.weapons.length)
        this.murder.push(this.weapons[sorted])
        this.weapons.splice(sorted,1)
    }

    sortedRoom(){
        let sorted = Math.floor(Math.random() * this.rooms.length)
        this.murder.push(this.rooms[sorted])
        this.rooms.splice(sorted,1)
    }

    searchPlayer(user_id){
        return this.players.find(element => element.id === user_id);    
    }

    removeCharacter(character){
        for(let i=0;i<this.availableChars.length;i++){
            if(this.availableChars[i]===character){
                this.availableChars.splice(i,1)
            }
        }
    }

    addUserToGame(userId){
        if(!this.players.find(element => element===userId)){
            let player = new Player(userId)
            this.players.push(player)
            this.users.push(userId)
        }
    } 

    createLinkedList(){
        this.linkedList = new CircularLinkedList(this.numberOfPlayers)
    }

    startPosition(player){
        if (!this.playersPositions[player.id]) {
            this.playersPositions[player.id] = []; 
        }
        this.playersPositions[player.id].push(this.board.starts[player.name]);
    }

    startGame(){
        this.sortMurder();
        this.getCardsAvaliables();
        this.dealCardsForEachPlayer();
        this.actualPlayerId = this.findPlayerWithMissScarlet()
        this.linkedList.findNode(this.actualPlayerId)
        this.startTurn(this.actualPlayerId)
        this.status = "in_progress"
        this.boardClass.mapBoard();
        this.boardClass.mapWalkableRooms();
        this.boardClass.getWalkableRooms();
        this.players.forEach(element => {
            this.linkedList.append(element.id)
            this.startPosition(element)
            this.selectChars.push(element.name)

        });
    }

    rollDice(){
        let random = 6 //1 + Math.floor(Math.random() * 15);
        this.dice = random 
        this.actualPlayer.played_actions.push("ROLL_DICE")
        this.actualPlayer.possible_actions.push("WALK")
        let index = this.actualPlayer.possible_actions.indexOf("ROLL_DICE")
        if(index != -1){
            this.actualPlayer.possible_actions.splice(index,1)
        }
    }

    nextPlayer(){
        if(this.linkedList.findNode(this.actualPlayerId)){
            let nextPlayerId = this.linkedList.getNextId()
            this.actualPlayerId = nextPlayerId
            this.startTurn(nextPlayerId)
        }
        this.isCoordinateARoom(this.playersPositions[this.actualPlayer.player_id][0])
    }

    startTurn(playerId){
        this.actualPlayer = {"player_id":playerId,"played_actions":[],"possible_actions": ["END_PLAY","ROLL_DICE","ACCUSE"],"answer_player": null, "picked_cards": [],"answered": false}
    }

    playerCanRollDice(){
        if(this.actualPlayer.possible_actions.includes('ROLL_DICE')){
            return true;
        }
        return false;
    }
    
    findPlayerWithMissScarlet(){
        return this.players.find(player => player.cards.includes('MISS_SCARLET'))?.id;
    }

    getCardsAvaliables(){
        this.cardsAvaliables = []
        for(let i=0; i < this.availableChars.length ; i++){
            this.cardsAvaliables.push(this.availableChars[i])
            this.availableChars.slice(i,1)
        }
        for(let i=0; i < this.weapons.length ; i++){
            this.cardsAvaliables.push(this.weapons[i])
            this.weapons.slice(i,1)
        }
        for(let i=0; i < this.rooms.length ; i++){
            this.cardsAvaliables.push(this.rooms[i])
            this.rooms.slice(i,1)
        }
        this.cardsAvaliables.sort(() => Math.random() - 0.5);
    }

    dealCardsForEachPlayer(){
        let index = 0;
        for(let i=0; i < this.cardsAvaliables.length; i++){
            this.players[index].cards.push(this.cardsAvaliables[i])
            if(index < this.numberOfPlayers-1){
                index ++;
            }
            else{
                index = 0;
            }
        }
    }

    walkablePath(){
        let coord = this.playersPositions[this.actualPlayer.player_id][0]
        let pathCoord = this.boardClass.getWalkingPath(this.dice, coord)
        let rooms = this.boardClass.getWalkableRooms()
        this._walk={"walkable_path": pathCoord,"walkable_rooms_":rooms}
    }

    playerWalk(coord){
        if(coord != null){
            this.boardClass.playerMoving(this.playersPositions[this.actualPlayer.player_id][0], coord,this.actualPlayerId)
            this.playersPositions[this.actualPlayer.player_id][0] = coord
            this.actualPlayer.played_actions.push("WALK")
            let index = this.actualPlayer.possible_actions.indexOf("WALK")
            if(index != -1){
                this.actualPlayer.possible_actions.splice(index,1)
            }
        }
    }

    isCoordinateARoom(coord){
        if(this.boardClass.getPosition(coord)){
            this.actualPlayer.possible_actions.push("ASK")
            return true 
        }
        return false 
    }

    getCardsForPlayerId(id,coord){
        let player = this.searchPlayer(id)
        let cardFind 
        let arrayChars = []
        let arrayWeapons= []
        for(let c = 0; c < this.auxAvailableChars.length; c ++){
            cardFind = false
            for(let p = 0; p < player.cards.length; p ++){
                if(this.auxAvailableChars[c] === player.cards[p]){
                    cardFind = true
                }
            }
            if(!cardFind){
                arrayChars.push(this.auxAvailableChars[c])
            }
        }
        for(let c = 0; c < this.auxWeapons.length; c ++){
            cardFind = false
            for(let p = 0; p < player.cards.length; p ++){
                if(this.auxWeapons[c] === player.cards[p]){
                    cardFind = true
                }
            }
            if(!cardFind){
                arrayWeapons.push(this.auxWeapons[c])
            }
        }
        let jsonReturn = {
            characters:arrayChars,
            weapons:arrayWeapons,
            room:this.boardClass.getRoom(coord)
        }
        return jsonReturn
    }

    setAnseredCards(cards){
        this.actualPlayer.picked_cards = cards
        let index = this.actualPlayer.possible_actions.indexOf("ASK")
        if(index != -1){
            this.actualPlayer.possible_actions.splice(index,1)
        }
        this.actualPlayer.played_actions.push("ASK")
    }

    answerToPlayers(cards){
        this.linkedList.findNode(this.actualPlayerId)
        let nextId = ""
        let respost = {}
        do{
            nextId = this.linkedList.getNextId()
            respost = this.verifyCards(nextId, cards)
            if(this.verifyCards(nextId,cards)){
                return respost 
            }

        }
        while(nextId !== this.actualPlayerId);

        return null
    }

    verifyCards(id,cards){
        var player = this.searchPlayer(id)
        let cardsRespost = []
        for(let c = 0; c<cards.length; c++){
            for(let pc =0; pc <player.cards.length; pc++){
                if(cards[c]===player.cards[pc]){
                    cardsRespost.push(cards[c])
                }
            }
        }
        if(cards.length === 0){
            return null
        }else{
            return {player_id:id,answer_card : cardsRespost }
        }
    }
    anwserToPlayer(idAnswerPlayer){
        this.actualPlayer.answer_player = idAnswerPlayer 
    }

    askAnswered(){
        this.actualPlayer.answered = true
    }
    walkIsNull(){
        this._walk={"walkable_path": this.playersPositions[this.actualPlayer.player_id][0],"walkable_rooms_":null}
    }

    
    exportGameToJson(){
        return {
            actual_play:this.actualPlayer,
            actual_player_id:this.actualPlayerId,
            available_chars:this.availableChars,
            board:this.board,
            game_Id:this.gameId,
            n_players: this.numberOfPlayers,
            players:this.players,
            players_positions:this.playersPositions,
            select_chars:this.selectChars,
            status:this.status,
            users:this.users,
            dice:this.dice,
            _walk:this._walk,

        };
    }

}module.exports = Game;