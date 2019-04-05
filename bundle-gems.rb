require 'bundler'
deps = Bundler.require
deps.each do |dep|
  puts dep.name
end
