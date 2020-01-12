const client = require('discord-rich-presence')('653932521184296960');
 
client.updatePresence({
  state: 'Triple BTEC (Computing)',
  details: '308 With Monika',
  startTimestamp: Date.now(),
  endTimestamp: Date.now() + 1337,
  largeImageKey: 'coding',
  smallImageKey: 'logo',
  instance: true,
});