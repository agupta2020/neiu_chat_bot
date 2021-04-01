// Load the AWS SDK for JS
const AWS = require('aws-sdk');

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda({ region: process.env.REGION });
// Set a table name that we can use later on
const tableName = process.env.TableName;
// DynamoDBClient
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();

const lexUtil = require('./lex_utils');
const getSentences = require('./getSentences');

const closingMessage = '<p>Would you like to choose from the following options? <br>';
const ItemNotFoundMessage = "Sorry, but the requested information is not available. I would encourage you to access FAQ website: <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/academics/registrar-services/faqs'> faqs<a/> ";
const Facility = 'facility';
const Courses = 'courses';
const Dorms = 'studenthousing';
const NeiuPrograms = 'neiuprograms';

const FacilityEnquiry = 'facilityenquiry';
const ProgramEnquiry = 'prgenquiry';

const SubReposeSlot = 'subReponseSlot';

let outputSessionAttributes;
// List all the searchKey
const partitionKey = 'standardenquiry';
let sortKey;

async function fetchSingleItemDdbDc(searchKey) {
  try {
    const params = {
      Key: {
        ItemId: partitionKey,
        ItemType: sortKey,
      },
      TableName: tableName,
    };
    const result = await ddbDocumentClient.get(params).promise();
    const itemData = JSON.parse(result.Item.payload);

    return itemData[searchKey];
  } catch (error) {
    console.error(error);
    return ItemNotFoundMessage;
  }
}
/** ********** Facility ******** */
async function handleFacilityRequest(intent, inputTranscriptLowercase) {
  const message = 'I  would be happy to help you with the facilities around the campus.  Please select how would you like to continue. <p>Sports<br>Workshops<br>Cafeteria<br>Campus<br>Labs';
  outputSessionAttributes.scenario = FacilityEnquiry;
  outputSessionAttributes.userTranscript = inputTranscriptLowercase;
  return lexUtil.elicitSlot(
    outputSessionAttributes,
    intent.name,
    intent.slots,
    SubReposeSlot,
    lexUtil.buildMessage(message),
  );
}
async function handleFacilityEnquiryRequest(
  enquiryType,
  NextInputTranscriptLowercase,
  event,
) {
  const result = await fetchSingleItemDdbDc(
    enquiryType,
    // this is searchKey for DynamoDB payload
  );
  outputSessionAttributes.userTranscript = outputSessionAttributes.userTranscript.concat(
    ' ',
    NextInputTranscriptLowercase,
  );
  const inputTranscript = outputSessionAttributes.userTranscript;
  const doc2VecParams = {
    FunctionName: process.env.Doc2VecFunction, // the lambda function we are going to invoke
    Payload: JSON.stringify({ inputTranscript }),
  };
  const doc2VecResponse = await lambda.invoke(doc2VecParams).promise();
  const message = `${result
    + closingMessage}--${getSentences.getSuggestedSentences(doc2VecResponse)}`;
  delete event.sessionAttributes.userTranscript;
  return lexUtil.close(
    outputSessionAttributes,
    'Fulfilled',
    lexUtil.buildMessage(message),
  );
}

/** ********** NEIU Program ******** */
async function handleProgramRequest(intent, inputTranscriptLowercase) {
  const message = "Northeastern offers over 70 undergraduate and graduate degree programs, plus a wide range of certificate programs to choose from. Please select Academic Department from below list <br>Computer-Science<br>Earth-Science<br>Chemistry<br>Biology<br> Of just type 'Full Directory'";
  outputSessionAttributes.scenario = ProgramEnquiry;
  outputSessionAttributes.userTranscript = inputTranscriptLowercase;
  return lexUtil.elicitSlot(
    outputSessionAttributes,
    intent.name,
    intent.slots,
    SubReposeSlot,
    lexUtil.buildMessage(message),
  );
}

