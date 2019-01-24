# frozen_string_literal: true

require 'active_storage_drag_and_drop/version'
require 'active_storage_drag_and_drop/form_builder'

# Gem namespace
# @since 0.1.0
module ActiveStorageDragAndDrop
  # Inherits from Rails::Engine to allow us to mount the packaged javascript/css files and add a
  # custom initializer to execute custom FormBuilder code in the context of
  # ActionView::Helpers::FormBuilder
  #
  # @author Ian Grant
  # @since 0.1.0
  class Engine < Rails::Engine
    initializer 'active_storage_drag_and_drop.form_builder' do |_app|
      ActiveSupport.on_load(:action_view) do
        ActionView::Helpers::FormBuilder.instance_eval do
          include FormBuilder
        end
      end
    end
  end
end
