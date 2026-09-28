import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { BOT_CONFIG } from '@misan/config';

export function createPremiumActionRow(): ActionRowBuilder<ButtonBuilder> {
  const viewPremiumBtn = new ButtonBuilder()
    .setLabel('View Premium')
    .setStyle(ButtonStyle.Link)
    .setURL(`${BOT_CONFIG.dashboardUrl}/premium`);

  const redeemCodeBtn = new ButtonBuilder()
    .setCustomId('misan_btn_redeem_code')
    .setLabel('Enter Premium Code')
    .setStyle(ButtonStyle.Success)
    .setEmoji('🎟️');

  const contactOwnerBtn = new ButtonBuilder()
    .setLabel('Support Server')
    .setStyle(ButtonStyle.Link)
    .setURL(BOT_CONFIG.supportInviteUrl);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    viewPremiumBtn,
    redeemCodeBtn,
    contactOwnerBtn
  );
}

export function createPaginationRow(
  currentPage: number,
  totalPages: number,
  customPrefix: string
): ActionRowBuilder<ButtonBuilder> {
  const prevBtn = new ButtonBuilder()
    .setCustomId(`${customPrefix}_prev`)
    .setLabel('◀ Previous')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(currentPage <= 1);

  const pageIndicator = new ButtonBuilder()
    .setCustomId(`${customPrefix}_page`)
    .setLabel(`${currentPage} / ${totalPages}`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const nextBtn = new ButtonBuilder()
    .setCustomId(`${customPrefix}_next`)
    .setLabel('Next ▶')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(currentPage >= totalPages);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, pageIndicator, nextBtn);
}
