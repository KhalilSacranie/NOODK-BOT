const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} = require('discord.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches through avaliable skins')
		.addStringOption((option) =>
			option
				.setName('ship')
				.setDescription('What ship would you like to search skins for?')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const ship = interaction.options.getString('ship').toLowerCase();

		const skins = await prisma.SKIN.findMany();

		const shipskins = [];
		for (let i = 0; i < skins.length; i++) {
			if (skins[i].ship.toLowerCase() === ship.toLowerCase())
				shipskins.push(skins[i]);
		}

		if (shipskins.length === 0) {
			interaction.editReply(`No ${ship} SKINS were found.`);
			return;
		}

		let chunks = [];
		for (let s = 0; s < shipskins.length; s += 10) {
			const chunk = shipskins.slice(s, s + 10);
			chunks.push(chunk);
		}

		const embeds = [];
		let page = 0;

		for (let i = 0; i < chunks.length; i++) {
			const embed = new EmbedBuilder()
				.setTitle(`Page ${i + 1}`)
				.setColor(await interaction.member.displayHexColor);

			for (let c = 0; c < chunks[i].length; c++) {
				embed.addFields({
					name: `SKIN: ${chunks[i][c].skin}`,
					value: `BY: ${chunks[i][c].seller}`,
				});
			}

			embeds.push(embed);
		}

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('Back')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === 0),
			)
			.addComponents(
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === embeds.length - 1),
			);

		let response = await interaction.editReply({
			embeds: [embeds[page]],
			components: [row],
		});

		const filter = (i) => i.user.id === interaction.user.id;
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: filter,
			time: 60000,
		});

		collector.on('collect', async (i) => {
			await i.deferUpdate();

			const selection = i.customId;
			if (selection === 'back' && page != 0) page--;
			if (selection === 'next' && page != embeds.length - 1) page++;

			response = await interaction.editReply({
				embeds: [embeds[page]],
				components: [row],
			});
		});
	},
};
