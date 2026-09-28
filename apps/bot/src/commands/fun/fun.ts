import {
  SlashCommandBuilder,
} from 'discord.js';
import { MisanCommand } from '@misan/types';
import { createBaseEmbed } from '@misan/utils';

export const EightBallCommand: MisanCommand = {
  name: '8ball',
  description: 'Ask the magical 8-ball a question and receive an oracle prophecy',
  category: 'Fun',
  userPermissions: [],
  botPermissions: [],
  cooldown: 2,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball')
    .addStringOption((opt) => opt.setName('question').setDescription('Your question').setRequired(true)) as SlashCommandBuilder,

  async execute({ interaction }) {
    const question = interaction.options.getString('question', true);
    const answers = [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes definitely.',
      'You may rely on it.',
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes.',
      'Signs point to yes.',
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      "Don't count on it.",
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.',
    ];

    const answer = answers[Math.floor(Math.random() * answers.length)];

    const embed = createBaseEmbed()
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: 'Question', value: question },
        { name: 'Answer', value: `*${answer}*` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export const CoinflipCommand: MisanCommand = {
  name: 'coinflip',
  description: 'Flip a coin for Heads or Tails',
  category: 'Fun',
  userPermissions: [],
  botPermissions: [],
  cooldown: 2,
  guildOnly: false,
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin') as SlashCommandBuilder,

  async execute({ interaction }) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const embed = createBaseEmbed()
      .setTitle('🪙 Coin Flip')
      .setDescription(`The coin landed on: **${result}**!`);
    await interaction.reply({ embeds: [embed] });
  },
};

export const ShipCommand: MisanCommand = {
  name: 'ship',
  description: 'Calculate romance and friendship compatibility between two users',
  category: 'Fun',
  userPermissions: [],
  botPermissions: [],
  cooldown: 3,
  guildOnly: true,
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship compatibility calculator')
    .addUserOption((opt) => opt.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption((opt) => opt.setName('user2').setDescription('Second user').setRequired(true)) as SlashCommandBuilder,

  async execute({ interaction }) {
    const user1 = interaction.options.getUser('user1', true);
    const user2 = interaction.options.getUser('user2', true);

    const percent = Math.floor(Math.random() * 101);
    let message = 'Soulmates destined across galaxies! ❤️';
    if (percent < 30) message = 'Oof, maybe just stay distant acquaintances... 💔';
    else if (percent < 70) message = 'Great friendship potential! 🤝';

    const embed = createBaseEmbed()
      .setTitle('💖 Love & Friendship Compatibility')
      .setDescription(
        `**${user1.username}** 💞 **${user2.username}**\n\n**Compatibility Rating:** \`${percent}%\`\n${message}`
      );

    await interaction.reply({ embeds: [embed] });
  },
};
