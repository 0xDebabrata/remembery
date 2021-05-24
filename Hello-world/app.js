/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

require('dotenv').config()
const { Client } = require('@notionhq/client');
var aws = require("aws-sdk");
var ses = new aws.SES({ region: "us-east-1" });

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
})

const getBDays = async () => {
    const filter = {
        property: "Upcoming Birthday",
        date: {
            equals: new Date()
        }
    }
    const payload = {
        path: `databases/${process.env.NOTION_DB_ID}/query`,
        method: 'POST',
        body: {filter: filter}
    }
    const { results } = await notion.request(payload, filter)

    const info = results.map(page => {
        return page.properties.Name.title[0].plain_text
    })
    return info
}

exports.lambdaHandler = async (event, context) => {
    try {
        const data = await getBDays()

        var params = {
            Destination: {
              ToAddresses: ["debabratareviews@gmail.com"],
            },
            Message: {
              Body: {
                Text: { Data: JSON.stringify(data) },
              },
        
              Subject: { Data: "Birthday Reminder" },
            },
            Source: "debabratapi@protonmail.com",
          };

        console.log("DATA", data, JSON.stringify(data))

        return ses.sendEmail(params).promise()

    } catch (err) {
        console.log(err);
        return err;
    }
};
