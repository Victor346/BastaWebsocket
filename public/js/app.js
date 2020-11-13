function makeToast() {
  $.toast({
    text: 'This is called a toast!',
    position: 'top-right'
  });
}

function makeToastMessage(message) {
  $.toast({
    text: message,
    position: 'top-right'
  });
}

let id = null;

window.socket = null;
function connectToSocketIo() {
  let server = window.location.protocol + "//" + window.location.host;
  window.socket = io.connect(server);
  // Recibe un mensaje de tipo toast
  window.socket.on('toast', function (data) {
    // Muestra el mensaje
    makeToastMessage(data.message);
  });

  window.socket.on('welcomeMessage', function (data) {
    makeToastMessage("Bienvenido al juego");
    id = data.id;
    
    $('#numeroJugador').html(id);
  });

  window.socket.on('gameStarts', function(data){
    $('#letraActual').html(data.char);
    console.log(data);
  });
}

function SendResults() {
  let message = {
    nombre: $('#nombreWord').val(),
    color: $('#colorWord').val(),
    fruto: $('#frutoWord').val(),
    id: id,
  }

  // Envía un mensaje
  window.socket.emit('pressBasta', message);
}

$(function () {
  connectToSocketIo();
});
