angular
  .module('app', [])
  .controller('IncreaseLimitController', ['$scope', function($scope) {
    $scope.value = 100;
  }])
  .directive('currencyNoCents', ['$locale', '$parse', '$filter', function($locale, $parse, $filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        min: '=',
        max: '='
      },
      link: function(scope, element, attrs, ctrl) {

        function clear(value) {
          if (!value) {
            return 0;
          }

          return parseInt(value.toString().replace(/[^\d]+/g, ''));
        }

        function format(value) {
          return $filter('currency')(value);
        }

        function render(value) {
          ctrl.$setViewValue(value);
          ctrl.$render();

          return value;
        }

        function validation(value) {
          if (scope.max) {
              ctrl.$setValidity("max", parseInt(value) <= parseInt(scope.max));
          }

          if (scope.min) {
              ctrl.$setValidity("min", parseInt(value) >= parseInt(scope.min));
          }
        }

        function modelValue(actualNumber) {
          var value = parseFloat(Math.round(actualNumber * 100) / 100).toFixed(2);

          validation(value);

          return parseInt(value);
        }

        ctrl.$formatters.push(function(value) {
          value = clear(value);
          value = format(value);

          return value;
        });

        ctrl.$parsers.push(function(inputValue) {
          var value = clear(inputValue);
          var lastValue = clear(ctrl.$$lastCommittedViewValue);

          var actualNumber = parseInt(lastValue) / 100;

          if (ctrl.$modelValue && (lastValue < ctrl.$modelValue)) {
            // adding
            var reminder = actualNumber % 1;
  					actualNumber -= reminder;
          } else if (ctrl.$modelValue === 0 && lastValue < 10) {
            actualNumber = lastValue;
          } else {
            //subtracting
            var reminder = actualNumber % 1;

            actualNumber -= reminder;

            if (actualNumber >= 10) {
              actualNumber += reminder * 100;
            }
          }

          var formattedValue = format(actualNumber);

          if (lastValue != formattedValue) {
            render(formattedValue);
          }

          return modelValue(actualNumber);
        });
      }
    };
  }]);
