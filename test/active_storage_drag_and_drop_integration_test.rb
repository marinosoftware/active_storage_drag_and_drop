require 'integration_test_helper'
require 'database/setup'

# config/routes.rb
Rails.application.routes.draw do
  resource :user, only: %i[new create]
end

# app/models/user.rb
class User < ActiveRecord::Base
  has_many_attached :highlights
end unless defined? User

# app/views/users/new.html.erb
USERS_NEW_TEMPLATE = <<-HTML.freeze
  <%= form_with model: @user, url: user_path do |form| %>
    <%= form.drag_and_drop_file_field(:highlights) do %>
      <strong>Drag and Drop</strong> files here or <strong>click to browse</strong>
    <% end %>
    <%= form.submit %>
  <% end %>

  <script>
    document.addEventListener('dnd-upload:error', function (event) {
      console.log(event)
      event.preventDefault()
    })
  </script>
HTML

# app/controllers/users_controller.rb
class UsersController < ApplicationController
  def new
    @user = User.new
    render inline: USERS_NEW_TEMPLATE, layout: 'application'
  end

  def create
    @user = User.create!(user_params)
    render inline: USERS_NEW_TEMPLATE, layout: 'application'
  end

  private

  def user_params
    params.require(:user).permit(highlights: [])
  end
end

class ActiveStorageDragAndDropIntegrationTest < ActionDispatch::IntegrationTest
  include ActionView::Context

  setup do
    Capybara.current_driver = Capybara.javascript_driver
  end

  test 'renders the drag and drop field to the page' do
    visit 'user/new'
    assert page.has_css?('label.asdndzone')
  end

  test 'hidden file field can attach a file' do
    visit 'user/new'
    attach_file 'user_highlights', __dir__ + '/fixtures/files/arrow.png', make_visible: true
    click_on 'Create User'
    assert_match 'arrow.png', User.last.highlights.first.filename.to_s
  end
end
