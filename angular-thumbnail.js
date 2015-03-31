angular.module('ui.thumbnail', [])

.provider('ThumbnailService', function() {

  this.defaults = {
    width: 100,
    height: 100
  };

  this.$get = function($q) {
    var defaults = this.defaults;

    return {

      generate: function generate(url, opts) {
        var deferred = $q.defer();

        opts = opts || {};

        this.load(url, opts).loaded.then(
          function success(canvas) {
            if (opts.returnType === 'blob') {
              if (typeof canvas.toBlob !== 'function') {
                return deferred.reject('Your browser doesn\'t support canvas.toBlob yet. Please polyfill it.');
              }

              canvas.toBlob(function(blob) {
                // one may use blob-util to get a URL
                deferred.resolve(blob);
              }, opts.type, opts.encoderOptions);

            } else {
              if (typeof canvas.toDataURL !== 'function') {
                return deferred.reject('Your browser doesn\'t support canvas.toDataURL yet. Please polyfill it.');
              }

              var base64 = canvas.toDataURL(opts.type, opts.encoderOptions);
              deferred.resolve(base64);
            }
          }
        );

        return deferred.promise;
      },

      load: function load(url, opts) {
        var canvas = this.createCanvas(opts);

        return {
          // creation is done
          created: $q.when(canvas),
          // wait for it
          loaded: this.draw(canvas, url)
        };
      },

      draw: function draw(canvas, url) {
        var deferred = $q.defer();

        var ctx = canvas.getContext('2d');
        // it seems that we cannot reuse image instance for drawing
        var img = new Image();

        img.onload = function onload() {
          // designated canvas dimensions should have been set
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // loading is done
          deferred.resolve(canvas);
        };

        img.src = url;

        return deferred.promise;
      },

      createCanvas: function createCanvas(opts) {
        var canvas = angular.element('<canvas></canvas>')[0];

        return this.updateCanvas(canvas, opts);
      },

      updateCanvas: function updateCanvas(canvas, opts) {
        opts = opts || {};

        var w = Number(opts.width) || defaults.width;
        var h = Number(opts.height) || defaults.height;

        canvas.width = w;
        canvas.height = h;

        return canvas;
      }

    };

  }; // $get

})

.directive('uiThumbnail', function(ThumbnailService) {

  return {

    restrict: 'E',

    scope: {
      src: '=',
      opts: '='
    },

    link: function link(scope, el, attrs) {
      var promises = ThumbnailService.load(scope.src, scope.opts);

      promises.created.then(
        function created(canvas) {
          // can be appended at this point
          el.append(canvas);
        }
      );

      promises.loaded.then(
        function loaded(canvas) {
          // create watches
          scope.$watch('src', function(newSrc) {
            ThumbnailService.draw(canvas, newSrc);
          });
          scope.$watchCollection('opts', function(newOpts) {
            ThumbnailService.updateCanvas(canvas, newOpts);
            // need to redraw
            ThumbnailService.draw(canvas, scope.src);
          });
        }
      );
    }

  };

})

;