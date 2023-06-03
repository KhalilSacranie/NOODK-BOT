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

		const skins = interaction.options.getString('skins');
		let skinsArr = skins.split(/\t+[0-1]/);
		skinsArr.pop();

		for (let i = 0; i < skinsArr.length; i++) {
			try {
				const url = 'https://evepraisal.com/appraisal/structured.json';
				const data = {
					market_name: 'jita',
					items: [{ name: skinsArr[i] }],
				};
				const headers = {
					'User-Agent': 'NOOKD-BOT',
					'Content-Type': 'application/json',
				};

				const response = await axios.post(url, data, { headers });
				const responseData = response.data.appraisal.items[0].name.trimStart();

				await prisma.SKIN.create({
					data: {
						ship: responseData.split(' ')[0],
						skin: responseData.split(' ')[1],
						price: 0,
						seller: interaction.user.tag,
						sellerID: interaction.user.id,
					},
				});

				await interaction.editReply('All skins have been added to the market');
			} catch (err) {
				console.error(err);
			}
		}
	},
};
