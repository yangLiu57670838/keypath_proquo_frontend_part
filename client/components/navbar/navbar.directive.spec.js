'use strict';

describe('Directive: navBar', function () {

  let NavbarCtrl, scope, template_place_holder, element, auth;

  beforeEach(module('digitalVillageApp'));
  beforeEach(module('components/navbar/navbar.html', 'components/profilePhoto/profilePhoto.html',
    'components/modalService/startBusinessOptionsModal.html'));

  beforeEach(module(($provide) => {
    auth = {
      isLoggedIn: () => {
        return Promise.resolve({});
      },
      getCurrentUser: () => {
        return { $promise: Promise.resolve({}) };
      },
      onLogin: () => {},
      onLogout: () => {}
    };
    $provide.value('Auth', auth);
  }));

  beforeEach(inject(($compile, $rootScope) => {
    template_place_holder = '<nav-bar></nav-bar>';
    element = angular.element(template_place_holder);
    scope = $rootScope.$new();
    $compile(element)(scope);
    scope.$digest();

    NavbarCtrl = element.controller('navBar');
  }));

  it('should have controller initialized', () => {
    should.exist(NavbarCtrl);
  });

  it('should show modal when user click start a project', inject((_modalService_) => {
    //mock the modalService to make sure click on 'start a project' button will invoke correct modal service method
    sinon.stub(_modalService_, 'showStartBusinessOptionsModal', ()=> {
      return { message: 'showStartBusinessOptionsModal' };
    });
    const result = NavbarCtrl.startBusiness();
    result.message.should.equal('showStartBusinessOptionsModal');
  }));
});
