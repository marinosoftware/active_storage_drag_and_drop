# Active Storage Drag and Drop

Provides a form helper to make it easy to make drag and drop file upload fields that work with Rails' Active Storage.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'active_storage_drag_and_drop'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install active_storage_drag_and_drop

Include `active_stroage_drag_and_drop.js` in your application's JavaScript bundle.
```js
//= require active_storage_drag_and_drop
```

You may also optionally include some basic styles in your application css:
```css
/*
 *= require direct_uploads
 *= require active_storage_drag_and_drop
 */
```

## Usage

Add an ActiveStorage attachment to your model:
```ruby
class Message < ApplicationRecord
  has_many_attached :images
end
```
Call the method `drag_and_drop_file_field` on your model's form:
```haml
= form_with model: @message, local: true do |form|
  = form.drag_and_drop_file_field :images
  = form.submit
```
The first parameter is a symbol representing the method of the ActiveStorage attachment and an optional second parameter sets the the text on the drag and drop zone.
In your controller you can permit the params like so:
```ruby
params.permit(:message).require(images: [])
```

## Development

Install yarn to manage js dependencies.
After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake test` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

After making a change to the javascript in `app/javascript` compile it to `app/assets/javascripts/active_storage_drag_and_drop.js` by running `node_modules/webpack`.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/active_storage_drag_and_drop. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

## Code of Conduct

Everyone interacting in the ActiveStorageDragAndDrop project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/[USERNAME]/active_storage_drag_and_drop/blob/master/CODE_OF_CONDUCT.md).
