const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('multisell')
		.setDescription('Adds multiple skins to the market')
		.addStringOption((option) =>
			option
				.setName('skins')
				.setDescription('All the skins you want to add to the market')
				.setRequired(true),
		),

	async execute(interaction) {
		await interaction.deferReply();

		const input = interaction.options.getString('skins');
		let items = input.split(/\d+/g);
		items.pop();

		for (let i = 0; i < items.length; i++) {
			items[i] = items[i].replace(/[^a-zA-Z ]/g, '');

			try {
				const url = 'https://evepraisal.com/appraisal/structured.json';
				const data = {
					market_name: 'jita',
					items: [
						{
							name: items[i],
						},
					],
				};
				const headers = {
					'User-Agent': 'NOOKD-BOT',
					'Content-Type': 'application/json',
				};

				const response = await axios.post(url, data, { headers });
				let app = response.data.appraisal.items[0].name;

				const lastIndex = app.lastIndexOf(' ');
				app = app.substring(0, lastIndex).trim();

				let ship, skin;

				if (app.includes('Issue')) {
					[ship, skin] = app.split('Issue');
					ship += 'Issue';
				} else if (app.includes('Shuttle')) {
					[ship, skin] = app.split('Shuttle');
					ship += 'Shuttle';
				} else {
					const firstIndex = app.indexOf(' ');
					[ship, skin] = [app.slice(0, firstIndex), app.slice(firstIndex)];
				}

				await prisma.SKIN.create({
					data: {
						ship: ship,
						skin: skin,
						price: 0,
						seller: interaction.user.tag,
						sellerID: interaction.user.id,
					},
				});
			} catch (err) {
				console.error(err);
			}
		}

		interaction.editReply('Your skins have been added to the market.');
	},
};
