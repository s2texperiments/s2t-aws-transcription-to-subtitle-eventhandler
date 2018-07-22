#!/bin/bash

mkdir deploy
zipName=TRAVIS_REPO_SLUG

echo ${zipName}.zip
zip -r deploy/s2t-completed-aws-transcription-message-to-subtitle-eventhandler.zip *.js node_modules/
