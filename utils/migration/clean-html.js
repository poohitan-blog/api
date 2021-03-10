module.exports = (html) => html
  .replace(/<br><br>/g, '</p><p>')
  .replace(/<br>/g, '')
  .replace(/\\'/g, '\'')
  .replace(/\s+/g, ' ')
  .replace(/ title=""/g, '')
  .replace(/ target=""/g, '')
  .replace(/<span id="cut"><img id="scissors" src="templates\/cut\.png" border="0"><\/span>/g, '');
