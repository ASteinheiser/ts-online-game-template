#!/bin/bash

# Remove node_modules directories
find . -name "node_modules" -type d -prune -exec rm -rf {} \;
# Remove dist directories
find . -name "dist" -type d -prune -exec rm -rf {} \;
# Remove .rollup.cache directories
find . -name ".rollup.cache" -type d -prune -exec rm -rf {} \;
# Remove coverage directories
find . -name "coverage" -type d -prune -exec rm -rf {} \;
# Remove prisma-client directories
find . -name "prisma-client" -type d -prune -exec rm -rf {} \;
# Remove .turbo directories
find . -name ".turbo" -type d -prune -exec rm -rf {} \;
# Remove tsconfig.tsbuildinfo files
find . -name "tsconfig.tsbuildinfo" -type f -exec rm -f {} \;

pnpm store prune
pnpm install
