# frozen_string_literal: true

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
    def drag_and_drop_file_field_string(method, content = nil, param_options = {})
      options = file_field_options(method, param_options)

      content_tag :label,
                  safe_join(label_content(method, content, options)),
                  class: 'asdndzone', id: options[:data][:dnd_zone_id],
                  'data-dnd-input-id': options[:id]
    end

    # Compose the content for the label
    #
    # @author Ian Grant
    # @see #drag_and_drop_file_field_string
    #
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @param [String] content Provided content for the label.
    # @param [Hash] options A hash of options to customise the file field.
    # @return [String] HTML content for the label
    def label_content(method, content, options)
      content ||= default_content
      content = [content]

      content << tag.div(id: options[:data][:icon_container_id], class: 'asdndz__icon-container')
      content << file_field(method, options)
      content += unpersisted_attachment_fields(method, options)
      content
    end

    # returns an array of tags used to pre-populate the the dropzone with tags queueing unpersisted
    # file attachments for attachment at the next form submission.
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @param [Hash] options A hash of options to customise the file field.
    # @return [Array] An array of hidden field tags for each unpersisted file attachment.
    def unpersisted_attachment_fields(method, options)
      unpersisted_attachments(method).map.with_index do |attachment, idx|
        hidden_field method,
                     mutiple: options[:multiple] ? :multiple : false,
                     value: attachment.signed_id, name: options[:name],
                     data: {
                       direct_upload_id: idx,
                       uploaded_file: { name: attachment.filename, size: attachment.byte_size },
                       icon_container_id: options[:data][:icon_container_id]
                     }
      end
    end

    # Returns an array of all unpersisted file attachments (e.g. left over after a failed
    # validation)
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @return [Array] An array of unpersisted file attachments.
    def unpersisted_attachments(method)
      as_relation = @object.send(method)
      if as_relation.is_a?(ActiveStorage::Attached::One) && as_relation.attachment.present? &&
         !@object.persisted?
        [as_relation.attachment]
      elsif as_relation.is_a?(ActiveStorage::Attached::Many)
        as_relation.reject(&:persisted?)
      else
        []
      end
    end

    # Generates a hash of default options for the embedded file input field.
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @param [Symbol] input_id The id of the input field.
    # @return [Hash] The default options for the file field
    def default_file_field_options(method, input_id)
      {
        multiple: @object.send(method).is_a?(ActiveStorage::Attached::Many),
        direct_upload: true,
        style: 'opacity: 0;',
        data: {
          dnd: true,
          dnd_zone_id: "asdndz-#{input_id}",
          icon_container_id: "asdndz-#{input_id}__icon-container"
        }
      }
    end

    # The default content to populate the drag and drop zone with if there is no content supplied
    # in the parameters or passed as a block.
    #
    # @author Ian Grant
    # @since 1.0.0
    # @return [String] "Drag & Drop or  &lt;span class='asdndz-highlight'&gt;Browse&lt;/span&gt;"
    def default_content
      safe_join(['Drag & Drop or ', tag.span('Browse', class: 'asdndz-highlight')])
    end

    # Merges the user provided options with the default options overwriting the defaults to
    # generate the final options passed to the embedded file input field.
    #
    # @author Ian Grant
    # @param [Symbol] method The attribute on the target model to attach the files to.
    # @param [Hash] custom_options The user provided custom options hash.
    # @return [Hash] The user provided options and default options merged.
    def file_field_options(method, custom_options)
      custom_options[:name] ||= "#{object_name}[#{method}]#{'[]' if custom_options[:multiple]}"
      custom_options[:id] ||= custom_options[:name].gsub(/[\W_]+/, '_').chomp('_')

      default_file_field_options(method, custom_options[:id]).deep_merge(custom_options)
    end
  end
end
