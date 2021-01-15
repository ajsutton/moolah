#!/usr/bin/env bash
ssh moolah@do2.symphonious.net mkdir -p moolah.rocks/versions/incoming
rsync -r --delete-after --quiet "${TRAVIS_BUILD_DIR}/dist/" moolah@do2.symphonious.net:moolah.rocks/versions/incoming/
ssh moolah@do2.symphonious.net ./moolah.rocks/deployMoolah.sh "${CIRCLE_SHA1}" "${CIRCLE_BUILD_NUM}" "${CIRCLE_BUILD_URL}"
