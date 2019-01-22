require 'active_storage_drag_and_drop/version'
require 'active_storage_drag_and_drop/form_builder'

module ActiveStorageDragAndDrop
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
