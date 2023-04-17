require 'opal'

class OpalWebpackBundler
  def initialize file:, paths:, relative:, gems:, **other
    @file = file.gsub(/\\/, '/')
    @paths = paths.map { |pth| pth.gsub(/\\/, '/') }
    @relative = relative.gsub(/\\/, '/')
    @gems = gems
  end

  def process
    opal = Opal::Builder.new
    opal.append_paths *@paths
    @gems.each do |gem|
      opal.use_gem gem
    end
    opal.build_str File.read(@file), @relative, requirable: false
    { source: opal.to_s, source_map: opal.source_map.as_json, files: opal.dependent_files }
  end
end
