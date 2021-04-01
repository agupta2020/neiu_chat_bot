exports.elicitSlot = (
  sessionAttributes,
  intentName,
  slots,
  slotToElicit,
  message,
) => {
  console.info('Got to Elicit Slot Function');
  console.info(
    `elicitSlot SessionAttributes: ${JSON.stringify(sessionAttributes)}`,
  );
  console.info(`elicitSlot IntentName: ${JSON.stringify(intentName)}`);
  console.info(`elicitSlot Slots: ${JSON.stringify(slots)}`);
  console.info(`elicitSlot Slot to Elicit: ${JSON.stringify(slotToElicit)}`);
  console.info(`elicitSlot Message: ${JSON.stringify(message)}`);

  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message,
    },
  };
};

exports.elicitIntent = (sessionAttributes, message) => ({
  sessionAttributes,
  dialogAction: {
    type: 'ElicitIntent',
    message,
  },
});

exports.close = (sessionAttributes, fulfillmentState, message) => {
  console.info('Got to Close Function');
  console.info(`session attributes: ${JSON.stringify(sessionAttributes)}`);
  console.info(`close Message: ${JSON.stringify(message)}`);
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message,
    },
  };
};

// build a message for Lex responses
exports.buildMessage = (messageContent) => ({
  contentType: 'PlainText',
  content: messageContent,
});
