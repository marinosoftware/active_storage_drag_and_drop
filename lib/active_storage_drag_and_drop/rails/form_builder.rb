module ActiveStorageDragAndDrop
  module Rails
    module FormBuilder
      include ActionView::Helpers::TagHelper

      def drag_and_drop_file_field(method, tag_value = nil, **options)
        tag_value ||= tag.strong('Drag and drop') + ' files here or ' +
                      tag.strong('click to browse')
        @template.render partial: 'active_storage_drag_and_drop',
                         locals: {
                           tag_value: tag_value,
                           form: self,
                           attachments: @object.send(method),
                           method: method,
                           options: file_field_options(options, method)
                         }
      end

      private

      def default_file_field_options(method)
        {
          multiple: true,
          direct_upload: true,
          style: 'display:none;',
          data: {
            dnd: true,
            dnd_zone_id: "asdndz-#{object_name}_#{method}",
            icon_container_id: "asdndz-#{object_name}_#{method}__icon-container"
          }
        }
      end

      def file_field_options(custom_options, method)
        default_file_field_options(method).merge(custom_options) do |_key, default, custom|
          default.is_a?(Hash) && custom.is_a?(Hash) ? default.merge(custom) : custom
        end
      end
    end
  end
end

ActiveStorageDragAndDrop::FormBuilder = ActiveStorageDragAndDrop::Rails::FormBuilder
