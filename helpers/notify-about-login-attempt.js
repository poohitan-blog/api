const Telegram = require('../services/telegram');
const config = require('../config').current;

module.exports = async function notifyAboutLoginAttempt({ password, geolocation, successfull }) {
  if (config.environment === 'development') {
    return;
  }

  const {
    country,
    city,
    longitude,
    latitude,
  } = geolocation;

  const geolocationString = `Геодані:
${country || 'N/A'}, ${city || 'N/A'}, <a href="https://www.google.com/maps/place/${longitude}, ${latitude}">${longitude}, ${latitude}</a>`;

  if (successfull) {
    Telegram.sendMessage(`<b>Якийсь покидьок успішно зайшов в Нарнію</b>

${geolocationString}`);

    return;
  }

  const encodedPassword = password
    .split('')
    .map((char, index) => (index < 2 || index > password.length - 3 ? char : '*'))
    .join('');


  Telegram.sendMessage(`<b>Якийсь покидьок намагається підібрати пароль!</b>

Його спроба: <pre>${encodedPassword}</pre> (див. серверні логи)

${geolocationString}`);
};
