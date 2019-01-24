# frozen_string_literal: true

ENV['RAILS_ENV'] = 'test'

require 'simplecov'
SimpleCov.start do
  add_filter 'test'
end

require File.expand_path('../test/dummy/config/environment.rb', __dir__)
require 'bundler/setup'
require 'active_support'
require 'active_support/test_case'
require 'active_support/testing/autorun'
require 'active_storage'
require 'active_storage/engine'
require 'pry'
require 'nokogiri'

require 'active_job'
ActiveJob::Base.queue_adapter = :test
ActiveJob::Base.logger = nil

require 'active_storage_drag_and_drop'

require 'minitest/autorun'

def parse_html(html)
  html = CGI.unescapeHTML(html)
  Nokogiri::HTML(html).at_css('body > *')
end
