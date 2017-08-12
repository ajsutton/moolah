#!/usr/bin/env bash
ssh moolah@do2.symphonious.net mkdir -p moolah.rocks/versions/incoming
rsync -r --delete-after --quiet "${TRAVIS_BUILD_DIR}/" moolah@do2.symphonious.net:moolah.rocks/versions/incoming
ssh moolah@do2.symphonious.net ./moolah.rocks/deployMoolah.sh "${TRAVIS_COMMIT}" "${TRAVIS_BUILD_NUMBER}" "${TRAVIS_BUILD_ID}"
