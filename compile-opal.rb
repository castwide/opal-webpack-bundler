require 'json'
require_relative './opal_webpack_bundler'

# @todo Temporary, just to make sure the base gem stuff works
Opal.use_gem 'opal'

args = JSON.parse(ARGV[0], symbolize_names: true)
bundler = OpalWebpackBundler.new(args[:file], args[:root], nil)
print bundler.process.to_json
# opal = Opal::Builder.new
# opal.append_paths *args[:paths]
# args[:gems].each do |gem|
#   opal.use_gem gem
# end
# # opal.build_str File.read(args[:file]), args[:relative].gsub(/\\/, '/'), requirable: false
# # result = [opal.to_s]
# # result.push JSON.parse(opal.source_map) if args[:sourcemap]
# # print result.to_json
# opal.build(args[:file], esm: true)
# print({
#   code: opal.to_s,
#   source_map: opal.source_map.to_s,
#   files: opal.dependent_files
# }.to_json)
