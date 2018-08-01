let s3Api = require('./s3Api.js');
let transcriptionToSubtitle = require('aws-transcription-to-subtitle');

exports.handler = async (event) => {

    console.log(`REQUEST: ${JSON.stringify(event)}`);
    let {
        Records: [{
            Sns: {
                MessageAttributes: {
                    bucket: {
                        Value: bucket
                    },
                    key: {
                        Value: key
                    }
                }
            }
        }]
    } = event;

    console.log(`Get s3 object: ${bucket}/${key}`);

    let {
        Metadata = {},
        Body
    } = await s3Api.getObject({
        Bucket: bucket,
        Key: key
    });

    if(!Metadata['api-key-id'] || ! Metadata['pid']){
        throw `Missing mandatory metadata: api-key-id or pid. was: ${Metadata}`
    }

    console.log('Transform transcription into vtt');
    let vtt = await transcriptionToSubtitle.handler(JSON.parse(Body));
    console.log(`Upload to ${bucket}/aws/subtitle/${Metadata['api-key-id']}/${Metadata['pid']}.vtt`);

    return s3Api.putObject({
        Bucket: bucket,
        Key: `aws/subtitle/${Metadata['api-key-id']}/${Metadata['pid']}.vtt`,
        Body: vtt,
        Metadata
    });
    // console.log(`Result: ${result}`);
};