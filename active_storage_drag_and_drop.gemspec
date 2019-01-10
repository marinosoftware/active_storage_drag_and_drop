lib = File.expand_path('lib', __dir__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'active_storage_drag_and_drop/version'

Gem::Specification.new do |spec|
  spec.name          = 'active_storage_drag_and_drop'
  spec.version       = ActiveStorageDragAndDrop::VERSION
  spec.authors       = ["Dave O'Keeffe", 'Ian Grant']
  spec.email         = ['ian.grant@marinosoftware.com']

  spec.summary       = 'Provides JS drag and drop file upload functionality for active storage.'
  spec.description   = 'Provides a form helper to make it easy to make drag and drop file upload'\
                          " fields that work with Rails' Active Storage."
  spec.homepage      = 'https://github.com/marinosoftware/active_storage_drag_and_drop'
  spec.license       = 'MIT'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  unless spec.respond_to?(:metadata)
    raise 'RubyGems 2.0 or newer is required to protect against public gem pushes.'
  end

  spec.metadata['source_code_uri'] = 'https://github.com/marinosoftware/active_storage_drag_and_drop'

  spec.files = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features)/})
  end
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_development_dependency 'bootsnap'
  spec.add_development_dependency 'bundler', '~> 1.16'
  spec.add_development_dependency 'listen'
  spec.add_development_dependency 'minitest', '~> 5.0'
  spec.add_development_dependency 'nokogiri'
  spec.add_development_dependency 'pry'
  spec.add_development_dependency 'rake', '~> 10.0'
  spec.add_development_dependency 'sqlite3'
  spec.add_dependency 'rack', '~> 2.0.6'
  spec.add_dependency 'rails', '~> 5.2'
end
