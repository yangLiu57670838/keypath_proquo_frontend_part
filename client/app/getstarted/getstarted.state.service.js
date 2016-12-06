'use strict';

class GetStartedStateService {
  constructor(Auth, Business) {
    this._Auth = Auth;
    this._Business = Business;
  }

  /**
   * Returns a promise of the ui-router getstarted state the app should go to, or `undefined` if
   * we've finished getstarted (aka post-registration profile information capture).
   *
   * @param login `true` if the user is logging in
   */
  getStartedState(login = false) {
    return this._Auth.isLoggedIn(null).then(isLoggedIn => {
      if (!isLoggedIn) return;

      return this._Business.mine().$promise
        .then(({ needs, offers, typeAtRegistration }) => {
          switch (typeAtRegistration) {
            case 'init':
              return 'getstarted-nameinfo';
            case 'pending':
              return 'getstarted-selection';
            case 'browse':
              return login ? 'getstarted-selection' : undefined;
            case 'buyer':
              return !needs.length ? 'getstarted-buyer' : undefined;
            case 'supplier':
              return !offers.length ? 'getstarted-seller' : undefined;
            case 'swap':
              return !needs.length || !offers.length ? 'getstarted-swap' : undefined;
            case undefined: // applies to businesses created prior to the typeAtRegistration capture being implemented
              break;
            default:
              console.error('unexpected typeAtRegistration:', typeAtRegistration);
          }
        })
        .catch(({ status }) => {
          if (status === 404) {
            //this is for the case that user sign up with email and password and then just logout straight away;
            //in this case, when they log back in , there won't be a business record
            return 'getstarted-nameinfo';
          }
        });
    });
  }
}

angular.module('digitalVillageApp')
  .service('GetStartedStateService', GetStartedStateService);
