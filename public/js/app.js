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

window.socket = null;
function connectToSocketIo() {
  let server = window.location.protocol + "//" + window.location.host;
  window.socket = io.connect(server);
  // Recibe un mensaje de tipo toast
  window.socket.on('toast', function (data) {
    // Muestra el mensaje
    makeToastMessage(data.message);
  });
}

function emitEventToSocketIo() {
  let text = $('#messageToServer').val();
  // Envía un mensaje
  window.socket.emit('messageToServer', { text: text });
}

$(function () {
  connectToSocketIo();
});
