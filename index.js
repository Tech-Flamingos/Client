'use strict';
const readline = require ('readline');
const {io} = require ('socket.io-client');
const socket = io.connect ('http://localhost:3001/games');

console.log ('Welcome to the Adventure game!');

socket.emit ('JOIN', 'adventureGame');

socket.on ('AI-REPLY', payload => {
  console.log ('AI: ', payload.message);
});

//readline provides in-line editing and history capabilities for interactive programs with a command-line interface.

const rl = readline.createInterface ({
  input: process.stdin,
  output: process.stdout,
});

const main = async () => {
  let userWantsToExit = false;

  socket.emit('GET-MESSAGE',{queueId: 'adventureGame'});

  // we will keep looping until the game is going on and player hasn't typed "bye" which will end the game and end the readline.
  while (!userWantsToExit) {
    const message = await new Promise (resolve => {
      rl.question ('Enter a message (type "bye" to exit): ', answer => {
        resolve (answer);
      });
    });
    userWantsToExit = message === 'bye';

    if (!userWantsToExit) {
      socket.emit ('NEW-MESSAGE', {queueId: 'adventureGame', message: message});
    }
  }
  rl.close();
  socket.disconnect();
};

main();