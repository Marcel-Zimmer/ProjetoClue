class Sessions{

    constructor(){
        this.totalOfGames = 0;
        this.games = [];
        this.listOfGames = [];
    }

    searchGame(game_id){
        return this.listOfGames.find(element => element.gameId == game_id);
    }



}module.exports = Sessions;