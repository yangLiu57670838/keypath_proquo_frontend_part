'use strict';

angular.module('digitalVillageApp')
  .service('Social', function () {
    const social = this;

    social.getSocialTypes = function () {
      const socialTypes = [
        {label: "Facebook", value: "facebook", url:"facebook.com/"},
        {label: "Pinterest", value: "pinterest", url:"pinterest.com/"},
        {label: "Twitter", value: "twitter", url: "twitter.com/"},
        {label: "Linkedin", value: "linkedin", url: "linkedin.com/in/"},
        {label: "Googleplus", value: "googleplus", url:"plus.google.com/"},
        {label: "Instagram", value: "instagram", url:"instagram.com/p/"},
        {label: "Youtube", value: "youtube", url: "youtube.com/user/"}
      ];
      return socialTypes;
    };

    social.openUrl = function (socialUrl) {
      const socialType = social.getSocialTypes().find(socialType => socialUrl.urlIconImage === socialType.value);
      if (socialType) {
        window.open("https://" + socialType.url + socialUrl.url, '_blank');
      }
    };

    return social;
  });
