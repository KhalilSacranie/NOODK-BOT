const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Add a skin to the market')
		.addStringOption((option) =>
			option
				.setName('ship')
				.setDescription('The Name of the ship')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('skin')
				.setDescription('The Type of SKIN')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName('price').setDescription('How Much you would like for it'),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const ship = interaction.options.getString('ship');
		const skin = interaction.options.getString('skin');
		const price = interaction.options.getString('price') || 0;
		const seller = interaction.user.tag;
		const sellerID = interaction.user.id;

		let evepraisalSkin = '';

		try {
			const url = 'https://evepraisal.com/appraisal/structured.json';
			const data = {
				market_name: 'jita',
				items: [{ name: `${ship} ${skin} SKIN` }],
			};
			const headers = {
				'User-Agent': 'NOOKD-BOT',
				'Content-Type': 'application/json',
			};

			const response = await axios.post(url, data, { headers });
			evepraisalSkin = response.data.appraisal.items[0].typeName;

			if (evepraisalSkin === '') {
				interaction.editReply(
					`The Ship ${ship} or the SKIN ${skin} does not exits.`,
				);
				return;
			}
		} catch (err) {
			interaction.editReply(
				`The Ship ${ship} or the SKIN ${skin} does not exist`,
			);
		}

		const shipType = evepraisalSkin.split(' ')[0];
		const skinType = evepraisalSkin.split(' ')[1];

		try {
			await prisma.SKIN.create({
				data: {
					ship: shipType,
					skin: skinType,
					price: parseInt(price),
					seller: seller,
					sellerID: sellerID,
				},
			});

			interaction.editReply({
				content: `Your ${ship} ${skin} has been added to the market`,
				ephemeral: false,
			});
		} catch (err) {
			console.error(err);
			interaction.editReply({
				content: 'Something went wrong.',
				ephemeral: false,
			});
		}
	},
};
