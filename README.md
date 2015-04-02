# Angular Thumbnail
AngularJS thumbnail service to generate blob or base64 data as well as directive to display an image as thumbnail in canvas. Perfect for an [Ionic](http://ionicframework.com/) app.

## Demo
[http://kennyki.github.io/angular-thumbnail](http://kennyki.github.io/angular-thumbnail)

## Possible Usage
1. Generate thumbnail for pictures from gallery/camera to store locally or remotely in [PhoneGap](http://phonegap.com/)/[cordova](https://cordova.apache.org/) apps. You don't need a plugin for that.
1. Display thumbnail for pictures from gallery/local db in a list in [PhoneGap](http://phonegap.com/)/[cordova](https://cordova.apache.org/) apps. Because CSS resizing on many pictures can be very consuming.
1. Resizing before upload to a server.

## Anti-pattern
1. Generating thumbnails from large images in a desktop web application.
    - first of all, CSS resizing (setting `width` and `height`) should be sufficient as most of the desktop will have enough power to do it. *But*:
    - consider requesting for smaller images from the server.
    - if the images are external you should cache them in your own server and resize them there.

## Installation
1. Install through bower `bower install angular-thumbnail` or download the package manually.
1. In your index.html, import:
    1. *canvas-to-blob.min.js* only if you need to generate **blob** data
    1. *angular-thumbnail.min.js*
1. Add dependency to your module `angular.module('', ['ui.thumbnail']);`
1. Enable CORS `<access origin="*"/>` in the config.xml

## API

### Configurations

```
angular.module('', ['ui.thumbnail'])

.config(function(ThumbnailServiceProvider) {
  // otherwise both defaults to 100
  ThumbnailServiceProvider.defaults.width = 150;
  ThumbnailServiceProvider.defaults.height = 150;
})

;
```

### Directive

Hmm.. it's clearer in the demo's [source code](https://github.com/kennyki/angular-thumbnail/blob/gh-pages/index.html).

### Service

A `ThumbnailService` dependency can be injected into a controller.

#### ThumbnailService.generate(src, opts)

- Parameters:
    - `src`: either a **url** or **base64** string
    - `opts`: an optional object of
        - `width`: number (defaults to 100)
        - `height`: number (defaults to 100)
        - `returnType`: 'blob' (defaults to 'base64')
        - `type`: 'image/jpeg' (defaults to 'image/png')
        - `encoderOptions`: A number between 0 and 1 indicating image quality if the requested type is 'image/jpeg' or 'image/webp'.

- Returns: a promise that resolves with a base64 string or blob