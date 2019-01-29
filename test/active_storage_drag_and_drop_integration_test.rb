# frozen_string_literal: true

require 'integration_test_helper'
require 'database/setup'

# config/routes.rb
Rails.application.routes.draw do
  resource :user, only: %i[new create]
end

# app/models/user.rb
class User < ApplicationRecord
  has_one_attached :avatar
  has_many_attached :highlights
  validate :avatar_validation, :highlights_validation

  def avatar_validation
    errors[:base] << 'This file is invalid' if avatar.attachment&.filename == 'invalid.txt'
  end

  def highlights_validation
    highlights.each do |highlight|
      next unless highlight.blob.filename == 'invalid.txt'

      highlight.purge
      errors[:base] << 'This file is invalid'
    end
  end
end

# app/views/users/new.html.erb
USERS_NEW_TEMPLATE = <<-HTML
  <h1><%= flash['error'] %></h1>
  <%= form_with model: @user, url: user_path do |form| %>
    <%= form.drag_and_drop_file_field(:avatar) do %>
      <strong>Drag and Drop</strong> avatar here or <strong>click to browse</strong>
    <% end %>
    <%= form.drag_and_drop_file_field(:highlights) do %>
      <strong>Drag and Drop</strong> files here or <strong>click to browse</strong>
    <% end %>
    <%= form.submit %>
  <% end %>
HTML

# app/views/users/show.html.erb
USERS_SHOW_TEMPLATE = <<-HTML
  <h1>Highlights</h1>
  <ul>
    <% @user.highlights.each do |highlight| %>
      <li><%= highlight.filename %></li>
    <% end %>
  </ul>
HTML

# app/controllers/users_controller.rb
class UsersController < ApplicationController
  def new
    @user = User.new
    render inline: USERS_NEW_TEMPLATE, layout: 'application'
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render inline: USERS_SHOW_TEMPLATE, layout: 'application'
    else
      flash.now['error'] = @user.errors.full_messages
      render inline: USERS_NEW_TEMPLATE, layout: 'application'
    end
  end

  private

  def user_params
    params.require(:user).permit(:avatar, highlights: [])
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

  test 'avatar file field can attach a file' do
    visit 'user/new'
    attach_file 'user_avatar', file_path('arrow.png'), make_visible: true
    click_on 'Create User'
    assert_match 'arrow.png', User.last.avatar.filename.to_s
  end

  test 'avatar file field cannot attach multiple files' do
    visit 'user/new'
    attach_file 'user_avatar', file_path('arrow.png'), make_visible: true
    attach_file 'user_avatar', file_path('document.txt'), make_visible: true
    page.assert_selector '.direct-upload--pending', count: 1
  end

  test 'last file attached to has_one_attached file field is uploaded' do
    visit 'user/new'
    attach_file 'user_avatar', file_path('invalid.txt'), make_visible: true
    attach_file 'user_avatar', file_path('arrow.png'), make_visible: true
    click_on 'Create User'
    assert_match 'arrow.png', User.last.avatar.filename.to_s
  end

  test 'single files which fail to be attached for any reason are requeued for attachment' do
    visit 'user/new'
    attach_file 'user_avatar', file_path('invalid.txt'), make_visible: true
    click_on 'Create User'
    page.assert_selector '.direct-upload--complete', count: 1
  end

  test 'highlights file field can attach a file' do
    visit 'user/new'
    attach_file 'user_highlights', file_path('arrow.png'), make_visible: true
    click_on 'Create User'
    assert_match 'arrow.png', User.last.highlights.first.filename.to_s
  end

  test 'highlights file field can attach multiple files' do
    visit 'user/new'
    attach_file 'user_highlights', file_path('arrow.png'), make_visible: true
    attach_file 'user_highlights', file_path('document.txt'), make_visible: true
    click_on 'Create User'
    assert_equal 2, User.last.highlights.count
  end

  test 'multiple files which fail to be attached for any reason are requeued for attachment' do
    visit 'user/new'
    attach_file 'user_highlights', file_path('arrow.png'), make_visible: true
    attach_file 'user_highlights', file_path('invalid.txt'), make_visible: true
    click_on 'Create User'
    page.assert_selector '.direct-upload--complete', count: 2
  end
end
