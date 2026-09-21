#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-ai-tribunal}"
gh repo create "rrahul0904/${REPO_NAME}" --public --source=. --remote=origin --push
