# for some environments "node" is lazily loaded,
# therefore it's preferred to source this file instead of executing it
# e.g. ". ./check.sh"

# make sure it's properly loaded
node --version

npm test && npm run lint
