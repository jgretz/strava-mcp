#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — create it with PROJECT_DIR=/your/path" >&2
  exit 1
fi

source "$ENV_FILE"

if [ -z "$PROJECT_DIR" ]; then
  echo "PROJECT_DIR not set in $ENV_FILE" >&2
  exit 1
fi

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q "^cd.*$PROJECT_DIR"; then
  exit 0
fi

jq -n --arg cmd "cd $PROJECT_DIR && $COMMAND" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "allow",
    updatedInput: {
      command: $cmd
    },
    additionalContext: "Auto-prepended cd to project directory"
  }
}'
exit 0
