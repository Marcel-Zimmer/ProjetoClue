
export function getSocket () {
  const { io } = require("socket.io-client");
  var socket = io("http://0.0.0.0:5100");
  // var socket = socket;
  socket.on("connect", () => {
      console.log(socket.id);
    });

  return socket
}

export function isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);
  
    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
}

