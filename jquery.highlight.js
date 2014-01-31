(function ($) {
  var $window = $(window);
  var $document = $(document);
  var $body = $('body');

  $.fn.highlight = function(options) {
    var opts = $.extend({}, $.fn.highlight.defaults, options);
    if ($.fn.highlight.highlighting && !opts.force) return;

    if (this.first().is($window)) {
      if (!$.fn.highlight.highlighting) {
        $.fn.highlight.build(opts);
        $.fn.highlight.highlighting = true;
      }
      $.fn.highlight.show(opts);
      return this;
    } else {
      var extOpts = $.extend(opts, {
        focus: this
      });
      $window.highlight(extOpts);
      return this;
    }
  };

  $.fn.highlight.defaults = {
    padding: 0,
    dismissable: false
  };

  $.fn.highlight.build = function(opts) {
    $body.append('<div class="highlight" id="highlight_top"></div>');
    $body.append('<div class="highlight" id="highlight_right"></div>');
    $body.append('<div class="highlight" id="highlight_bottom"></div>');
    $body.append('<div class="highlight" id="highlight_left"></div>');
    console.log("sup");

    $.fn.highlight.$panes = {
      top: $('#highlight_top'),
      right: $('#highlight_right'),
      bottom: $('#highlight_bottom'),
      left: $('#highlight_left'),
      all: $('.highlight')
    };

    $.fn.highlight.$panes.all.bind('mousedown', function() {
      $.fn.highlight.dismiss(opts);
    });
  };

  $.fn.highlight.rectForFocus = function($focus, opts) {
    var padding = opts.padding;
    var rect = {
      top: null,
      left: null,
      right: null,
      bottom: null
    };
    $focus.each(function() {
      var $this = $(this);
      var offset = $this.offset();
      var thisRight = offset.left + $this.outerWidth();
      var thisBottom = offset.top + $this.outerHeight();

      if (rect.top === null) {
        rect.top = offset.top;
      } else {
        rect.top = offset.top < rect.top ? offset.top : rect.top;
      }

      if (rect.left === null) {
        rect.left = offset.left;
      } else {
        rect.left = offset.left < rect.left ? offset.left : rect.left;
      }

      if (rect.right === null) {
        rect.right = thisRight;
      } else {
        rect.right = thisRight > rect.right ? thisRight : rect.right;
      }

      if (rect.bottom === null) {
        rect.bottom = thisBottom;
      } else {
        rect.bottom = thisBottom > rect.bottom ? thisBottom : rect.bottom;
      }
    });

    if (opts.padding) {
      rect.top -= opts.padding;
      rect.left -= opts.padding;
      rect.bottom += opts.padding;
      rect.right += opts.padding;
    }

    return rect;
  };

  $.fn.highlight.adjustPanes = function(rect, opts) {
    var winWidth = Math.max($window.width(), $document.width());
    var winHeight = Math.max($window.height(), $document.height());

    $.fn.highlight.$panes.top.css({
      top: 0,
      left: 0,
      width: winWidth,
      height: Math.ceil(rect.top)
    });

    $.fn.highlight.$panes.right.css({
      top: Math.ceil(rect.top),
      left: Math.floor(rect.right),
      width: Math.floor(winWidth - rect.right),
      height: Math.floor(rect.bottom - rect.top)
    });

    $.fn.highlight.$panes.bottom.css({
      top: Math.ceil(rect.bottom),
      left: 0,
      width: winWidth,
      height: Math.floor(winHeight - rect.bottom)
    });

    $.fn.highlight.$panes.left.css({
      top: Math.ceil(rect.top),
      left: 0,
      width: Math.ceil(rect.left),
      height: Math.floor(rect.bottom - rect.top)
    });

    if (!$.fn.highlight.panesVisible) {
      $.fn.highlight.panesVisible = true;
      $.fn.highlight.$panes.all.stop().css({opacity: 0}).show()
        .animate({opacity: 0.5}, 150, 'linear', function() {
          $.fn.highlight.$panes.all.addClass('active');
        });
    }
  };

  // Opts.$message is the element wrapper
  // Opts.message is the message message
  // Opts.messagePosition is the message location
  // Opts.messageClass adds more to the class
  $.fn.highlight.messageForRect = function(rect, opts) {
    if (!opts.$message) {
      $body.append('<div id="highlight_message"></div>');
      opts.$message = $('#highlight_message').css({opacity: 0}).addClass(opts.messageClass);
      opts.$message.html(opts.message);
      if (opts.dismissable) opts.$message.append('<a class="dismiss" href="#"></a>');
      opts.$message.append('<span class="check">&nbsp;&#x2713;</span>');
      opts.$message.append('<span class="xmark">&nbsp;&#x2717;</span>');
      opts.$message.addClass(opts.messagePosition || 'below');
    }
    switch (opts.messagePosition) {
      case 'above':
        opts.$message.css({
          top: rect.top - 10 - opts.$message.outerHeight(),
          left: rect.left + ((rect.right - rect.left) / 2 - opts.$message.outerWidth() / 2)
        });
        break;
      case 'left':
        opts.$message.css({
          top: rect.top + ((rect.bottom - rect.top) / 2 - opts.$message.outerHeight() / 2),
          left: rect.left - 10 - opts.$message.outerWidth()
        });
        break;
      case 'right':
        opts.$message.css({
          top: rect.top + ((rect.bottom - rect.top) / 2 - opts.$message.outerHeight() / 2),
          left: rect.right + 10
        });
        break;
      default:
        opts.$message.css({
          top: rect.bottom + 10,
          left: rect.left + ((rect.right - rect.left) / 2 - opts.$message.outerWidth() / 2)
        });
       break;
    }
    opts.$message.on('.dismiss', 'click', function(e) {
      e.preventDefault();
      $.fn.highlight.dismiss(opts);
      return false;
    });

    var offsetTop = opts.$message.offset().top;
    var height = opts.$message.outerHeight();
    var $window = $(window);
    var windowHeight = $window.height();
    var scrollTop = $window.scrollTop();

    var callback = function() {
      opts.$message.stop().animate({opacity: 1}, 100);
    };

    if ((offsetTop < scrollTop) || (offsetTop + height > scrollTop + windowHeight)) {
      $('html, body').animate({'scrollTop' : offsetTop -  60 }, function() { callback(); });
    } else {
      callback();
    }
  };

  $.fn.highlight.dismiss = function(opts) {
    $.fn.highlight.highlighting = false;
    $.fn.highlight.$panes.all.removeClass('active');
    $.fn.highlight.$panes.all.stop().animate({opacity: 0}, opts.animate === false ? 0 : 150, 'linear', function() {
      $(this).remove();
      $.fn.highlight.panesVisible = false;
      $.fn.highlight.$panes = null;
    });
    $.fn.highlight.cleanup(opts);
  };

  // opts.focus is the element you want to focus!
  // opts.focusOnInit means focus that thing if you want
  // opts.dismissEvent
  // opts.successEvent
  // opts.preventDefault
  // opts.skipValidation
  $.fn.highlight.show = function(opts) {
    var $focus = $(opts.focus);
    if (opts.focusOnInit) $focus.focus();
    if (opts.$message) opts.$message.removeClass('failed');
    var focusCallable = function() {
      var rect = $.fn.highlight.rectForFocus($focus, opts);
      if (opts.message) {
        $.fn.highlight.messageForRect(rect, opts);
      }
      $.fn.highlight.adjustPanes(rect, opts);
    };
    var focusCallableNoTransition = function() {
      $.fn.highlight.$panes.all.addClass('notransition');
      focusCallable();
    };
    // $window.bind('scroll.highlight', focusCallableNoTransition);
    $window.bind('resize.highlight', focusCallableNoTransition);
    focusCallable();

    if (opts.dismissEvent) $focus.bind(opts.dismissEvent + '.highlight', function(e) {
      if (opts.preventDefault) e.preventDefault();
    });

    if (opts.successEvent) $focus.bind(opts.successEvent + '.highlight', function(e) {
      if (opts.skipValidation) return;
      if (opts.$message) opts.$message.stop().addClass('complete').delay(500);
      if (opts.preventDefault) e.preventDefault();
    });

    if (opts.failEvent) $focus.bind(opts.failEvent + '.highlight', function(e) {
      if (opts.skipValidation) return;
      if (opts.$message) {
        var messageTop = opts.$message.offset().top;
        opts.$message.stop().addClass('failed')
          .animate({top: messageTop - 10}, 100, 'easeOutQuad', function() {
          opts.$message.animate({top: messageTop}, 500, 'easeOutBounce');
        });
      }
      clearTimeout($.fn.highlight.timeout);
      $.fn.highlight.timeout = setTimeout(function() {
        if (opts.skipValidation) return;
        $.fn.highlight.show(opts);
      }, 1000);
      if (opts.preventDefault) e.preventDefault();
    });

    opts.focus.each(function () {
      $(this).bind('keydown.highlight', function(e) {
        var key = event.which || event.keyCode;
        if (key === 13 || key === 9) {
          $(this).blur();
          e.preventDefault();
          return false;
        }
      });
    });
  };

  $.fn.highlight.cleanup = function(opts) {
    opts.focus.unbind('keydown.highlight');
    $window.unbind('scroll.highlight');
    $window.unbind('resize.highlight');
    if (opts.dismissEvent) focus.unbind(opts.dismissEvent + '.highlight');
    if (opts.successEvent) focus.unbind(opts.successEvent + '.highlight');
    if (opts.failEvent) focus.unbind(opts.failEvent + '.highlight');
    if (opts.$message) {
      $('#highlight_message').animate({opacity: 0}, opts.animate === false ? 0 : 100, 'linear', function() {
        opts.$message = null;
        $(this).remove();
      });
    }
  };
}(jQuery));
