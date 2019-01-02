require 'action_view/helpers'
require 'active_storage_drag_and_drop/rails/form_builder'

module ActiveStorageDragAndDrop
  module Rails
    module FormHelper
      def self.included(_base)
        ActionView::Helpers::FormBuilder.instance_eval do
          include FormBuilder
        end
      end

      def drag_and_drop_attachments(attachments)
        attachments = []

        if attachments.kind_of?(ActiveStorage::Attached::One)
          attachments << attachments if attachments.id.present?
        elsif attachments.kind_of?(ActiveStorage::Attached::Many)
          attachments = attachments.reject(&:persisted?)
        end

        attachments
      end
    end
  end
end

ActionView::Base.send :include, ActiveStorageDragAndDrop::Rails::FormHelper
