const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const proxyquire = require('proxyquire').noCallThru();
const fake = require('sinon').fake;

const fs = require('fs');

describe('eventhandler', () => {

    let s3GetObjectFake, s3PutObjectFake, awsTranscriptionToSubtitleFake;

    let underTest;

    beforeEach(() => {
        s3GetObjectFake = fake.resolves(getExpectedResponse('expectedS3GetObjectResponse.json'));
        s3PutObjectFake = fake.resolves();
        awsTranscriptionToSubtitleFake = fake.resolves(getSubtitle('expectedSubtitle.vtt'));

        underTest = proxyquire('../index.js', {
            './s3Api': {
                getObject: s3GetObjectFake,
                putObject: s3PutObjectFake
            },
            'aws-transcription-to-subtitle': {
                handler: awsTranscriptionToSubtitleFake
            }
        });
    });

    it('succeed', async () => {

        await underTest.handler(getEventData('/givenS3EventData.json'));

        let [s3GetObjectParam] = s3GetObjectFake.firstCall.args;
        expect(s3GetObjectParam.Bucket).to.equal('s2t-bucket-s2tappbucket-6fcig9aptjr0');
        expect(s3GetObjectParam.Key).to.equal('aws/raw-transcription/284/745.json');

        let [awsTranscriptionToSubtitleParam] = awsTranscriptionToSubtitleFake.firstCall.args;
        expect(awsTranscriptionToSubtitleParam).to.deep.equal({some: 'content'});

        let [s3PutObjectParam] = s3PutObjectFake.firstCall.args;
        expect(s3PutObjectParam.Bucket).to.equal('s2t-bucket-s2tappbucket-6fcig9aptjr0');
        expect(s3PutObjectParam.Key).to.equal('aws/subtitle/284/745.vtt');
        expect(s3PutObjectParam.Body).to.equal(getSubtitle('expectedSubtitle.vtt'));
        expect(s3PutObjectParam.Metadata['api-key-id']).to.equal('284');
        expect(s3PutObjectParam.Metadata['pid']).to.equal('745');
        expect(s3PutObjectParam.Metadata['transcribe-provider']).to.equal('aws');
    });


    function getEventData(file) {
        return JSON.parse(fs.readFileSync(`test/${file}`, 'utf8'));
    }

    function getSubtitle(file) {
        return fs.readFileSync(`test/${file}`, 'utf8');
    }

    function getExpectedResponse(file) {
        return JSON.parse(fs.readFileSync(`test/${file}`, 'utf8'));
    }
});