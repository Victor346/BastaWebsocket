// Imports
const express = require('express');
const webRoutes = require('./routes/web');

// Session imports
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('express-flash');
let passport = require('passport');

// Express app creation
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
  extname: extNameHbs,
  helpers: multihelpers
});
app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Session configurations
let sessionStore = new session.MemoryStore;
app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: appConfig.secret
}));
app.use(flash());

// Passport configurations
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }));

// Route for static files
app.use('/', express.static(__dirname + '/public'));

// Routes
app.use('/', webRoutes);

let users = new Set();
let usersState = [];
let isGamePlaying = false;
let areEnoughUsers = false;
let isBastaPressed = false;
let results = [];

io.on('connection', (socket) => {
  // Recibe la conexión del cliente
  console.log('Client connected...');
  let randomNumber = Math.floor(Math.random()*1000);
  while (users.has(randomNumber)) {
    randomNumber = Math.floor(Math.random()*1000);
  }

  users.add(randomNumber);
  usersState.push({
    socket: socket,
    id: randomNumber,
    score: 0,
    currentlyPlaying: false
  });

  console.log(users);
  
  socket.emit('welcomeMessage', {id: randomNumber});
  socket.broadcast.emit('toast', { message: `Player ${randomNumber} connected` });


  if (users.size >=  2 && !areEnoughUsers && !isGamePlaying) {
    isGamePlaying = true;
    areEnoughUsers = true;

    let randomLetter = String.fromCharCode(Math.random() * (91 - 65) + 65);
    usersState.forEach((element => element.currentlyPlaying = true));
    
    socket.broadcast.emit('toast', { message: "Round is starting" })
    socket.emit('toast', { message: "Round is starting" })

    socket.broadcast.emit("gameStarts", {char: randomLetter});
    socket.emit("gameStarts", {char: randomLetter})
  } else if (users.size >= 2 && isGamePlaying) {
    socket.emit('toast', { message: "Wait until next round starts" })
  }  else if (users.size < 2) {
    socket.emit('toast', { message: "Not enough players, wait for new players" })
  }

 
  socket.on('disconnect', function(){
    users.delete(randomNumber);
    usersState = usersState.filter(element => element.id != randomNumber);
    if( users.size < 2) {
      areEnoughUsers = false;
      
      if (isGamePlaying) {
        isGamePlaying = false;
        socket.broadcast.emit('toast', { message: "Round cancelled because player disconnected" });
      } else {
        socket.broadcast.emit('toast', { message: "Other players disconnected wait for new players to start playing" });
      }

      
    }
  });

  socket.on('pressBasta', (data) => {
    if(!isGamePlaying) { 
      socket.emit('toast', "You are not currently playing wait for next round to start")
      return;
     }
    if (!usersState.filter((user) => user.id === data.id)[0].currentlyPlaying) {
      socket.emit('toast', "You are not currently playing wait for next round to start")
      return;
    }
    if(!isBastaPressed) { 
      isBastaPressed = true;
      socket.broadcast.emit('toast', {message: "The round will finish in 10 seconds"});
      socket.emit('toast', {message: "The round will finish in 10 seconds"});

      setTimeout(() => {
        socket.broadcast.emit('toast', {message: "Round finished!!!!!!!!"});
        socket.emit('toast', {message: "Round finished!!!!!!!!"});

        results.forEach((result) => {
          let categories = ['nombre', 'color', 'fruto'];
          //TODO
          let nombreScore = 10;
          let colorScore = 10;
          let frutoScore = 10;

          if(results.filter((element) => { element.nombre === result.nombre }).length > 1) { nombreScore = 5; }
          if(results.filter((element) => { element.color === result.color }).length > 1) { colorScore = 5; }
          if(results.filter((element) => { element.fruto === result.fruto }).length > 1) { frutoScore = 5; }
          
          let score = nombreScore + colorScore + frutoScore;

   

          let user = usersState.filter((user) => user.id === result.id)[0];

          user.socket.emit('toast', {message: `Your score this round was: ${score}`});
          user.score = user.score + score;
        });

        results = [];
        isGamePlaying = false;

        let maxUser = null;
        let maxScore = 0;
        usersState.forEach(element => {
          if(element.score > maxScore) {
            maxScore = element.score;
            maxUser = element
          }
        })
        socket.broadcast.emit('toast', { message: `The winner of the Round was player ${maxUser.id}`});
        socket.emit('toast', { message: `The winner of the Round was player ${maxUser.id}`});
        usersState.forEach((element => element.currentlyPlaying = false));
        usersState.forEach((element => element.score = 0));

        socket.broadcast.emit('toast', {message: "The next round will start in 3 seconds"});
        //socket.emit('toast', "The next round will start in 3 seconds");
        setTimeout(() => {
            if(areEnoughUsers) {
              isGamePlaying = true;

              let randomLetter = String.fromCharCode(Math.random() * (91 - 65) + 65);
              usersState.forEach((element => element.currentlyPlaying = true));
    
              socket.broadcast.emit('toast', { message: "Round is starting" });
              socket.emit('toast', { message: "Round is starting" });

              socket.broadcast.emit("gameStarts", {char: randomLetter});
              socket.emit("gameStarts", {char: randomLetter})
            } else {
              socket.broadcast.emit('toast', { message: "There were not enough players to start the round waiting for new players..." });
              socket.emit('toast', { message: "There were not enough players to start the round waiting for new players..." });
            }
        }, 3000);

      }, 10000)
    }

    results.push({
      id: data.id,
      nombre: data.nombre,
      color: data.color,
      fruto: data.fruto,
    });

    usersState.filter((user) => user.id === data.id)[0].currentlyPlaying = false;
    
  });
});

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});
