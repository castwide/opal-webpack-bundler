require 'bundler/setup'

gems = Bundler.rubygems
gems.installed_specs.each do |spec|
  puts spec.name
end
