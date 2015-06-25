
(function ($) {

    var pluginName = 'timeInput';

    $[pluginName] = function (el, options) {
        var _this = this;

        this.el = el;
        this.$el = $(this.el);
        this.$hours = null;
        this.$minutes = null;

        var controlsTemplates = {
            wrapper: '<div class="time-input" />',
            hours: '<input type="text" class="time-input-hours" maxlength="2">',
            minutes: '<input type="text" class="time-input-minutes" maxlength="2">',
            divider: '<span class=time-input-divider>:</span>'
        };

        this.init = function () {
            this.buildControls();
        };

        this.buildControls = function () {
            this.$hours = $(controlsTemplates.hours);
            this.$minutes = $(controlsTemplates.minutes);

            this.$el
                .wrap(controlsTemplates.wrapper)
                .addClass('time-input-value')
                .hide();

            this.$el.parent()
                .append(this.$hours)
                .append(controlsTemplates.divider)
                .append(this.$minutes);

        };

        this.init();
        return $(this);
    };

    var publicMethods = {};

    var callPublicMethod = function (context, method, args) {
        var methodHandler = publicMethods[method];
        var obj = $(context).data(pluginName);

        if (typeof methodHandler == 'string') {
            return obj[methodHandler].apply(obj, args);
        }
        else if (typeof methodHandler == 'function') {
            return methodHandler.apply(obj, args);
        }
        else if (methodHandler === true) {
            return obj[method].apply(obj, args);
        }
        else {
            return false;
        }
    };

    $[pluginName].defaultOptions = {
        minTime: null,
        maxTime: null
    };

    $.fn[pluginName] = function (methodOrOptions) {
        if (publicMethods[methodOrOptions]) {
            return callPublicMethod(this, methodOrOptions, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            return this.each(function () {
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, (new $[pluginName](this, methodOrOptions)));
                }
            });
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on ' + pluginName + ' plugin');
            return false;
        }
    };

})(jQuery);