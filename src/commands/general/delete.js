const { PrismaClient } = require('@prisma/client');
const { SlashCommandBuilder } = require('discord.js');

const prisma = new PrismaClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Delete a SKIN listing')
		.addStringOption((option) =>
			option.setName('id').setDescription('ID of the SKIN').setRequired(true),
		),

	async execute(interaction) {
		await interaction.deferReply();

		const id = interaction.options.getString('id');
		const seller = interaction.user.id;

		const skin = await prisma.SKIN.findUnique({
			where: {
				id: id,
			},
		});

		if (seller === skin.sellerID) {
			try {
				await prisma.SKIN.delete({
					where: {
						id: id,
					},
				});

				interaction.editReply({
					content: 'Your Skin has been deleted from the market',
					ephemeral: false,
				});
			} catch (err) {
				console.error(err);
				interaction.editReply({
					content: 'Something went wrong.',
					ephemeral: false,
				});
			}
		} else {
			interaction.editReply({
				content: 'You can not delete someone elses listings',
				ephemeral: false,
			});
		}
	},
};
