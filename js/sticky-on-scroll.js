;(function($) {
    var Sticky = function(element, opts) {
        var atInitShowing = false,
            theSticky = this,
            $thisElm = $(element),
            $theOperator = $thisElm.find(".sticky-operator"),
            $theContent = $thisElm.find(".sticky-content");
        this.$element = $thisElm;
        this.options = opts;

        this.$element.find(".sticky-header").html(opts.header);
        if(opts.slide) {
            var $next = $("<a href='#'></a>").addClass("next-btn").html(opts.next),
                $prev = $("<a href='#'></a>").addClass("prev-btn").html(opts.prev);
            $theContent.before($next).before($prev);
        }
        if(localStorage) {
            var currentState = localStorage.getItem(opts.position + "StickyOff");
            if(opts.initState === "scroll") {
                localStorage.setItem(opts.position + "StickyOff", "scroll");
            } else {
                /scroll/.test(currentState) && localStorage.setItem(opts.position + "StickyOff", opts.initState);
            }
        }
        $(element).on("click", ".sticky-operator", function(e) {
            e.preventDefault();
            e.stopPropagation();
            var openFn = function($elm) {
                $elm.toggleClass("sticky-active");
                var cond = opts.height / 2,
                    state = $elm.is(".sticky-active") ? ("show") : ("hide"),
                    animateArgs = {};
                    animateArgs[opts.position] = (state === "show") ? opts.positionRange[1] : opts.positionRange[0];
                theSticky.render();
                $thisElm.animate(animateArgs, {
                    duration: atInitShowing ? 0 : opts.duration,
                    complete: function() {
                        opts[state === "show" ? "onShown" : "onHidden"]();
                    }
                });
                atInitShowing = false;
                $elm.html(opts.operator[state === "show" ? 0 : 1]);
                opts[state === "show" ? "onShow" : "onHide"]();
                if(localStorage) {
                    var currentState = localStorage.getItem(opts.position + "StickyOff");
                    currentState = currentState && /scroll/.test( currentState ) ? "scroll" : "";
                    localStorage.setItem(opts.position + "StickyOff", [ currentState, state ].join("-"));
                }
            };
            ($(window).height() > $thisElm.height() * 2) && openFn($(this));
        }).on("click", ".next-btn", function(e) {
            e.preventDefault();
            e.stopPropagation();
            opts.onNext();
        }).on("click", ".prev-btn", function(e) {
            e.preventDefault();
            e.stopPropagation();
            opts.onPrev();
        });
        switch(opts.initState) {
            case "show":
                atInitShowing = true;
                if(localStorage) {
                    var storageCond = localStorage.getItem(opts.position + "StickyOff");
                    if(!storageCond || storageCond === "show") {
                        $theOperator.trigger("click");
                    } else {
                        $theOperator.html(opts.operator[1]);
                    }
                } else {
                    $theOperator.trigger("click");
                }
                break;
            case "scroll":
                $(window).on("scroll", function() {
                    var state = $theOperator.is(".sticky-active") ? ("show") : ("hide");
                    if (opts.showAt < $(document).scrollTop()) {
                        var storageCond = true;
                        if (localStorage) {
                            storageCond = /scroll/.test( localStorage.getItem( opts.position + "StickyOff" ) );
                        }
                        if (storageCond && state === "hide") {
                            $theOperator.trigger("click");
                            $(element).on("click", ".sticky-operator", function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                var state = $(this).is(".sticky-active") ? ("show") : ("hide");
                                if (state === "hide" && opts.initState === "scroll") {
                                    if(localStorage)
                                        localStorage.setItem(opts.position + "StickyOff", true);
                                    $(element).off("click", ".sticky-operator", arguments.callee);
                                };
                            });
                        }
                        $(document).off("scroll", arguments.callee);
                    }
                });
            default:
                $theOperator.html(opts.operator[1]);
                break;
        }
        if($(window).height() < $thisElm.height() * 2 || opts.bgClose) {
            $thisElm.on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var state = $theOperator.is(".sticky-active") ? ("show") : ("hide");
                state === "show" && $theOperator.trigger("click");
            });
        }
        opts.onInit(this);
    };
    Sticky.prototype = {
        constructor: Sticky,
        render: function(selector, newContent) {
            var $thisElm = this.$element,
                $theContent = $thisElm.find(".sticky-content"),
                content = newContent || this.options.content;
            if (typeof selector === "string")
              $theContent = $theContent.find(selector);
            if(typeof content !== "function") {
                $theContent.html(content);
            } else {
                content($theContent);
            }
            $thisElm.find(".sticky-content").css("height", "auto");
        },
        update: function(selector, newContent) {
            this.render(selector, newContent);
        },
        set: function(name, val) {
            (typeof this.options[name] === typeof val) && ( this.options[name] = val );
        }
    };
    $.fn.stickyOnScroll = function(options) {
        var $thisElm = $(this),
            $theContent = $thisElm.find(".sticky-content"),
            opts = $.extend({}, $.fn.stickyOnScroll.defaults, options);
        $thisElm.data("stickyOnScroll", new Sticky(this, opts));
        return $thisElm;
    };
    jQuery.fn.stickyOnScroll.defaults = {
        header: "stick-header",
        content: "stick-content",
        next: "next",
        prev: "prev",
        duration: 1000,
        position: "bottom",
        positionRange: [-60, 20],
        operator: ["v", "^"],
        initState: "hide",
        showAt: 0,
        slide: false,
        bgClose: false,
        onInit: function() {},
        onShow: function() {},
        onHide: function() {},
        onShown: function() {},
        onHidden: function() {},
        onNext: function() {},
        onPrev: function() {}
    };
})(window.jQuery);