angular.module('ui.thumbnail', [])

.provider('ThumbnailService', function() {

  this.defaults = {
    width: 100,
    height: 100
  };

  this.$get = ['$q', function($q) {
    var defaults = this.defaults;

    return {

      generate: function generate(src, opts) {
        var deferred = $q.defer();

        opts = opts || {};

        if (!opts.noDistortion) {
          opts.noDistortion = false;
        }
        
        this.load(src, opts).loaded.then(
          function success(canvas) {
            if (opts.returnType === 'blob') {
              if (typeof canvas.toBlob !== 'function') {
                return deferred.reject('Your browser doesn\'t support canvas.toBlob yet. Please polyfill it.');
              }

              try {
                canvas.toBlob(function(blob) {
                  // one may use blob-util to get a URL
                  deferred.resolve(blob);
                }, opts.type, opts.encoderOptions);
              } catch (ex) {
                deferred.reject(ex);
              }

            } else {
              if (typeof canvas.toDataURL !== 'function') {
                return deferred.reject('Your browser doesn\'t support canvas.toDataURL yet. Please polyfill it.');
              }

              try {
                var base64 = canvas.toDataURL(opts.type, opts.encoderOptions);
                deferred.resolve(base64);
              } catch (ex) {
                deferred.reject(ex);
              }
            }
          }
        );

        return deferred.promise;
      },

      load: function load(src, opts) {
        var canvas = this.createCanvas(opts);

        return {
          // creation is done
          created: $q.when(canvas),
          // wait for it
          loaded: this.draw(canvas, src, opts.noDistortion)
        };
      },

      draw: function draw(canvas, src, noDistortion) {
        var deferred = $q.defer();
        var self = this;

        var ctx = canvas.getContext('2d');
        // it seems that we cannot reuse image instance for drawing
        var img = new Image();

        img.onload = function onload() {
          
          var resized = canvas;
          if (noDistortion ){
            resized = self.resizeImage(img, canvas);
            canvas = self.updateCanvas(canvas, resized);
            ctx = canvas.getContext('2d');
          }
          
          // designated canvas dimensions should have been set
          ctx.drawImage(img, 0, 0, resized.width, resized.height);

          // loading is done
          deferred.resolve(canvas);
        };

        img.src = src;

        return deferred.promise;
      },

      resizeImage: function resizeImage(img, canvas) {
        var imageRatio = img.width / img.height;
        
        var newHeight = canvas.width / imageRatio;
        var newWidth = canvas.height * imageRatio;
        
        var heightDiff = newHeight - canvas.height;
        var widthDiff = newWidth - canvas.width;
        
        if (widthDiff >= heightDiff) {
          return dimensions(canvas.width, canvas.width / imageRatio);
        } else {
          return dimensions(canvas.height * imageRatio, canvas.height);
        }

        function dimensions(width, height){
          return {
            width: width, 
            height: height
          };
        }
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

  }]; // $get

})

.directive('uiThumbnail', ['ThumbnailService', function(ThumbnailService) {

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

}]);
