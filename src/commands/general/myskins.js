const { PrismaClient } = require('@prisma/client');
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} = require('discord.js');

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('myskins')
		.setDescription('Shows all your skins on the market'),

	async execute(interaction) {
		await interaction.deferReply();

		let skins = await prisma.SKIN.findMany({
			where: {
				sellerID: interaction.user.id,
			},
		});

		if (skins.length === 0) {
			await interaction.editReply('You currently have no skins on the market');
			return;
		}

		let chunks = [];
		for (let s = 0; s < skins.length; s += 10) {
			const chunk = skins.slice(s, s + 10);
			chunks.push(chunk);
		}

		const embeds = [];
		let page = 0;

		for (let i = 0; i < chunks.length; i++) {
			const embed = new EmbedBuilder()
				.setTitle(`Page ${i + 1}`)
				.setColor(await interaction.member.displayHexColor)
				.setThumbnail(interaction.member.displayAvatarURL());

			for (let c = 0; c < chunks[i].length; c++) {
				embed.addFields({
					name: chunks[i][c].ship,
					value: `${chunks[i][c].skin}\t||\tID: ${chunks[i][c].id}`,
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
