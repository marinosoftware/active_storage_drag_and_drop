module ActiveStorageDragAndDrop
  module Rails
    module FormBuilder
      include ActionView::Helpers::TagHelper
      include Haml::Helpers if defined? Haml

      def drag_and_drop_file_field(method, content_or_options = nil, options = {}, &block)
        if block_given?
          options = content_or_options if content_or_options.is_a? Hash
          drag_and_drop_file_field_string(method, capture(&block), options)
        else
          drag_and_drop_file_field_string(method, content_or_options, options)
        end
      end

      private

      def capture_haml(*args, &block)
        with_haml_buffer(load_buffer(block)) do
          position = haml_buffer.buffer.length

          haml_buffer.capture_position = position
          value = yield(*args)
          captured = haml_buffer.buffer.slice!(position..-1)
          capture_value(captured, value)
        end
      end

      def capture_value(captured, value)
        if (captured == '') && (value != haml_buffer.buffer)
          captured = (value.is_a?(String) ? value : nil)
        end
        captured.html_safe
      end

      def load_buffer(block)
        buffer = eval <<-RUBY, block.binding, __FILE__, __LINE__ + 1
          (defined? _hamlout) ? _hamlout : nil
        RUBY
        buffer || haml_buffer
      end

      def drag_and_drop_file_field_string(method, content = nil, options = {})
        content ||= tag.strong('Drag and drop') + ' files here or ' +
                    tag.strong('click to browse')
        @template.render partial: 'active_storage_drag_and_drop',
                         locals: {
                           tag_value: content,
                           form: self,
                           attachments: @object.send(method),
                           method: method,
                           options: file_field_options(method, options)
                         }
      end

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

      def file_field_options(method, custom_options)
        default_file_field_options(method).merge(custom_options) do |_key, default, custom|
          default.is_a?(Hash) && custom.is_a?(Hash) ? default.merge(custom) : custom
        end
      end
    end
  end
end

ActiveStorageDragAndDrop::FormBuilder = ActiveStorageDragAndDrop::Rails::FormBuilder
