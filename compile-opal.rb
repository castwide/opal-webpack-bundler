require 'opal'
require 'json'
require 'base64'

args = JSON.parse(ARGV[0], symbolize_names: true)

opal = Opal::Builder.new
opal.append_paths *args[:paths]
args[:gems].each do |gem|
  opal.use_gem gem
end
opal.build_str File.read(args[:file]), args[:relative].gsub(/\\/, '/'), requirable: false
result = [opal.to_s]
result.push JSON.parse(opal.source_map) if args[:sourcemap]
print result.to_json
