module ActiveStorageDragAndDrop
  # Custom FormBuilder module. All code in this module is executed within the context of
  # ActionView::Helpers::FormBuilder when ActionView is first loaded via the
  # {Engine Engine}
  # @since 0.1.0
  module FormBuilder
    delegate :capture, :content_tag, :tag, :safe_join, to: :@template

    # Returns a file upload input tag wrapped in markup that allows dragging and dropping of files
    # onto the element.
    #
    # @author Ian Grant
    # @see file:README.md#Usage Usage section of the README
    #
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @param [String] content The content to render inside of the drag and drop file field.
    # @param [Hash] options A hash of options to customise the file field.
    #
    # @option options [Boolean] :disabled If set to true, the user will not be able to use this
    #   input.
    # @option options [Boolean] :mutiple If set to true, *in most updated browsers* the user will
    #   be allowed to select multiple files.
    # @option options [String] :accept If set to one or multiple mime-types, the user will be
    #   suggested a filter when choosing a file. You still need to set up model validations.
    # @option options [Integer] :size_limit The upper limit on filesize to accept in bytes.
    #   Client-side validation only. You still need to set up model validations.
    #
    # @return [String] The generated file field markup.
    #
    # @example
    #   # Accept only PNGs or JPEGs up to 5MB in size:
    #   form.drag_and_drop_file_field :images, nil, accept: 'image/png, image/jpeg',
    #                                               size_limit: 5_000_000
    # @example
    #   # Pass custom content string:
    #    form.drag_and_drop_file_field :images, '<div>Drag and Drop!</div>', accept: 'image/png'
    # @example
    #   # Pass a block of content instead of passing a string
    #   <%= form.drag_and_drop_file_field(:images, accept: 'image/png') do %>
    #     <strong>Drag and Drop</strong> PNG files here or <strong>click to browse</strong>
    #   <% end %>
    def drag_and_drop_file_field(method, content_or_options = nil, options = {}, &block)
      if block_given?
        options = content_or_options if content_or_options.is_a? Hash
        drag_and_drop_file_field_string(method, capture(&block), options)
      else
        drag_and_drop_file_field_string(method, content_or_options, options)
      end
    end

    private

    # After {#drag_and_drop_file_field} has parsed whether the content was passed as a block or a
    # parameter the result is passed to this method which actually generates the markup.
    #
    # @author Ian Grant
    # @see #drag_and_drop_file_field
    #
    # @param (see #drag_and_drop_file_field)
    # @option (see #drag_and_drop_file_field)
    # @return (see #drag_and_drop_file_field)
    def drag_and_drop_file_field_string(method, content = nil, options = {})
      ref = "#{object_name}_#{method}"
      content = [content]
      content << tag.div(id: "asdndz-#{ref}__icon-container")
      content << file_field(method, file_field_options(method, options))
      content += unpersisted_attachment_fields(method)
      content_tag :label, safe_join(content), class: 'asdndzone', id: "asdndz-#{ref}",
                                              'data-dnd-input-id': ref
    end

    # Checks for unpersisted file attachments (e.g. left over after a failed validation) and
    # returns an array of tags used to pre-populate the the dropzone with tags queueing those files
    # for attachment at the next form submission.
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @return [Array] An array of hidden field tags for each unpersisted file attachment.
    def unpersisted_attachment_fields(method)
      attachments = @object.send(method).reject(&:persisted?)
      attachments.map.with_index do |blob, idx|
        hidden_field method,
                     mutiple: :multiple, value: blob.signed_id,
                     name: "#{object_name}[#{method}][]",
                     data: {
                       direct_upload_id: idx, uploaded_file_name: blob.filename,
                       icon_container_id: "asdndz-#{object_name}_#{method}__icon-container"
                     }
      end
    end

    # Generates a hash of default options for the embedded file input field.
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @return [Hash] The default options  for the file field
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

    # Merges the user provided options with the default options overwriting the defaults to
    # generate the final options passed to the embedded file input field.
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @param [Hash] custom_options The user provided custom options hash.
    # @return [Hash] The user provided options and default options merged.
    def file_field_options(method, custom_options)
      default_file_field_options(method).merge(custom_options) do |_key, default, custom|
        default.is_a?(Hash) && custom.is_a?(Hash) ? default.merge(custom) : custom
      end
    end
  end
end
