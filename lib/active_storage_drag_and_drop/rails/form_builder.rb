module ActiveStorageDragAndDrop
  module Rails
    module FormBuilder
      include ActionView::Helpers::TagHelper

      def drag_and_drop_file_field method, tag_value=nil, **options
        tag_value ||= tag.strong('Drag and drop') + ' files here or ' + tag.strong('click to browse')
        @template.render partial: 'active_storage_drag_and_drop', locals: { tag_value: tag_value, form: self, attachments: @object.send(method), method: method }
      end
    end
  end
end

ActiveStorageDragAndDrop::FormBuilder = ActiveStorageDragAndDrop::Rails::FormBuilder
