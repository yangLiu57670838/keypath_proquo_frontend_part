'use strict';

angular.module('digitalVillageApp')
  .service('Document', function (Config, $q, Business, $location) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    let self = this;
    self.keySet = false;
    self._getCustomerTextJsonFilePath = 'https://' + $location.host() + "/assets/json/filestack-dialog.json";

    // Ensure the API key is set before all operations
    self._setKey = function() {
      let deferred = $q.defer();

      if(self.keySet) {
        deferred.resolve(true);
      } else {
        // Set the api key
        Config.get('FILESTACK_API_KEY').then(function(key) {
          filepicker.setKey(key);
          self.keySet = true;
          deferred.resolve(true);
        }, deferred.reject);
      }


      return deferred.promise;
    };

    // type can be one of 'user' or 'logo'
    // Avatars must be cropped to square
    self.uploadAvatar = function() {
      let deferred = $q.defer();

      self._setKey().then((keySet) => {
        filepicker.pickAndStore(
          {
            mimetypes:['image/jpeg', 'image/png', 'image/svg'],
            cropRatio: 1,
            cropForce: true,
            services: ['CONVERT', 'COMPUTER'],
            conversions: ['crop', 'rotate', 'filter'],
            multiple: false,
            customText: self._getCustomerTextJsonFilePath
          },
          {
            location:"S3"
          },
          deferred.resolve
        );
      });

      return deferred.promise;
    };

    self.uploadImage = function() {
      let deferred = $q.defer();

      self._setKey().then((keySet) => {
        filepicker.pickAndStore(
          {
            mimetype:"image/*",
            cropRatio: 0,
            services: ['CONVERT', 'COMPUTER'],
            conversions: ['crop','rotate', 'filter'],
            multiple: false,
            customText: self._getCustomerTextJsonFilePath
          },
          {
            location:"S3"
          },
          deferred.resolve
        )
      });

      return deferred.promise;
    };

    self.uploadAttachment = function(projectId) {
      let deferred = $q.defer();

      self._setKey().then((keySet) => {
        filepicker.pickAndStore(
          {
            mimetype:"*/*",
            services: ['COMPUTER'],
            multiple:false,
            customText: self._getCustomerTextJsonFilePath
          },
          {
            location:"S3",
            path: '/project/'+projectId+'/'
          },
          deferred.resolve
        )
      });

      return deferred.promise;
    };

    self.deleteAttachment = function(attachment) {
      let deferred = $q.defer();
      self._setKey().then((keySet) => {
        filepicker.remove(
          attachment,
          deferred.resolve
        )
      });
      return deferred.promise;
    };

  });
