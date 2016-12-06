'use strict';

angular.module('digitalVillageApp')
  .directive('editField', function () {
    return {
      templateUrl: 'app/my/editField/editField.html',
      restrict: 'EA',
      scope:{
        fieldType:"=",
        modelName:"=",
        modelObj:"=",
        saveBack:"=",
        serviceId:"=",
        tooltipText:"=",
        tooltipDirection:"=",
        labelText:"=",
        noTextLabel:"=",
        decoratedValue:"=",
        textareaLength:"=?",
        isRequired:"=?"
      },

      link: function (scope, element, attrs) {
        scope.toggle = false;
        scope.edit = {editText:"", $error:{required:false}};
        scope.tooltip_direction = attrs.tooltipDirection?attrs.tooltipDirection:"right";
        scope.setEdit = function(){
          scope.toggle = !scope.toggle;
          scope.edit.editText = scope.modelObj;
        };
        scope.cancelEdit = function(){
          scope.edit.$error.required = false;
          scope.toggle = !scope.toggle;
        };
        scope.saveEdit =  function(){
          scope.edit.$error.required = false;
          if(scope.isRequired && (scope.edit.editText  ===  undefined ||scope.edit.editText === "" )){
            scope.edit.editText = scope.modelObj;
            scope.edit.$error.required = true;
            return;
          }
          scope.modelObj = scope.edit.editText.trim();
          scope.toggle = !scope.toggle;
          var objToSave = {id:scope.serviceId};
          objToSave[scope.modelName] = scope.modelObj;
          scope.saveBack(objToSave);
        };
      }
    };
  });
