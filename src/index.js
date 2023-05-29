console.clear();
const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const token = process.env.BOT_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandHandler = require('./handlers/commandHandler');
commandHandler(client);

const eventHandler = require('./handlers/eventHandler');
eventHandler(client);

client.login(token);
