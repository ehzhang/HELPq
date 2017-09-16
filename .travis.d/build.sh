#!/usr/bin/env bash
# HACKGPROJECT VERSION: a4089e26eea6f51517a0e00330e1296bb05cfef4
set -euo pipefail
PROJECT_TYPE="deployment"
ORG_NAME_CASE_PRESERVE="HackGT"
ORG_NAME=$(echo "${ORG_NAME_CASE_PRESERVE}" | tr '[:upper:]' '[:lower:]')
SOURCE_DIR=$(readlink -f "${BASH_SOURCE[0]}")
SOURCE_DIR=$(dirname "$SOURCE_DIR")
cd "${SOURCE_DIR}/.."
set -x

if ! hash docker &>/dev/null; then
    echo 'Cannot find the docker binary!' >&2
    exit 64
fi

docker=
if docker ps &>/dev/null; then
    docker=docker
else
    docker='sudo docker'
fi

remote=$(git remote -v | grep -Pio "${ORG_NAME}"'/[a-zA-Z0-9-_\.]*' | head -1)
image_name=$(basename "${remote%.*}")
image_name=$(echo "$image_name" | tr '[:upper:]' '[:lower:]')

build_project_source() {
    if [[ -f Dockerfile.build ]]; then
        local build_image_name
        build_image_name="${image_name}-build"
        $docker build -f Dockerfile.build --rm -t "$build_image_name" .
        $docker run -w '/src' -v "$(pwd):/src" "$build_image_name"
        sudo chown -R "$(id -u):$(id -g)" .
    fi
}

test_project_source() {
    if [[ -f Dockerfile.test ]]; then
        local test_image_name
        test_image_name="${image_name}-test"
        $docker build -f Dockerfile.test --rm -t "$test_image_name" .
        $docker run -w '/src' -v "$(pwd):/src" "$test_image_name"
        sudo chown -R "$(id -u):$(id -g)" .
    fi
}

build_project_container() {
    $docker build -f Dockerfile --rm -t "$image_name" .
}

git_branch() {
    if [[ ${TRAVIS_PULL_REQUEST_BRANCH} ]]; then
        echo "${TRAVIS_PULL_REQUEST_BRANCH}"
    else
        echo "${TRAVIS_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
    fi
}

git_branch_id() {
    git_branch | sed 's/[^0-9a-zA-Z_-.]/-/g'
}

publish_project_container() {
    local git_rev
    local branch
    git_rev=$(git rev-parse HEAD)
    branch=$(git_branch_id)
    local latest_tag_name="latest"
    local push_image_name="${DOCKER_ID_USER}/${image_name}"
    if [[ $branch != master ]]; then
        latest_tag_name="latest-${branch}"
    fi
    docker login -u="${DOCKER_ID_USER}" -p="${DOCKER_PASSWORD}"
    docker tag "$image_name" "$push_image_name":"$git_rev"
    docker push "$push_image_name"
    docker tag "$push_image_name":"$git_rev" "$push_image_name":"$latest_tag_name"
    docker push "$push_image_name"
}

trigger_biodomes_build() {
    body='{
    "request": {
    "branch":"master"
    } }'

    curl -s -X POST \
         -H "Content-Type: application/json" \
         -H "Accept: application/json" \
         -H "Travis-API-Version: 3" \
         -H "Authorization: token ${TRAVIS_TOKEN}" \
         -d "$body" \
         https://api.travis-ci.org/repo/${ORG_NAME_CASE_PRESERVE}%2Fbiodomes/requests
}

commit_to_branch() {
    local branch
    local git_rev
    branch="${1:-gh-pages}"
    git_rev=$(git rev-parse --short HEAD)
    git config user.name 'HackGBot'
    git config user.email 'thehackgt@gmail.com'
    git remote remove origin
    git remote add origin \
        "https://${GH_TOKEN}@github.com/${ORG_NAME}/${image_name}.git"
    git fetch origin
    git reset "origin/$branch" || git checkout -b "$branch"
    git add -A .
    git status
    git commit -m "Automatic Travis deploy of ${git_rev}."
    git push -q origin "HEAD:${branch}"
}

set_cloudflare_dns() {
    local type="$1"
    local name="$2"
    local content="$3"
    local proxied="$4"
    local type_downcase
    local name_downcase
    local content_downcase
    local dns_records
    type_downcase=$(echo "${type}" | tr '[:upper:]' '[:lower:]')
    name_downcase=$(echo "${name}" | tr '[:upper:]' '[:lower:]')
    content_downcase=$(echo "${content}" | tr '[:upper:]' '[:lower:]')

    # get all the dns records
    dns_records=$(curl -X GET \
          -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
          -H "X-Auth-Key: ${CLOUDFLARE_AUTH}" \
          -H "Content-Type: application/json" \
          "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE}/dns_records" \
          | tr '[:upper:]' '[:lower:]')

    # Check if we already set it
    local jq_exists
    jq_exists=$(cat <<-END
        .result[]
        | select(.type == "${type_downcase}")
        | select(.name == "${name_downcase}")
        | select(.content == "${content_downcase}")
END
    )
    if [[ -n $(echo "${dns_records}" | jq "${jq_exists}") ]]; then
        echo "Record already set, not setting again."
        return
    fi

    # Check if there's a different one already set
    local duplicate_exists
    duplicate_exists=$(echo "${dns_records}" \
        | jq '.result[] | select(.name == '"${name_downcase}"')')
    if [[ -n $duplicate_exists ]]; then
        echo "Record with the same host exists, will not overwrite!"
        exit 64
    fi

    # Set IT!
    local dns_record
    dns_record=$(cat <<-END
        {
            "type": "${type}",
            "name": "${name}",
            "content": "${content}",
            "proxied": $proxied
        }
END
    )
    local dns_success
    dns_success=$(curl -X POST \
         --data "$dns_record" \
         -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
         -H "X-Auth-Key: ${CLOUDFLARE_AUTH}" \
         -H "Content-Type: application/json" \
         "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE}/dns_records")

    if [[ $dns_success != true ]]; then
        echo 'DNS Setting on cloudflare failed!!'
        echo 'CloudFlare output:'
        echo "$dns_success"
        exit 64
    fi
    echo DNS set! You\'ll have to wait a bit to see the changes!
}


deployment_project() {
    build_project_container

    if [[ ${TRAVIS_PULL_REQUEST:-} = false ]]; then
        publish_project_container
        trigger_biodomes_build
    fi
}

static_project() {
    if [[ ${TRAVIS_BRANCH:-} = master && ${TRAVIS_PULL_REQUEST:-} = false ]]; then
        commit_to_branch 'gh-pages'
        set_cloudflare_dns CNAME "$(cat CNAME)" "${ORG_NAME}.github.io" true
    fi
}


# Build & Test the project, if needed.
build_project_source
test_project_source

case "$PROJECT_TYPE" in
    deployment)
        deployment_project
        ;;
    static)
        static_project
        ;;
    *)
        echo "Unknown project type!"
        exit 1
esac

