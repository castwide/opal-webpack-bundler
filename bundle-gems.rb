require 'bundler/setup'

gems = Bundler.rubygems
gems.all_specs.each do |spec|
  puts spec.name
end
