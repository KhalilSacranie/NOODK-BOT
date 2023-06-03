const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows all Commands'),

	async execute(interaction) {
		await interaction.deferReply();

		let commands = [];

		const foldersPath = path.join(__dirname, '../../commands');
		const commandFolders = fs.readdirSync(foldersPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs
				.readdirSync(commandsPath)
				.filter((file) => file.endsWith('.js'));
			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);
				const command = require(filePath);

				if ('data' in command) {
					commands.push(command.data);
				} else {
					console.log(
						`[WARNING] The command at ${filePath} is missing a required "data" property.`,
					);
				}
			}
		}

		commands.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});

		let chunks = [];
		for (let c = 0; c < commands.length; c += 10) {
			const chunk = commands.slice(c, c + 10);
			chunks.push(chunk);
		}

		const embeds = [];
		let page = 0;

		for (let i = 0; i < chunks.length; i++) {
			const embed = new EmbedBuilder()
				.setTitle("NOODK BOT's Commands")
				.setColor(await interaction.member.displayHexColor);

			for (let c = 0; c < chunks[i].length; c++) {
				let name = `/${chunks[i][c].name}`;

				if (chunks[i][c].options) {
					for (let o = 0; o < chunks[i][c].options.length; o++) {
						name += ` \`${chunks[i][c].options[o].name}\``;
					}
				}

				embed.addFields({
					name: name,
					value: chunks[i][c].description,
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
