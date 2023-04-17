require 'json'
require_relative './opal_webpack_bundler'

args = JSON.parse(ARGV[0], symbolize_names: true)
bundler = OpalWebpackBundler.new(**args)
print bundler.process.to_json