async function handleProgramEnquiryRequest(
  enquiryType,
  NextInputTranscriptLowercase,
  event,
) {
  outputSessionAttributes.userTranscript = outputSessionAttributes.userTranscript.concat(
    ' ',
    NextInputTranscriptLowercase,
  );
  const inputTranscript = outputSessionAttributes.userTranscript;
  const doc2VecParams = {
    FunctionName: process.env.Doc2VecFunction, // the lambda function we are going to invoke
    Payload: JSON.stringify({ inputTranscript }),
  };
  const doc2VecResponse = await lambda.invoke(doc2VecParams).promise();

  const result = await fetchSingleItemDdbDc(
    enquiryType, // this is searchKey for DynamoDB payload
  );
  // const message = result + closingMessage;
  const message = `${result
    + closingMessage}--${getSentences.getSuggestedSentences(doc2VecResponse)}`;
  delete event.sessionAttributes.userTranscript;
  return lexUtil.close(
    outputSessionAttributes,
    'Fulfilled',
    lexUtil.buildMessage(message),
  );
}

/** ********** Courses ******** */
async function handleCoursesRequest(inputTranscriptLowercase) {
  sortKey = 'courses';
  const result = await fetchSingleItemDdbDc('allcourse');
  const inputTranscript = inputTranscriptLowercase;
  const doc2VecParams = {
    FunctionName: process.env.Doc2VecFunction, // the lambda function we are going to invoke
    Payload: JSON.stringify({ inputTranscript }), // This param name can't change
  };
  const doc2VecResponse = await lambda.invoke(doc2VecParams).promise();

  // const message = result + closingMessage;
  const message = `${result
    + closingMessage}--${getSentences.getSuggestedSentences(doc2VecResponse)}`;
  return lexUtil.close(
    outputSessionAttributes,
    'Fulfilled',
    lexUtil.buildMessage(message),
  );
}

/** ********** Student Housing ******** */
async function handleDormsRequest(inputTranscriptLowercase) {
  sortKey = 'studenthousing';
  const result = await fetchSingleItemDdbDc('allinfo');
  const inputTranscript = inputTranscriptLowercase;
  const doc2VecParams = {
    FunctionName: process.env.Doc2VecFunction, // the lambda function we are going to invoke
    Payload: JSON.stringify({ inputTranscript }), // This param name can't change
  };
  const doc2VecResponse = await lambda.invoke(doc2VecParams).promise();

  // const message = result + closingMessage;
  const message = `${result
    + closingMessage}--${getSentences.getSuggestedSentences(doc2VecResponse)}`;
  return lexUtil.close(
    outputSessionAttributes,
    'Fulfilled',
    lexUtil.buildMessage(message),
  );
}

exports.handler = async (event) => {
  try {
    const eventJson = JSON.stringify(event);
    console.info(`event--->${eventJson}`);
    const { currentIntent } = event;
    const inputTranscriptLowercase = event.inputTranscript.toLowerCase();
    outputSessionAttributes = event.sessionAttributes;
    const firstSelection = event.currentIntent.slots.FirstSelectionSlot.replace(
      /\s+/g,
      '',
    ).toLowerCase();
    if (!outputSessionAttributes.scenario) {
      switch (firstSelection) {
        case Facility:
          return handleFacilityRequest(currentIntent, inputTranscriptLowercase);
        case Courses:
          return handleCoursesRequest(inputTranscriptLowercase);
        case Dorms:
          return handleDormsRequest(inputTranscriptLowercase);
        case NeiuPrograms:
          return handleProgramRequest(currentIntent, inputTranscriptLowercase);
        default:
          return handleFacilityRequest(currentIntent);
      }
    } else {
      const subResponseText = event.currentIntent.slots.subReponseSlot
        .replace(/\s+/g, '')
        .toLowerCase();
      const NextInputTranscriptLowercase = event.inputTranscript.toLowerCase();
      switch (outputSessionAttributes.scenario) {
        case FacilityEnquiry:
          sortKey = Facility;
          delete event.sessionAttributes.scenario;
          return handleFacilityEnquiryRequest(
            subResponseText,
            NextInputTranscriptLowercase,
            event,
          );
        case ProgramEnquiry:
          sortKey = NeiuPrograms;
          delete event.sessionAttributes.scenario;
          return handleProgramEnquiryRequest(
            subResponseText,
            NextInputTranscriptLowercase,
            event,
          );

        default:
          sortKey = Facility;
          delete event.sessionAttributes.scenario;
          return handleFacilityEnquiryRequest(
            subResponseText,
            NextInputTranscriptLowercase,
            event,
          );
      }
    }
  } catch (error) {
    console.error(error);
    return lexUtil.close(
      {},
      'Fulfilled',
      lexUtil.buildMessage(ItemNotFoundMessage),
    );
  }
};
