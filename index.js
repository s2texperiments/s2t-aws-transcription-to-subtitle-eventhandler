const fetch = require("node-fetch");

exports.handler = async (event) => {

    console.log(`REQUEST: ${JSON.stringify(event)}`);
    let {
        Records: [{
            Sns: {
                Message: msg,
                MessageAttributes: {
                    "api-key-id": {
                        Value: apiKeyId
                    },
                    "pid": {
                        Value: pid
                    },
                }
            }
        }]
    } = event;

    let result = await fetch(JSON.parse(msg).TranscriptFileUri)
        .then(response => response.json());

    console.log(`Result: ${result}`);
};