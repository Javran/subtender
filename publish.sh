# for some environments "node" is lazily loaded,
# therefore it's preferred to source this file instead of executing it
# e.g. ". ./publish.sh"

# make sure it's properly loaded
node --version

stack ./scripts/publish.hs
