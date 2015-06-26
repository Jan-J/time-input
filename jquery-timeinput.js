
(function ($) {

    var pluginName = 'timeInput';

    $[pluginName] = function (el, options) {
        var _this = this;

        this.opts = $.extend({}, $[pluginName].defaultOptions, options);

        this.el = el;
        this.$el = $(this.el);
        this.$wrapper = null;
        this.$hours = null;
        this.$minutes = null;
        this.$inputs = null;

        var controlsTemplates = {
            wrapper: '<div class="time-input" />',
            hours: '<input type="text" class="time-input-hours" maxlength="2">',
            minutes: '<input type="text" class="time-input-minutes" maxlength="2">',
            divider: '<span class=time-input-divider>:</span>'
        };
        var timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        this.init = function () {
            this.buildControls();
            this.initEvents();
            this.initValue();
        };

        this.destroy = function () {
            this.$wrapper.children().not(this.$el).remove();
            this.$el
                .unwrap()
                .removeData(pluginName)
                .removeClass('time-input-value')
                .attr('type', 'text');
        };

        this.buildControls = function () {
            this.$hours = $(controlsTemplates.hours);
            this.$minutes = $(controlsTemplates.minutes);
            this.$inputs = this.$hours.add(this.$minutes);

            this.$el
                .wrap(controlsTemplates.wrapper)
                .addClass('time-input-value')
                .attr('type', 'hidden');

            this.$wrapper = this.$el.parent()
                .append(this.$hours)
                .append(controlsTemplates.divider)
                .append(this.$minutes);

            var tabindex = this.$el.attr('tabindex');
            if (!isNaN(tabindex)) {
                this.setTabindex(tabindex);
            }
        };

        this.setTabindex = function (tabindex) {
            this.$inputs.attr('tabindex', tabindex);
        };

        this.initEvents = function () {
            // select whole input content on focus
            this.$inputs.on('focus', function () {
                var $this = $(this);
                setTimeout(function () {
                    $this.select();
                }, 0);
            });

            // listen to events
            this.$inputs.on('change keyup', function (event) {
                // correct inputs on field change, validate them only on key up
                if (event.type == 'change') {
                    _this.correctInputs();
                } else {
                    _this.validateInputs();
                }
            });
        };

        this.initValue = function () {
            var value = this.opts.value;
            if (value === null) {
                value = this.getHiddenValue();
            }

            this.setValue(value, false);
        };

        this.parseTimeOption = function (value, defaultValue) {
            if (value === null) {
                return defaultValue;
            }

            if (timeFormatRegex.test(value)) {
                return value;
            }

            if (typeof value === 'function') {
                value = value();
            } else {
                value = $(value).val();
            }

            if (!timeFormatRegex.test(value)) {
                if (value !== null) {
                    console.warn('Value is not in valid time format.', value);
                }

                return defaultValue;
            }

            return value;
        };

        this.minTime = function () {
            return this.parseTimeOption(this.opts.minTime, '00:00');
        };
        this.maxTime = function () {
            return this.parseTimeOption(this.opts.maxTime, '23:59');
        };

        this.isBeforeMinTime = function (time) {
            var timeParts = this.splitTime(time);
            var minTimeParts = this.splitTime(this.minTime());

            if (timeParts[0] < minTimeParts[0]) {
                return true;
            } else if (timeParts[0] == minTimeParts[0] && timeParts[1] < minTimeParts[1]) {
                return true;
            } else {
                return false;
            }
        };

        this.isAfterMaxTime = function (time) {
            var timeParts = this.splitTime(time);
            var maxTimeParts = this.splitTime(this.maxTime());

            if (timeParts[0] > maxTimeParts[0]) {
                return true;
            } else if (timeParts[0] == maxTimeParts[0] && timeParts[1] > maxTimeParts[1]) {
                return true;
            } else {
                return false;
            }
        };

        this.formatTimePart = function (value) {
            return (value < 10 ? '0' : '') + value;
        };

        this.sanitizeHours = function (hours) {
            hours = parseInt(hours) || 0;
            hours = Math.min(23, Math.max(0, hours));

            return this.formatTimePart(hours);
        };

        this.sanitizeMinutes = function (minutes) {
            minutes = parseInt(minutes) || 0;
            minutes = Math.min(59, Math.max(0, minutes));

            return this.formatTimePart(minutes);
        };

        this.splitTime = function (time) {
            time = time || '';
            var timeParts = time.split(':');

            if (timeParts.length !== 2) {
                timeParts = [0, 0];
            }

            return [this.sanitizeHours(timeParts[0]), this.sanitizeMinutes(timeParts[1])];
        };

        this.sanitizeTime = function (time) {
            return this.splitTime(time).join(':');
        };

        this.constrainTime = function (time) {
            time = this.sanitizeTime(time);

            if (this.isBeforeMinTime(time)) {
                return this.minTime();
            } else if (this.isAfterMaxTime(time)) {
                return this.maxTime();
            } else {
                return time;
            }
        };

        this.joinTime = function (hours, minutes) {
            return hours + ':' + minutes;
        };

        this.correctInputs = function () {
            this.setValue(this.joinTime(this.$hours.val(), this.$minutes.val()), true);

            this.setValidity('hours', true);
            this.setValidity('minutes', true);
        };

        this.setValue = function (value, triggerChangeEvent) {
            var timeParts = this.splitTime(this.constrainTime(value));
            this.setValueFromTimeParts(timeParts, triggerChangeEvent);
        };

        this.setValueFromTimeParts = function (timeParts, triggerChangeEvent) {
            this.setVisibleValue(timeParts);
            this.setHiddenValue(this.getVisibleValue(), triggerChangeEvent);
        };

        this.getVisibleValue = function () {
            return this.joinTime(this.$hours.val(), this.$minutes.val());
        };

        this.setVisibleValue = function (timeParts) {
            this.$hours.val(timeParts[0]);
            this.$minutes.val(timeParts[1]);
        };

        this.getHiddenValue = function () {
            return this.$el.val();
        };

        this.setHiddenValue = function (value, triggerChangeEvent) {
            this.$el.val(value);

            if (triggerChangeEvent) {
                this.$el.trigger('change');
            }
        };

        this.setOptions = function (options) {
            $.extend(this.opts, options);
        };

        this.validateInputs = function () {
            var timeParts = [this.$hours.val(), this.$minutes.val()];
            var constrainedTimeParts = this.splitTime(this.constrainTime(this.joinTime(this.$hours.val(), this.$minutes.val())));

            this.setValidity('hours', parseInt(timeParts[0]) == parseInt(constrainedTimeParts[0]));
            this.setValidity('minutes', parseInt(timeParts[1]) == parseInt(constrainedTimeParts[1]));
        };

        this.setValidity = function (timePartName, isValid) {
            this.$wrapper.toggleClass('time-input-invalid-' + timePartName, !isValid);
        };

        this.init();
    };

    var publicMethods = {
        correctInputs: true,
        validateInputs: true,
        setValue: true,
        setOptions: true,
        setTabindex: true,
        destroy: true
    };

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
        maxTime: null,
        value: null
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