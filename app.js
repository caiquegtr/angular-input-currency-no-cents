angular
  .module('app', [])
  .controller('IncreaseLimitController', ['$scope', function($scope) {
    $scope.value = 100;
  }])
  .directive('currencyNoCents', ['$parse', '$filter', function ($parse, $filter) {
      return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        min: '=',
        max: '='
      },
      link: function(scope, element, attrs, ctrl) {

        function clear (value) {
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
              ctrl.$setValidity('max', parseInt(value) <= parseInt(scope.max));
          }

          if (scope.min) {
              ctrl.$setValidity('min', parseInt(value) >= parseInt(scope.min));
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

          var unformattedViewValueWithZeros = clear(inputValue);

          // removing zeros from unformattedViewValueWithZeros to get the actual value
          var actualNumber = unformattedViewValueWithZeros / 100;

          if (ctrl.$modelValue && (actualNumber < ctrl.$modelValue)) {
            // deleting
  		      actualNumber -= actualNumber % 1;

          } else if (ctrl.$modelValue === 0 && unformattedViewValueWithZeros < 10) {
            // single unit
            actualNumber = unformattedViewValueWithZeros;

          } else {
            // writing
            var reminder = actualNumber % 1;

            actualNumber -= reminder;

            if (actualNumber >= 10) {
              actualNumber += reminder * 100;
            }
          }

          var formattedValue = format(actualNumber);

          if (inputValue !== formattedValue) {
            render(formattedValue);
          }

          return modelValue(actualNumber);
        });
      }
    };
}]);
