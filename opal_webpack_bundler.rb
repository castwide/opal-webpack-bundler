require 'opal'

class OpalWebpackBundler
  def initialize file:, paths:, relative:, gems:, **other
    @file = file.gsub(/\\/, '/')
    @paths = paths.map { |pth| pth.gsub(/\\/, '/') }
    @relative = relative.gsub(/\\/, '/')
    @gems = gems
  end

  def process
    builder = Opal::Builder.new
    builder.append_paths *@paths
    @gems.each do |gem|
      builder.use_gem gem
    end
    builder.build_str File.read(@file), @relative, load: false
    { source: builder.to_s, source_map: builder.source_map.as_json, files: builder.dependent_files }
  end
end
