#!/bin/sh

# terminate on error
set -e

OMIT_TESTS="false";
CLEAN_BUILD="false";

# evaluate flags
while [ "$#" -gt 0 ]; do
    case "$1" in
        --omitTests) # skip jest tests
        OMIT_TESTS="true"
        shift
        ;;
        --clean) # delete /dist dir before building
        CLEAN_BUILD="true"
        shift
        ;;
        -*) # unhandled flag
        echo "Unknown option: $1" >&2
        exit 1
        ;;
    esac
done

# ensure a clean /dist dir
if [ $CLEAN_BUILD = "true" ]; then 
    rm -rf ./dist;
fi

# compile and build
tsc -b;

# test
if [ $OMIT_TESTS = "false" ]; then
    jest -- ./src;
else
    echo "Omitting tests";
fi

# modify /dist content
shx rm -rf dist/src/__tests__;
shx cp package.json ./dist;
shx cp README.md ./dist;
shx cp LICENSE ./dist;

# convert '@' aliase imports to relative paths
tsc-alias;
# append '.js' to import statements
tsc-esm-fix;