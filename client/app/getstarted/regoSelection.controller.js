'use strict';

class RegoSelectionController {
  constructor(Auth, Business, $state) {
    this._Business = Business;
    this._$state = $state;

    Auth.getCurrentUser(null).then(({ _id, firstName }) => {
      this.firstName = firstName;
    });
    Business.mine().$promise.then(({ typeAtRegistration }) => {
      // reset the registration type if the user has returned to this page. primarily for the case when
      // browse was selected initially and then the user logs in. if we don't reset here they'll be able to
      // use the navbar rather than being funnelled through this controller's selection choices.
      if (typeAtRegistration) {
        Business.updateMine({ typeAtRegistration: 'pending' });
      }
    });
  }

  selected(typeAtRegistration) {
    const typeAction = {
      buyer: {
        nextState: 'getstarted-buyer',
        businessAccepts: { acceptsCash: false, acceptsSwaps: false }
      },
      supplier: {
        nextState: 'getstarted-seller',
        businessAccepts: { acceptsCash: true, acceptsSwaps: false }
      },
      swap: {
        nextState: 'getstarted-swap',
        businessAccepts: { acceptsCash: true, acceptsSwaps: true }
      },
      browse: {
        nextState: 'skill-search',
        businessAccepts: { acceptsCash: true, acceptsSwaps: true }
      }
    };

    const { nextState, businessAccepts } = typeAction[typeAtRegistration];
    const businessUpdate = Object.assign({ typeAtRegistration }, businessAccepts);
    this._Business.updateMine(businessUpdate).$promise
      .then(() => this._$state.go(nextState));
  }
}

angular.module('digitalVillageApp')
  .controller('RegoSelectionCtrl', RegoSelectionController);
