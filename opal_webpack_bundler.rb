require 'opal'

class OpalWebpackBundler
  # @param app_dir [String]
  # @param cache_dir [String]
  def initialize file, root_dir, cache_dir
    @file = File.absolute_path(file)
    @root_dir = File.absolute_path(root_dir)
    @cache_dir = cache_dir
  end

  def process
    processor = Opal::BuilderProcessors::RubyProcessor.new(File.read(@file), File.basename(@file))
    sources = processor.requires.flat_map do |req|
      build req, []
    end
    sources.push build_file processor.requires
    [sources.last[:source], sources.last[:source_map]]
  end

  private

  def build path, prerequires
    build = Opal::Builder.new
                         .tap do |builder|
                            builder.append_paths(File.dirname(@file))
                            builder.use_gem 'opal'
                            builder.prerequired = prerequires
                            builder.build(path, esm: true)
                         end
    { source: build.to_s, source_map: build.source_map.to_json }
  end

  def build_file prerequired
    build = Opal::Builder.new
                         .tap do |builder|
                            # builder.prerequired = prerequired
                            builder.use_gem 'opal'
                            builder.build_str(File.read(@file), '.', esm: true)
                         end
    { source: build.to_s, source_map: build.source_map.map.to_json }
  end
end
