const { constStarts, constStatic, constRooms_ranges, constRooms_paths } = require("../consts/constsBoard.js");
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

class Board{
    board = {
        starts: deepCopy(constStarts),
        static: deepCopy(constStatic),
        rooms_ranges: deepCopy(constRooms_ranges),
        rooms_paths: deepCopy(constRooms_paths)
        }
    originBoard = {...this.board};
    directions = [[0,-1],[0,1],[-1,0],[1,0]]

    //retorna o board
    getBoard(){
        return {...this.board}
    }

    //retorna as salas em que se pode andar
    getWalkableRooms(){
        return this.walkableRooms
    }

    //chama a função recursiva que verifica se pode andar 
    walking(dice, coordenates) {
        if (dice === 0) return;
    
        for (let direction of this.directions) {
            let x = coordenates[0] + direction[0]; 
            let y = coordenates[1] + direction[1]; 
            let coor = this.canWalk([x, y],coordenates);
            if (coor !== null) { 
                this.salveWalkCoordenates(coor); 
                this.walking(dice - 1, coor);
            }
        }
    }
    
    // Verifica se pode andar
    canWalk(newCordenates, currentCoordinates) {
        let [x, y] = newCordenates; 
        let [cx, cy] = currentCoordinates;
        if (x < 0 || x >= 26 || y < 0 || y >= 26) return null;
    
        let cell = this.board.static[y][x]; 

        if (cx === 17 && cy === 6 && x === 18 && y === 6) {
            return null;
        }

        if (cx === 5 && cy === 19 && x === 5 && y === 20) {
            return null;
        }
        
        if ((cell === 1 || cell === "door" || cell ==="inside") ) { 
            return newCordenates;
        }
        return null;
    }

    //função que recebe o dado e as corrdenadas atuais, cria os maps relevantes, chama a função walking e retorna as casas em que se pode andar    
    getWalkingPath(dice, coordenates){
        this.walk_path = new Map()
        this.walkableRooms = []
        this.walking(dice, coordenates) 
        let valuesArray = Array.from(this.walk_path.values());
        valuesArray.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        return valuesArray
    }

    //cria o map do board
    mapBoard(){
        this.map = new Map();
        for(let l=0; l<this.board.static.length; l++){
            for(let c=0; c<this.board.static[l].length; c++){
                this.map.set(`${l},${c}`, this.board.static[l][c]); 
            }
        }
    }
    
    //cria o map das salas e as suas coordenadas 
    mapWalkableRooms(){
        this.walkableRoomsMap = new Map();
        for (let [room, coordinates] of Object.entries(this.board.rooms_paths)) {
            for (let coord of coordinates) {
                let key = `${coord[0]},${coord[1]}`;
                this.walkableRoomsMap.set(key, room);
            }
        }
    }

    //adiciona uma sala as salas andaveis 
    pushRoomInArray(targetCoord){
        let stringKey = targetCoord.join(",");
        if(this.walkableRoomsMap.has(stringKey))
            this.walkableRooms.push(this.walkableRoomsMap.get(stringKey))
    }

    //salva a coordenada ao map de coordenaveis andaveis 
    salveWalkCoordenates(coordenates) {
        let stringKey = coordenates.join(",");
        if (!this.walk_path.has(stringKey)) {
            this.walk_path.set(stringKey,[...coordenates]); 
            this.pushRoomInArray([...coordenates])
        }
    }

    //função que move o jogador
    playerMoving(oldCoord,newCoord,playerId){
        this.board.static[oldCoord[1]][oldCoord[0]] = this.originBoard.static[oldCoord[1]][oldCoord[0]]
        this.board.static[newCoord[1]][newCoord[0]] = playerId
    }

    //função booleana que verifica se um jogador pode se mover para a posição 
    getPosition(targetCoord){
        let stringKey = targetCoord.join(",");
        if(this.walkableRoomsMap.has(stringKey)) {
            return true
        } 
        return false       
    }

    //verifica qual é a sala das coordenadas
    getRoom(targetCoord){
        let stringKey = targetCoord.join(",");
        if(this.walkableRoomsMap.has(stringKey)) {
            return this.walkableRoomsMap.get(stringKey); 
        }
        return null;       
    }
    
}

module.exports = Board;