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
    # @todo This processor stuff may or may not be necessary. It's here as a
    #   preliminary attempt at incremental compiling.
    # processor = Opal::BuilderProcessors::RubyProcessor.new(File.read(@file), File.basename(@file))
    # sources = processor.requires.flat_map do |req|
    #   build req
    # end
    build_file # processor.requires
  end

  private

  def build path, prerequired = []
    build = Opal::Builder.new
                         .tap do |builder|
                            builder.append_paths(File.dirname(@file))
                            builder.use_gem 'opal'
                            builder.prerequired = prerequired
                            builder.build(path)
                         end
    { source: build.to_s, source_map: build.source_map.as_json, files: build.dependent_files }
  end

  def build_file prerequired = []
    build = Opal::Builder.new
                         .tap do |builder|
                            builder.prerequired = prerequired
                            builder.use_gem 'opal'
                            builder.build(@file)
                         end
    { source: build.to_s, source_map: build.source_map.as_json, files: build.dependent_files }
  end
end
