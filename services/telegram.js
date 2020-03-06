const Telegram = require('telegraf/telegram');
const { current } = require('../config');

const { botToken, chatId } = current.telegram;

const telegram = new Telegram(botToken);

function sendMessage(html) {
  return telegram.sendMessage(chatId, html, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

module.exports = {
  sendMessage,
};
