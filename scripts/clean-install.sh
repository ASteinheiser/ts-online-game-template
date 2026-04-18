#!/bin/bash

echo "Cleaning out caches, dists, node_modules, etc..."
# Remove node_modules directories
find . -name "node_modules" -type d -prune -exec rm -rf {} \;
# Remove dist directories
find . -name "dist" -type d -prune -exec rm -rf {} \;
# Remove coverage directories
find . -name "coverage" -type d -prune -exec rm -rf {} \;
# Remove prisma-client directories
find . -name "prisma-client" -type d -prune -exec rm -rf {} \;
# Remove .turbo directories
find . -name ".turbo" -type d -prune -exec rm -rf {} \;
# Remove tsconfig.tsbuildinfo files
find . -name "tsconfig.tsbuildinfo" -type f -exec rm -f {} \;

echo "Pruning pnpm store..."
pnpm store prune

pnpm install
