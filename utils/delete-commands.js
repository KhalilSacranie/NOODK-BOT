const { REST, Routes } = require('discord.js');

require('dotenv').config();
const token = process.env.BOT_TOKEN;
const clientId = process.env.clientId;
const serverId = process.env.serverId;

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

rest
	.put(Routes.applicationGuildCommands(clientId, serverId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);
