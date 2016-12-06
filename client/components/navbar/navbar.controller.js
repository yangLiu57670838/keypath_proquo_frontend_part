'use strict';

class NavbarCtrl {
  constructor($window, $scope, $state, Auth, $mdSidenav, $timeout, Notifications, modalService, Business, $location) {
    //injected services
    this._Business = Business;
    this._Auth = Auth;
    this._Notifications = Notifications;
    this._$mdSidenav = $mdSidenav;
    this._$window = $window;
    this._$timeout = $timeout;
    this._modalService = modalService;
    this._$state = $state;

    //local variables
    this.userInfo = undefined;
    this.currentState = this._$state.current;
    this.currentLocation = $location;
    this.menu = [];
    this.reloadImg = true;
    this.menu = [
      {
        'title': 'Browse',
        'state': 'skill-search',
        activeState: 'skill-search',
        secured: false,
        'icon': "icon-search"
      },
      {
        'title': 'Projects',
        'state': 'projects',
        activeState: 'projects',
        secured: true,
        'icon': "icon-projects"
      },
      {
        'title': 'Chats',
        'state': 'chats',
        activeState: 'chats',
        secured: true,
        'icon': "icon-chat"
      },
      {
        'title': 'How It Works',
        'state': 'how',
        activeState: 'how',
        secured: false,
        'icon': "icon-info"
      },
      {
        'title': 'About',
        'state': 'about',
        activeState: 'about',
        secured: false,
        'icon': "icon-about"
      },
      {
        'title': 'Blog',
        'state': 'external',
        'url': 'http://www.proquo.net.au/blog/',
        secured: false,
        'icon': "icon-global"
      },
      {
        'title': 'Payments',
        'state': 'my.payments',
        activeState: 'my.payments',
        secured: true,
        hideOnDesktop: true,
        hideOnSideMenu: true,
        'icon': "icon-dollar"
      },
      {
        'title': 'Notifications',
        'state': 'notifications',
        activeState: 'notifications',
        secured: true,
        hideOnDesktop: true,
        'icon': "icon-bell"
      },
      {
        'title': 'Edit Profile',
        'state': 'profileEdit',
        activeState: 'profileEdit',
        secured: true,
        hideOnDesktop: true,
        'icon': "icon-profile"
      },
      {
        'title': 'Settings',
        'state': 'my.settings',
        activeState: 'my.settings',
        secured: true,
        hideOnDesktop: true,
        'icon': "icon-settings"
      }
    ];
    this.menu.unshift({
      'title': 'Mimic',
      'state': 'mimic',
      activeState: 'mimic',
      secured: true,
      hideOnDesktop: false,
      'icon': "icon-settings"
    });

    this.business = undefined;
    this.onSignUpPage = false;
    this.isLoggedIn = false;
    this.isAdmin = this._Auth.isAdmin;
    this.getCurrentUser = this._Auth.getCurrentUser;

    this.updateMenuState();
    this.toggleLeft = this.buildDelayedToggler('left');
    this.toggleRight = this.buildDelayedToggler('right'); // buildToggler('right');

    $scope.$on('$stateChangeSuccess', (event, toState) => {
      this.currentState = toState;
      this.updateMenuState();
    });

    $scope.$on('login', () => this.getBusiness());

    $scope.$on('businessUpdated', () => this.getBusiness());

    this.getBusiness();
  }

  getBusiness() {
    this._Auth.isLoggedIn(_.noop).then(is => {
      if (!is) {
        this.business = undefined;
        return undefined;
      }

      this._Business.mine().$promise
        .then(result => {
          this.business = result;
        });
    });
  };

  updateMenuState() {
    this.onSignUpPage = ['signupSetup', 'signupEmail', 'getstarted', 'getstarted-welcome', 'getstarted-nameinfo', 'getstarted-selection', 'getstarted-buyer', 'getstarted-seller', 'getstarted-swap'].includes(this._$state.current.name);
    this._Auth.isLoggedIn(loggedIn => {
      this.isLoggedIn = loggedIn;

      this.menu.forEach(item => {
        // Set visibility based on login status
        item.menuItemVisible = ((this.onSignUpPage && !loggedIn) || !this.onSignUpPage) && ((item.publicOnly && !loggedIn) || (!item.secured && !item.publicOnly) || (item.secured && loggedIn && !item.publicOnly));

        // If we are currently mimiccing someone, add their name here
        // show the plain menu if they have the helper role and not mimiccing
        // otherwise hide it
        if (item.state === 'mimic' && loggedIn) {
          this._Auth.getCurrentUser(user => {
            if (user.originalUserId) {
              item.title = `Mimic (${ user.firstName } ${ user.lastName })`;
            } else if (user.roles.includes('helper')) {
              item.title = 'Mimic';
            } else {
              item.menuItemVisible = false;
            }
          })
        }
      });
    });
  }

  isOpenRight() {
    return $mdSidenav('left').isOpen();
  }

  /**
   * Build handler to open/close a SideNav; when animation finishes
   * report completion in console
   */
  buildDelayedToggler(navID) {
    return this.debounce( () => {
      this._$mdSidenav(navID)
        .toggle();
    }, 200);
  }

  buildToggler(navID) {
    return function () {
      this._$mdSidenav(navID)
        .toggle();
    }
  }

  close() {
    this._$mdSidenav('right').close();
  }

  logout() {
    this._Notifications.unsubscribe();
    this._$window.location.href = '/logout';
  }

  debounce(func, wait, context) {
    var timer;
    const debounced = ()=> {
      var context = this,
        args = Array.prototype.slice.call(arguments);
      this._$timeout.cancel(timer);
      timer = this._$timeout(function () {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
    };
    return debounced;
  }

  openMenu($mdOpenMenu, ev) {
    $mdOpenMenu(ev);
  }

  startBusiness() {
    return this._modalService.showStartBusinessOptionsModal();
  };

  showLoginModal(){
    return this._modalService.showLoginModal();
  }
}

angular.module('digitalVillageApp')
  .controller('NavbarCtrl', NavbarCtrl);
