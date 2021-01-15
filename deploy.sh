#!/usr/bin/env bash
set -euo pipefail
ssh moolah@do2.symphonious.net mkdir -p moolah.rocks/versions/incoming
rsync -r --delete-after --quiet ~/project/dist/ moolah@do2.symphonious.net:moolah.rocks/versions/incoming/
ssh moolah@do2.symphonious.net ./moolah.rocks/deployMoolah.sh "${CIRCLE_SHA1}" "${CIRCLE_BUILD_NUM}" "${CIRCLE_BUILD_URL}"
