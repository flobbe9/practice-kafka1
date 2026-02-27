#!/bin/sh
# terminate on error
set -e

OMIT_TESTS="false";

# evaluate flags
while [ "$#" -gt 0 ]; do
  case "$1" in
    --omitTests)
      OMIT_TESTS="true"
      shift
      ;;
    -*) # unhandled flag
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# combile and build
tsc -b;

# test
if [ $OMIT_TESTS = "false" ]; then
    jest -- ./src;
else
    echo "Omitting tests";
fi;

# resolve aliases in .d. files
tsc-alias &&

# modify /dist content
shx cp ./package.json ./dist &&
shx rm -rf ./dist/src/__tests__ &&
shx cp ./README.md ./dist &&
shx cp ./LICENSE ./dist;