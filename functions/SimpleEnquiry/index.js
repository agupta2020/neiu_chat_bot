// Load the AWS SDK for JS
const AWS = require("aws-sdk");

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: "us-east-1" });
const lambda = new AWS.Lambda({ region: process.env.REGION });
// Set a table name that we can use later on
const tableName = process.env.TableName;
// Just a comment for DB-2
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();
const lexUtil = require("./lex_utils");
const getSentences = require("./getSentences");
/* const closingStatment =
  "Ok, glad I could help. Let me know if you need anything else." + "<p>"; */
const closingMessage =
  "<p>Would you also like to choose from the following options? <br><br>";
const ItemNotFoundMessage =
  "Sorry, but the requested information is not available. I would encourage you to access FAQ website: : <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/academics/registrar-services/faqs'> faqs<a/> ";

// Get a single item with the getItem operation and Document Client
// Use contains to get the other field information.
async function logSingleItemDdbDc(partitionKey, enquiryType, searchKey) {
  try {
    const params = {
      Key: {
        ItemId: partitionKey,
        ItemType: enquiryType,
      },
      TableName: tableName,
    };
    const result = await ddbDocumentClient.get(params).promise();
    console.log(`result1 => ${JSON.stringify(result)}`);
    const itemData = JSON.parse(result.Item.payload);

    return itemData[searchKey];
  } catch (error) {
    console.error(error);
    return ItemNotFoundMessage;
  }
}

exports.handler = async (event) => {
  try {
    const partitionKey = "tuitionfee";
    const enquiryType = "ge";
    const searchKey = event.currentIntent.slots.SimpleEnquiryType.replace(
      /\s+/g,
      ""
    ).toLowerCase();
    const inputTranscript = event.inputTranscript.toLowerCase();
    const doc2VecParams = {
      FunctionName: process.env.Doc2VecFunction, // the lambda function we are going to invoke
      Payload: JSON.stringify({ inputTranscript }), // This param name can't change
    };
    const doc2VecResponse = await lambda.invoke(doc2VecParams).promise();

    const result = await logSingleItemDdbDc(
      partitionKey,
      enquiryType,
      searchKey
    );
    const finalCloseMessage = `${
      result + closingMessage
    }${getSentences.getSuggestedSentences(doc2VecResponse)}`;
    // const finalCloseMessage = result + closingMessage;
    // lexUtil.buildMessage(JSON.stringify(finalCloseMessage))
    return lexUtil.close(
      {},
      "Fulfilled",
      lexUtil.buildMessage(finalCloseMessage)
    );
  } catch (error) {
    console.error(error);
    return lexUtil.close(
      {},
      "Fulfilled",
      lexUtil.buildMessage(ItemNotFoundMessage + closingMessage)
    );
  }
};
