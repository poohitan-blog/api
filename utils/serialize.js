function serialize(data) {
  const dataToSerialize = data || this.toObject();

  return Object.keys(dataToSerialize)
    .filter((fieldName) => fieldName.slice(0, 1) !== '_')
    .reduce((result, fieldName) => {
      const fieldValue = dataToSerialize[fieldName];

      const isReference = fieldValue && fieldValue._id;
      const isArrayOfReferences = Array.isArray(fieldValue) && fieldValue.some((item) => item._id);

      let serializedValue;

      if (isReference) {
        serializedValue = serialize(fieldValue);
      } else if (isArrayOfReferences) {
        serializedValue = fieldValue.map((item) => serialize(item));
      } else {
        serializedValue = fieldValue;
      }

      return {
        ...result,
        [fieldName]: serializedValue,
      };
    }, { id: dataToSerialize._id });
}

module.exports = serialize;
