#!/bin/bash
set -e

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
export PATH="$HOME/.bun/bin:$PATH"

# Install dependencies
bun install

# Build the project
bun run build 