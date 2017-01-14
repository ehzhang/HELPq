#!/usr/bin/env bash
set -euo pipefail
set -x

apt-get update
apt-get install -y tree
tree
