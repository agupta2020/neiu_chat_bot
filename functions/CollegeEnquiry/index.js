// Load the AWS SDK for JS
const AWS = require("aws-sdk");
// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: "us-east-1" });
const lambda = new AWS.Lambda({ region: process.env.REGION });
//   Set a table name that we can use later on
const tableName = process.env.TableName;
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();
const lexUtil = require("./lex_utils");
const getSentences = require("./getSentences");

const closingMessage =
  "<p>Would you like to choose from the following options? <br>";

const ItemNotFoundMessage =
  "Sorry,but the requested information is not available. I would encourage you to access FAQ website: : <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/academics/registrar-services/faqs'> faqs<a/> ";

async function logSingleItemDdbDc(deparmentName, enquiryType, searchKey) {
  try {
    const params = {
      Key: {
        ItemId: deparmentName,
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
  // const eventJson = JSON.stringify(event);
  const deparmentName = event.currentIntent.slots.Department.replace(
    /\s+/g,
    ""
  ).toLowerCase();
  const enquiryType = event.currentIntent.slots.GeneralEnquiry.replace(
    /\s+/g,
    ""
  ).toLowerCase();
  const searchKey = enquiryType.split(":")[1];
  const inputTranscript = `${event.currentIntent.slots.Department} ${searchKey}`;

  const doc2VecParams = {
    FunctionName: process.env.Doc2VecFunction, // the lambda function we are going to invoke
    Payload: JSON.stringify({ inputTranscript }),
  };

  try {
    const regExp = /\{([^)]+)\}/;
    const matches = regExp.exec(enquiryType);
    const enquiryType1 = matches[1];
    const result = await logSingleItemDdbDc(
      deparmentName,
      enquiryType1,
      searchKey
    );
    console.log(`result---> ${result}`);
    const doc2VecResponse = await lambda.invoke(doc2VecParams).promise();
    const finalCloseMessage = `${
      result + closingMessage
    }--${getSentences.getSuggestedSentences(doc2VecResponse)}`;

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
      lexUtil.buildMessage(
        `${
          ItemNotFoundMessage + closingMessage
        }--${getSentences.getSuggestedSentences(
          await lambda.invoke(doc2VecParams).promise()
        )}`
      )
    );
  }
};
