# opal-webpack-bundler

A Webpack loader for compiling Ruby to JavaScript.

## Description

[Opal](https://github.com/opal/opal) is a Ruby to JavaScript source-to-source compiler that makes it possible to run Ruby code in JavaScript engines, including browsers.
This module aims to automate the process of compiling to JavaScript via Webpack.

Features:

* Bundler integration for easy management of gem dependencies
* Configurable load paths

## Usage

Install the Opal gem:

```
gem install opal
```

Or add it to your Gemfile:

```
gem 'opal'
```

Add the module to your project's dependencies:

```
npm install --save-dev opal-webpack-builder
```

Add the loader to your project's webpack.config.js:

```
module.exports = {
  module: {
    rules: [
      {
        // opal-webpack-bundler will compile and include ruby files in the pack
        test: /\.rb$/,
        use: [
          {
            loader: 'opal-webpack-bundler',
            options: {
              // Set useBundler to false if your project does not have a Gemfile
              useBundler: true,
              gems: [],
              paths: []
            }
          }
        ]
      }
    ]
  }
}
```

Import your Ruby code the same way as any other asset, e.g.:

```
import './example.rb'
```

## Loader Options

* `useBundler`: Automatically make bundled gems available
* `gems`: An array of additional gems to make available
* `paths`: An array of additional load paths to make available

## Recommendations

* Ruby code should include `require 'opal'` to import the Ruby corelib.
* If you use Bundler, your Gemfile should be in your project's root directory (the same directory as package.json).
* If your project imports multiple Ruby scripts, each one is compiled separately, so if you have the same paths required in multiple files, the required code might get compiled and
  loaded multiple times. It's best to import a single Ruby script that loads all of your required libraries from one place.
* Refer to the [Opal documentation](http://opalrb.com/docs/) for more information, including how to reference Ruby code from JavaScript and vice versa.

## Known Issues

* Source maps are not supported.
* `require_relative` does not always work as expected (see https://github.com/opal/opal/issues/1634).

## To Do

* Provide examples.

## Alternative/Similar Projects

* https://github.com/janbiedermann/opal-webpack-loader
* https://github.com/cj/opal-webpack
* https://github.com/zetachang/opalrb-loader
