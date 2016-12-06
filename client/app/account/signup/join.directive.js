'use strict';

angular.module('digitalVillageApp')
  .directive('abn', function(ABN, $document) {
    function link(scope, element, attrs, ngModel) {

      var ctrlDown = false, commDown =false;
      var ctrlKey = 17,
        ffCommKey = 224,        // Command key in firefox
        safLeftCommKey = 91,    // Left command key Safari/Chrome
        safRightCommKey = 93,   // Right command key Safari/Chrome
        vKey = 118,
        cKey = 67,
        aKey = 97;
      element.bind("keydown", function(e) {
        if (e.keyCode == ctrlKey || e.keyCode == ffCommKey || e.keyCode == safLeftCommKey || e.keyCode == safRightCommKey){
          ctrlDown = true;
          commDown = true;
        }
      });
      element.bind("keyup", function(e) {
        if (e.keyCode == ctrlKey || e.keyCode == ffCommKey || e.keyCode == safLeftCommKey || e.keyCode == safRightCommKey){
          ctrlDown = false;
          commDown = false;
        }
      });




      //accept numbers space
      element.bind("keypress", function(event) {
        var keyCode = event.which || event.keyCode;


        if (keyCode == ctrlKey) {
          ctrlDown = true;
        }

        if(keyCode >=48 && keyCode <=57 || keyCode == 32 || keyCode == 8 || (ctrlDown && commDown && (keyCode == vKey || keyCode == aKey)) ){
          return;
        }
        if (event.preventDefault) {
          event.preventDefault();
        }
      });

      //abn validator for local validation
      function validateABNDigits(abnValue) {
        if (!abnValue || abnValue.length != 11) {
          return false;
        } else {
          let weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
          let checkValue = 0;

          for (let i = 0; i < 11; i++) {
            let thisDigit = parseInt(abnValue[i]);
            if (i == 0) {
              checkValue = (thisDigit - 1) * weights[i];
            }
            else {
              checkValue += (thisDigit * weights[i])
            }
          }
          return checkValue % 89 == 0;
        }
      }


      ngModel.$validators.abn = function(modelValue) {
        return !modelValue || validateABNDigits(modelValue.replace(/ /g,''));
      };

      //format abn to xx xxx xxx xxx
      function formatABN(value){
        return !value? value:
                value.substr(0,2) + ' ' +
                value.substr(2,3) + ' ' +
                value.substr(5,3) + ' ' +
                value.substr(8,3) ;
      }
      var blurListener = function(){
        if(ngModel.$valid && !_.isEmpty(ngModel.$modelValue)) {
          ABN.get({abn: ngModel.$modelValue}).$promise.then(function(success) {
            scope.serverErrors = undefined;
          }, function(err) {
            if (err.data && (err.data.name == 'ValidationError' || err.data.name == 'LookupError')) {
              scope.serverErrors = err.data.errors
            }
          });
          element.val(formatABN(ngModel.$modelValue.replace(/ /g,'')));
        }
      };

      element.bind('blur', blurListener);
      ngModel.$formatters.push(formatABN);

      function parseABN(value){
        return !value? value:value.replace(/ /g,'')
      }
      ngModel.$parsers.unshift(parseABN);
    }

    return {
      require: 'ngModel',
      link: link
    };

  });
