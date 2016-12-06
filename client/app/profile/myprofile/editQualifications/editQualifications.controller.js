'use strict';

angular.module('digitalVillageApp')
  .controller('EditQualificationsCtrl', function ($scope, $document, Business) {

    var self= this;
    self.showpopup = false;
    self.newQualification = "";
    self.qualifications = [];
    self.qualMaxDate = new Date();
    self.dirty = false;
    self.today = moment().startOf('day');
    self.defaultOverflow = $document.find('body').css('overflow');
    self.defaultOverflowY = $document.find('html').css('overflow-y');

    self.showDatePicker = function(){
      self.showpopup = true;
      $document.find('body').css({'overflow':'hidden'});
      $document.find('html').css({'overflow-y':'scroll'});
      self.init();
    };


    self.cancel = function(){
      $document.find('body').css({overflow:self.defaultOverflow});
      $document.find('html').css({'overflow-y':self.defaultOverflowY});
      self.showpopup = false;
    };


    self.dateToString = function(dt) {
      const mom = moment(dt);
      return mom.format('DD/MM/YYYY');
    };

    self.stringToDate = function(str) {
      return moment(str, 'DD/MM/YYYY').toDate();
    };

    self.errors = [];
    self.errorsPresent = false;

    self.init = function() {
      self.dirty = false;

      self.qualifications = angular.copy(self.datamodel.qualifications);

      for(var i=0;i<self.datamodel.qualifications.length; i++){
        if(self.qualifications[i].endDate === null || self.qualifications[i].endDate === ""){
          self.qualifications[i].endDate = "";
          self.qualifications[i].endDateStr = "";
        }else{
          self.qualifications[i].endDate = new Date(self.qualifications[i].endDate);
          self.qualifications[i].endDateStr = self.dateToString(self.qualifications[i].endDate);
        }
        self.qualifications[i].fromDate = new Date(self.qualifications[i].fromDate);
        self.qualifications[i].fromDateStr = self.dateToString(self.qualifications[i].fromDate);
      }

      self.validate();
    };

    self.valueChanged = function() {
      self.validate();
      self.dirty = true;
    };

    self.validate = function() {
      self.errorsPresent = false;
      self.errors = self.qualifications.map(qualification => {
        let err = {};

        let fromDate = moment(qualification.fromDateStr, 'DD/MM/YYYY');
        let endDate = moment(qualification.endDateStr, 'DD/MM/YYYY');

        // Entered a name?
        if(!qualification.name) {
          err.titleRequired = true;
          self.errorsPresent = true;
        }

        // From date with the right pattern?
        if(!qualification.fromDateStr) {
          err.fromRequired = true;
          self.errorsPresent = true;
        } else if(qualification.fromDateStr.length != 10 || !fromDate.isValid()) {
          err.fromPattern = true;
          self.errorsPresent = true;
        } else if(fromDate.diff(self.today) > 0) {
          err.cannotBeFuture = true;
          self.errorsPresent = true;
        }

        // If an end date, right pattern?
        if(qualification.endDateStr && (qualification.endDateStr.length != 10 || !endDate.isValid())) {
          err.endPattern = true;
          self.errorsPresent = true;
        }

        // Is the end before the start?
        if(endDate.isValid() && fromDate.isValid() && fromDate.isSameOrAfter(endDate)) {
          err.endBeforeStart = true;
          self.errorsPresent = true;
        }

        return err;
      });
    };

    self.addQualification = function () {
      if (self.newQualification.length > 0) {
        var objectToUpdate = {
          name: self.newQualification,
          description: "",
          fromDate: new Date(),
          fromDateStr: self.dateToString(new Date()),
          endDate: "",
          endDateStr: "",
          type: "Qualification"
        };
        self.qualifications.unshift(objectToUpdate);
        self.newQualification = "";
        self.dirty = true;
      }
    };

    self.deleteQualification = function (index) {
      self.qualifications.splice(index, 1);
      self.dirty = true;
    };

    self.saveQualificaton = function() {
      self.datamodel.qualifications = self.qualifications;

      self.datamodel.qualifications.forEach(qualification => {
        if(qualification.fromDateStr){
          qualification.fromDate = self.stringToDate(qualification.fromDateStr);
        }
        if(qualification.endDateStr){
          qualification.endDate = self.stringToDate(qualification.endDateStr);
        }

      });

      Business.update({id: self.datamodel._id, qualifications: self.datamodel.qualifications});
      self.cancel();
    };
    self.cancelQualificaton = function() {
      Business.update({id: self.datamodel._id, qualifications: self.datamodel.qualifications});
    };

  });
