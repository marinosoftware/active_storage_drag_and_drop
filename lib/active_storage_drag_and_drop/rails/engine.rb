module ActiveStorageDragAndDrop
  module Rails
    class Engine < ::Rails::Engine
      initializer 'active_storage_drag_and_drop.form_helpers' do |_app|
        ActiveSupport.on_load(:action_view) { require 'active_storage_drag_and_drop/rails/form_helper'}
      end
    end
  end
end
