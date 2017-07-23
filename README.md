# subtender

[![npm version](https://badge.fury.io/js/subtender.svg)](https://badge.fury.io/js/subtender)

[![Build Status](https://travis-ci.org/Javran/subtender.svg?branch=master)](https://travis-ci.org/Javran/subtender)

subtender is a collection of utilities that I found useful during develpment.

## Importing

This package comes with multiple tiers of dependencies:

- `subtender/base`: things that requires no dependency

- `subtender/tier1`: everything in `subtender/base`, and things that requires:

    - `lodash`
    - `react-redux`

- `subtender` is the same as `subtender/tier1`.

- `subtender/poi` to import tools for `poi` development, has to be opted-in.

Ignore peer dependency warnings accordingly.
