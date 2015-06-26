angular.module('jquery', [])

    .directive('ngTimeInput', function ($parse, $timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: '=',
            link: function (scope, element, attrs, ctrl) {
                var optionsFn = $parse(attrs.ngTimeInput);

                var initIfNeeded = function () {
                    if (!element.data('timeInput')) {
                        element.timeInput(optionsFn(scope));
                    }
                };

                ctrl.$formatters.push(function (value) {
                    initIfNeeded();
                    element.timeInput('setValue', value);
                });

                element.on('change', function () {
                    scope.$apply(function () {
                        ctrl.$setViewValue(element.val());
                    });
                });

                scope.$watch(optionsFn, function (newValue) {
                    initIfNeeded();
                    element.timeInput('setOptions', newValue);
                }, true);

                attrs.$observe('tabindex', function (newValue) {
                    element.timeInput('setTabindex', newValue);
                });

                initIfNeeded();
            }
        }
    });
