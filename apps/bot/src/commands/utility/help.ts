import {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js';
import { MisanCommand, CommandCategory } from '@misan/types';
import { createBaseEmbed, createErrorEmbed } from '@misan/utils';

export const HelpCommand: MisanCommand = {
  name: 'help',
  description: 'Explore Yurei command catalog, documentation, and permissions',
  category: 'Utility',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Explore bot commands and documentation')
    .addStringOption((opt) =>
      opt.setName('command').setDescription('Search specific command name for details')
    ) as SlashCommandBuilder,

  async execute({ interaction, client }) {
    const search = interaction.options.getString('command');

    // Specific Command Lookup
    if (search) {
      const cmd = (client as any).commands.get(search.toLowerCase());
      if (!cmd) {
        await interaction.reply({
          embeds: [createErrorEmbed('Command Not Found', `No command named \`${search}\` was found.`)],
          ephemeral: true,
        });
        return;
      }

      const embed = createBaseEmbed()
        .setTitle(`📖 Command: /${cmd.name}`)
        .setDescription(cmd.description)
        .addFields(
          { name: 'Category', value: `\`${cmd.category}\``, inline: true },
          { name: 'Plan Tier', value: cmd.premiumOnly ? '⭐ **PREMIUM**' : '🆓 **FREE**', inline: true },
          { name: 'Cooldown', value: `\`${cmd.cooldown || 3}s\``, inline: true },
          {
            name: 'Required Permissions',
            value:
              cmd.userPermissions && cmd.userPermissions.length > 0
                ? cmd.userPermissions.join(', ')
                : 'None (Everyone)',
            inline: false,
          }
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Main Interactive Category Directory
    const categories: CommandCategory[] = [
      'Security',
      'Moderation',
      'AutoMod',
      'Logging',
      'Tickets',
      'Giveaways',
      'Welcomer',
      'Roles',
      'Voice',
      'AutoResponder',
      'Embeds',
      'Server',
      'User',
      'Utility',
      'Music',
      'Fun',
      'Premium',
    ];

    const totalCmds = (client as any).commands.size;

    const mainEmbed = createBaseEmbed()
      .setTitle('🌟 Yurei Command Platform')
      .setDescription(
        `Welcome to **Yurei** (developed by **Misan**) — the next-generation multipurpose Discord bot with over **600+ commands**.\nSupport Server: https://discord.gg/M4P4Qrt6G5\nSelect a module category from the menu below to browse available commands.`
      )
      .addFields(
        { name: 'Total Commands', value: `\`${totalCmds} registered\``, inline: true },
        { name: 'Architecture', value: 'TypeScript • Prisma • Redis', inline: true },
        { name: 'Security Engine', value: 'Antinuke & Anti-Raid Active', inline: true }
      );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Select a command category...')
      .addOptions(
        categories.map((cat) => ({
          label: cat,
          value: cat,
          description: `View all commands under ${cat}`,
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const response = await interaction.reply({
      embeds: [mainEmbed],
      components: [row],
      fetchReply: true,
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: 'Only the command invoker can use this selector.', ephemeral: true });
        return;
      }

      const selectedCat = i.values[0];
      const categoryCmds = Array.from((client as any).commands.values()).filter(
        (c: any) => c.category === selectedCat
      );

      const catEmbed = createBaseEmbed()
        .setTitle(`📁 ${selectedCat} Commands (${categoryCmds.length})`)
        .setDescription(
          categoryCmds
            .map(
              (c: any) =>
                `• **/${c.name}** — ${c.description} ${c.premiumOnly ? '`[PREMIUM]`' : ''}`
            )
            .join('\n') || 'No commands in this category yet.'
        );

      await i.update({ embeds: [catEmbed] });
    });
  },
};
