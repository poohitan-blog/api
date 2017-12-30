module.exports = function serialize() {
  const dataToSerialize = this.toObject();

  return Object.keys(dataToSerialize)
    .filter(fieldName => fieldName.slice(0, 1) !== '_')
    .reduce((result, fieldName) =>
      Object.assign({}, result, {
        [fieldName]: dataToSerialize[fieldName],
      }), { id: dataToSerialize._id });
};
