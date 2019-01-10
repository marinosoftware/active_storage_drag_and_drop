require 'test_helper'
require 'database/setup'
require 'nokogiri'

class User < ActiveRecord::Base
  has_many_attached :highlights
end

class ActiveStorageDragAndDropTest < Minitest::Test
  def template
    return @template if @template

    @template = Object.new
    @template.extend ActionView::Helpers::FormHelper
    @template.extend ActionView::Helpers::FormTagHelper
  end

  def user
    @user ||= User.new
  end

  def user_form
    @user_form ||= ActionView::Helpers::FormBuilder.new(:user, user, template, {})
  end

  def default_field
    return @default_field if @default_field

    dnd_field = user_form.drag_and_drop_file_field(:highlights)
    @default_field = parse_html(dnd_field)
  end

  def test_that_it_has_a_version_number
    assert ::ActiveStorageDragAndDrop::VERSION
  end

  def test_it_generates_a_top_level_label
    assert_equal 'label', default_field.node_name
  end

  def test_it_has_the_correct_class
    assert_equal 'asdndzone', default_field['class']
  end

  def test_it_has_the_correct_id
    assert_equal 'asdndz-user_highlights', default_field['id']
  end

  def test_it_has_the_correct_data
    assert_equal 'user_highlights', default_field['data-dnd-input-id']
  end

  def test_it_contains_an_icon_container
    assert default_field.at_css('#asdndz-user_highlights__icon-container')
  end

  def test_it_contains_a_file_input
    assert default_field.at_css('input[type="file"]')
  end

  def test_file_input_references_icon_container
    assert_equal 'asdndz-user_highlights__icon-container',
                 default_field.at_css('input[type="file"]')['data-icon-container-id']
  end

  def test_file_input_references_label_parent
    assert_equal 'asdndz-user_highlights',
                 default_field.at_css('input[type="file"]')['data-dnd-zone-id']
  end

  def test_file_input_has_correct_id
    assert_equal 'user_highlights', default_field.at_css('input[type="file"]')['id']
  end

  def test_file_input_is_hidden
    assert_equal 'display:none;', default_field.at_css('input[type="file"]')['style']
  end

  def test_file_input_is_multiple
    assert_equal 'multiple', default_field.at_css('input[type="file"]')['multiple']
  end

  def test_file_input_has_correct_name
    assert_equal 'user[highlights][]', default_field.at_css('input[type="file"]')['name']
  end

  def test_it_accepts_a_custom_content_string
    dnd_field = user_form.drag_and_drop_file_field(:highlights, 'Custom content!')
    dnd_field = parse_html(dnd_field)
    assert_equal 'Custom content!', dnd_field.text
  end

  def test_it_accepts_custom_content_elements
    dnd_field = user_form.drag_and_drop_file_field(:highlights, '<div class="custom-content"/>')
    dnd_field = parse_html(dnd_field)
    assert dnd_field.at_css('.custom-content')
  end

  def test_it_accepts_a_disabled_option_to_disable_the_file_input
    dnd_field = user_form.drag_and_drop_file_field(:highlights, nil, disabled: true)
    dnd_field = parse_html(dnd_field)
    assert_equal 'disabled', dnd_field.at_css('input[type="file"]')['disabled']
  end

  def test_it_accepts_an_accepts_option_to_limit_file_input_type
    dnd_field = user_form
                .drag_and_drop_file_field(:highlights, nil, accept: 'image/png, image/gif')
    dnd_field = parse_html(dnd_field)
    assert_equal 'image/png, image/gif', dnd_field.at_css('input[type="file"]')['accept']
  end

  def test_it_accepts_a_multiple_option_for_file_input
    dnd_field = user_form .drag_and_drop_file_field(:highlights, nil, multiple: false)
    dnd_field = parse_html(dnd_field)
    assert_nil dnd_field.at_css('input[type="file"]')['multiple']
  end
end
