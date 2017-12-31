const globalTransliteration = require('transliteration');
const ukrainianTransliteration = require('transliteration.ua').ua;

module.exports = (text) => {
  const textWithUkrainianLettersTransliterated = ukrainianTransliteration.transliterate(text);
  const slugifiedText = globalTransliteration.slugify(textWithUkrainianLettersTransliterated);

  return slugifiedText;
};
