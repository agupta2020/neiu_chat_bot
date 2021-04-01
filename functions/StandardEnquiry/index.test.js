const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');

const { handler } = require('./index');

const mockSuccessfulDynamoDbQuery = () => {
  AWSMock.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
    const jsonResponse = {
      Items: [
        {
          sports:
            "On our campus, we have a some facilities for Sports and Fitness enthusiastic. Please choose the facilities you would like to know more <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/university-life/campus-recreation/sports-clubs'> Gymnasium<a/> <br> <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/university-life/campus-recreation/sports-clubs'> Olympic Pool<a/> <br> <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/university-life/campus-recreation/sports-clubs'> Running Track<a/>",
          workshops:
            "On our campus, we have a few facilities that run workshops. Please access the link to learn more <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/academics/our-centers-and-programs/mcnair-scholars/services/workshops'> Workshops<a/>",
          cafeteria:
            "The cafeteria is located in the Student Union building. Please access the link to learn more  <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/university-life/student-union'> Student Union<a/>",
          studentunion:
            "Student Union, Event and Conference Services (SUECS) provides spaces and services for the diverse community of students, faculty, staff and guests to connect, learn and grow. Please access the link to learn more <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/university-life/student-union'> Student Union<a/>",
          labs:
            "The Anthropology Department strives to provide students with many opportunities to participate in hands-on laboratory and research experiences. Please access the link to learn more <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/university-life/student-union'> Student Union<a/>. Addtionally you can access Department webpage <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/academics/college-of-arts-and-sciences/departments'> here<a/> to learn about various labs and research experience offered in College of Arts and Sciences.",
          campus:
            "Please find different university campus information at this link <a target='_blank' and rel='noopener noreferrer' href='https://www.neiu.edu/about/our-university-locations'> Our University Locations<a/>",
        },
      ],
      Count: 1,
      ScannedCount: 1,
    };
    callback(null, jsonResponse);
  });
};

const request = require('../testData/standardEnquiryRequest.json');

process.env.REGION = 'us-east-1';

describe('plan a leave tests', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it('test 1', async () => {
    mockSuccessfulDynamoDbQuery();
    const response = await handler(request);
    expect(response).not.toBe(null);
  });
});
