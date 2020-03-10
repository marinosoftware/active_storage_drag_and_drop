# Active Storage Drag and Drop

[![Gem Version](https://badge.fury.io/rb/active_storage_drag_and_drop.svg)](https://badge.fury.io/rb/active_storage_drag_and_drop)
[![Build Status](https://travis-ci.org/marinosoftware/active_storage_drag_and_drop.svg?branch=master)](https://travis-ci.org/marinosoftware/active_storage_drag_and_drop)
[![Test Coverage](https://api.codeclimate.com/v1/badges/13860b97c99c3a989176/test_coverage)](https://codeclimate.com/github/marinosoftware/active_storage_drag_and_drop/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/13860b97c99c3a989176/maintainability)](https://codeclimate.com/github/marinosoftware/active_storage_drag_and_drop/maintainability)
[![Yard Docs](http://img.shields.io/badge/yard-docs-blue.svg)](https://www.rubydoc.info/gems/active_storage_drag_and_drop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Provides a form helper to make it easy to make drag and drop file upload fields that work with
Rails' [ActiveStorage](https://github.com/rails/rails/tree/master/activestorage).

![Demo](./demo.webp)

## Table of Contents
  - [Installation](#installation)
  - [Usage](#usage)
    - [Strong Parameters](#strong-parameters)
    - [Options]('#options')
    - [Validation](#validation)
    - [JavaScript Events](#javascript-events)
    - [Upload Asynchronously](#upload-acsynchronously)
    - [Custom Upload Icons](#custom-upload-icons)
  - [Development](#development)
  - [Contributing](#contributing)
  - [License](#license)
  - [Code of Conduct](#code-of-conduct)

## Installation

Add this line to your application's Gemfile:
```ruby
gem 'active_storage_drag_and_drop'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install active_storage_drag_and_drop

Include the styles in your application css:
```css
/*
 *= require active_storage_drag_and_drop
 */
```

### Asset Pipeline - Rails < 6
Include `active_stroage_drag_and_drop.js` in your application's JavaScript bundle.
```javascript
//= require active_storage_drag_and_drop
```

### Webpacker - Rails >= 6

Use yarn to add the js package as a dependency:

    $ yarn add active_storage_drag_and_drop

Import the start function from the bundle and run it:
```javascript
import ActiveStorageDragAndDrop from 'active_storage_drag_and_drop'

ActiveStorageDragAndDrop.start()
```

## Usage

Add an ActiveStorage attachment to your model:
```ruby
class Message < ApplicationRecord
  has_one_attached :image
end
```
or add multiple ActiveStorage attachments to your model:
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
The first parameter is a symbol representing the method of the ActiveStorage attachment and an
optional second parameter sets the text on the drag and drop zone.
```ruby
form.drag_and_drop_file_field :images, 'Drag and drop images here!'
```
The content of the dropzone can also be passed as a block of ERB or HAML:
```haml
= form.drag_and_drop_file_field :images, disabled: false do
  %i.far.fa-images
  Drag images here!
```

### Strong Parameters

In your controller you can permit the params like so:
```ruby
# single file upload
params.permit(:message).require(:image)
# multiple upload
params.permit(:message).require(images: [])
```

### Options
Options for the nested file field can be passed as key value pairs. The helper accepts the same
options as the rails file_field form helper
[ActionView::Helpers::FormHelper#file_field](https://edgeapi.rubyonrails.org/classes/ActionView/Helpers/FormHelper.html#method-i-file_field)
```ruby
form.drag_and_drop_file_field :images, nil, disabled: true
```

### Validation

Like with the
[ActionView::Helpers::FormHelper#file_field](https://edgeapi.rubyonrails.org/classes/ActionView/Helpers/FormHelper.html#method-i-file_field)
you can pass a list of acceptable mime-types for client-side validation:
```ruby
form.drag_and_drop_file_field :images, nil, accept: 'image/png, image/jpeg, image/gif, image/tiff'
```
An additional `size_limit` option can be passed which provides validation on the maximum acceptable
filesize in bytes:
```ruby
form.drag_and_drop_file_field :images, nil, size_limit: 5_000_000 # 5MB upper limit on file size
```
When one of these errors occurs by default a JavaScript `'dnd-upload:error'` event is dispatched
and an alert detailing the validation error appears. To override this default behaviour listen
for the event and call `preventDefault()` on the event.

### JavaScript Events

| Event name | Event target | Event data (`event.detail`) | Description |
| --- | --- | --- | --- |
| `dnd-uploads:start` | `<form>` | None | All of the uploads begin either by submission of the form or a call to processUploadQueue() |
| `dnd-upload:initialize` | `<input>` | `{ id, file, iconContainer }` | Dispatched for every file before the UI elements representing the file are added to the dropzone, default can be prevented to add your own UI.  |
| `dnd-upload:placeholder` | `<input>` | `{ id, file, iconContainer }` | Paints the UI for each file that has been queued for attachment but hasn't been attached yet (e.g. after a failed validation in the form) can be prevented as above. |
| `dnd-upload:start` | `<input>` | `{ id, file, iconContainer }` | An upload is starting. |
| `dnd-upload:before-blob-request` | `<input>` | `{ id, file, iconContainer, xhr }` | Before making a request to your application for upload metadata. |
| `dnd-upload:before-storage-request` | `<input>` | `{ id, file, iconContainer, xhr }` | Before making a request to store a file. |
| `dnd-upload:progress` | `<input>` | `{ id, file, iconContainer, progress }` | Called as requests to store files progress. Default UI sets the width of the `direct-upload__progress` element. |
| `dnd-upload:cancel` | `<input>` | `{ id, file, iconContainer }` | A user triggered the cancelation of an upload, the upload is removed from the queue and the preventable default UI removes matching upload icons from the iconContainer. |
| `dnd-upload:error` | `<input>` | `{ id, file, iconContainer, error }` | An error occurred pertaining to a specific file. The default can be prevented to supply your own UI for errors. |
| `dnd-upload:end` | `<input>` | `{ id, file, iconContainer }` | An upload has ended. Default can be prevented to supply your own UI for the end of an upload. |
| `dnd-uploads:error` | `<form>` | `{ error }` | An error occurred unrelated to a specific file. The default can be prevented to supply your own UI for errors. |
| `dnd-uploads:end` | `<form>` | None | All uploads have ended. |

To override the default behaviour of any of these events catch them with an event listener and call
`preventDefault()` on the event:
```javascript
document.addEventListener('dnd-upload:error', function (event) {
  # do something…
  event.preventDefault()
})
```

### Upload Asynchronously
To asynchronously trigger uploading without form submission, import the processUploadQueue function
and pass the form containing the uploads and a callback function as arguments:
```javascript
import { processUploadQueue } from 'active_storage_drag_and_drop'

var callback = function(error) {
  if (error) {
    // …handle error…
  } else {
    // …do your stuff
  }
}

processUploadQueue(form, callback)
```
### Custom Upload Icons

To customise how the upload icons for each file are added to the DOM you pass an `iconPainter`
option to the start function e.g:

```javascript
import { start } from 'active_storage_drag_and_drop'

start({
  iconPainter (iconContainer, id, file, complete) {
    iconContainer.insertAdjacentHTML('beforeend', `
    <li data-direct-upload-id="${id}" class="direct-upload">
      <div class="direct-upload__progress" style="width: ${progress}"></div>
      ${file.name}
      <button class="direct-upload__remove">X</button>
    </li>
    `)
  }
})
```

The arguments that `iconPainter` receives are:
| Parameter | Type | Description |
| --- | --- | --- |
| `iconContainer` | `HTMLElement` | The element to insert the upload icon markup into. |
| `id` | `string` | A unique identifier which will be used for any future UI events on this upload. |
| `file` | `File` | The object representing the file and its metadata. |
| `complete` | `boolean` | Is true if the upload is finished and false otherwise. |
This is the default implementation:
```javascript
export function paintDefaultUploadIcon (iconContainer, id, file, complete) {
  const uploadStatus = (complete ? 'complete' : 'pending')
  const progress = (complete ? 100 : 0)
  iconContainer.insertAdjacentHTML('beforeend', `
  <div data-direct-upload-id="${id}">
    <div class="direct-upload direct-upload--${uploadStatus}">
      <div class="direct-upload__progress" style="width: ${progress}%"></div>
      <span class="direct-upload__filename">${file.name}</span>
      <span class="direct-upload__filesize">${fileSizeSI(file.size)}</span>
    </div>
    <a href='remove' class='direct-upload__remove'>X</a>
  </div>
  `)
}
```
All of the built in UI that manipulates these icons can be overriden by attaching to their event
and preventing the default behaviour. But to take advantage of the built in ui events though you should
follow these rules:
- The root level element must have a `data-direct-upload-id` attribute set to the id passed to `paintUploadIcon`.
- The progress section consists of a parent with the class `direct-upload` and a direct child with
  the class `direct-upload__progress`.
- The element that will cancel the upload when clicked has the class `direct-upload__remove`.

## Development

Install yarn to manage js dependencies. After checking out the repo, run `bin/setup` to install
dependencies. Then, run `rake test` to run the tests. You can also run `bin/console` for an
interactive prompt that will allow you to experiment.

Use `yarn dev` to build JavaScript files automatically on change. Use with
`gem 'active_storage_drag_and_drop', path: [local-gem-repo]` to develop and debug the gem in place
in a rails app. You can run the JS tests with `yarn test` and you can see the coverage as well as
the tests by running `yarn cover`.

After making changes to JavaScript run `yarn build` before committing changes to transpile the
JavaScript for production.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new
version, update the version number in `version.rb`, and then run `bundle exec rake release`, which
will create a git tag for the version, push git commits and tags, and push the `.gem` file to
[rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at
https://github.com/marinosoftware/active_storage_drag_and_drop. This project is intended to be a
safe, welcoming space for collaboration, and contributors are expected to adhere to the
[Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The gem is available as open source under the terms of the
[MIT License](https://opensource.org/licenses/MIT).

## Code of Conduct

Everyone interacting in the ActiveStorageDragAndDrop project’s codebases, issue trackers, chat
rooms and mailing lists is expected to follow the
[code of conduct](https://github.com/marinosoftware/active_storage_drag_and_drop/blob/master/CODE_OF_CONDUCT.md).
