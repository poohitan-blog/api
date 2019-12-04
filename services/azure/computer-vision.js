const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');
const config = require('../../config').current;

const { endpoint: azureEndpoint, key: azureKey } = config.microsoft.azure.computerVision;

const azureCredentials = new ApiKeyCredentials({
  inHeader: {
    'Ocp-Apim-Subscription-Key': azureKey,
  },
});
const computerVisionClient = new ComputerVisionClient(azureCredentials, azureEndpoint);

function describeImage(imageUrl) {
  return computerVisionClient.describeImage(imageUrl);
}

module.exports = {
  describeImage,
};
