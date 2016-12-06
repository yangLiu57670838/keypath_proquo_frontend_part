'use strict';

describe('Controller: CreateItdbCtrl', function () {
  let CreateItdbCtrl;
  let $q, $rootScope;
  let itdbServiceUpdate, itdbServiceSave;
  let toastShow;

  // load the service's module
  beforeEach(function () {
    module('digitalVillageApp');

    module({
      Auth: {
        getCurrentUser(callback) {
          callback({
            _id: '57e0c5ef8dbfe72950a058a4',
            fullname: 'John Smith',
          });
        },
        isLoggedIn() {
          return $q.resolve();
        },
        onLogin() {
        },
        onLogout() {
        },
      },
      itdbService: {
        get(params) {
          const itdb = {
            _id: '3453453453453453',
            userId: '57bbab66b515ef4f10a93f88',
            acceptsSwap: false,
            acceptsCash: true,
            estimatedDuration: '> 6 months',
            brief: {
              considerSwap: false,
              links: [
              ],
              attachments: [
                {
                  url: 'https://cdn.filepicker.io/api/file/pmlAXOftQnK0ByXy4pAY',
                  attachmentMimeType: 'image/png',
                  attachmentType: 'Offer Attachment',
                  size: 102169,
                  attachmentName: 'dazy4.png',
                  description: 'dazy4.png',
                  attachedBy: {
                    name: 'Dom Buyer',
                    id: '57bbab66b515ef4f10a93f88',
                  },
                },
              ],
              workTitle: 'My test offer',
              description: 'blah blah',
            }
          };
          return { $promise: $q.resolve(itdb) };
        },
        update(params, itdb) {
          itdbServiceUpdate = itdb;
          return { $promise: $q.resolve(itdb) };
        },
        save(itdb) {
          itdbServiceSave = itdb;
          return { $promise: $q.resolve(itdb) };
        },
      },
      Toast: {
        show(message) {
          toastShow = message;
        },
      },
    });

    inject((_$q_, _$rootScope_) => {
      $q = _$q_;
      $rootScope = _$rootScope_;
    });
  });

  afterEach(function () {
    itdbServiceSave = itdbServiceUpdate = undefined;
    toastShow = undefined;
  });

  function instantiateController(entityId) {
    inject(($controller, $stateParams) => {
      if (entityId) {
        $stateParams.projectId = entityId;
      }
      CreateItdbCtrl = $controller('CreateItdbCtrl', { });
    });
  }

  it('should add a link to the links array', () => {
    instantiateController();

    CreateItdbCtrl.itdb = {
      brief: {
        links:[{url:'http://wwww.test.com', urlDescription:'Blah blah'}]
      }
    };
    const form = {$setSubmitted: function(){} };
    (CreateItdbCtrl.itdb.brief.links.length).should.equal(1);
    CreateItdbCtrl.addLink(form);
    (CreateItdbCtrl.itdb.brief.links.length).should.equal(2);
    (CreateItdbCtrl.itdb.brief.links[1].url).should.equal('http://wwww.test.com');
  });

  it('should remove a link to the links array', () => {
    instantiateController();

    CreateItdbCtrl.itdb = {
      brief: {
        links: [
          { url: 'http://wwww.test1.com', urlDescription: 'Blah blah1' },
          { url: 'http://wwww.test2.com', urlDescription: 'Blah blah2' },
          { url: 'http://wwww.test3.com', urlDescription: 'Blah blah3' }
        ]
      }
    };

    CreateItdbCtrl.removeLink(CreateItdbCtrl.itdb.brief.links[1]);
    (CreateItdbCtrl.itdb.brief.links.length).should.equal(2);
    (CreateItdbCtrl.itdb.brief.links[1].url).should.equal('http://wwww.test3.com');
  });

  it('should retrieve an existing invite', () => {
    instantiateController('3453453453453453');
    $rootScope.$apply();

    // verify the initial get() worked correctly
    CreateItdbCtrl.itdb._id.should.equal('3453453453453453');
    CreateItdbCtrl.itdb.acceptsSwap.should.equal(false);
    CreateItdbCtrl.itdb.brief.workTitle.should.equal('My test offer');
    CreateItdbCtrl.estimatedDurationSliderPosition.should.equal(7); // > 6 months
  });

  it('should update an existing invite', () => {
    instantiateController('3453453453453453');
    $rootScope.$apply();

    CreateItdbCtrl.itdb.acceptsSwap = true;
    CreateItdbCtrl.itdb.brief.workTitle = 'Updated blah blah';
    CreateItdbCtrl.noTimeSpan = true;
    CreateItdbCtrl.saveInvite();
    $rootScope.$apply();

    itdbServiceUpdate.acceptsSwap.should.beTrue;
    itdbServiceUpdate.brief.workTitle.should.equal('Updated blah blah');
    expect(itdbServiceUpdate.estimatedDuration).to.be.null;
    expect(toastShow).to.be.undefined;
  });

  it('should save an invite with an estimatedDuration if don\'t know is not checked', () => {
    instantiateController();

    CreateItdbCtrl.itdb.brief.workTitle = 'Some work';
    CreateItdbCtrl.saveInvite();
    $rootScope.$apply();

    itdbServiceSave.brief.workTitle.should.equal('Some work');
    itdbServiceSave.estimatedDuration.should.equal('3 months'); // from the default estimatedDurationSliderPosition
    toastShow.should.equal('Great. Your offer has been created!');
  });

  it('should save an invite without an estimatedDuration if don\'t know is checked', () => {
    instantiateController();

    CreateItdbCtrl.itdb.brief.workTitle = 'Some work';
    CreateItdbCtrl.noTimeSpan = true;
    CreateItdbCtrl.saveInvite();
    $rootScope.$apply();

    itdbServiceSave.brief.workTitle.should.equal('Some work');
    expect(itdbServiceSave.estimatedDuration).to.be.null;
    toastShow.should.equal('Great. Your offer has been created!');
  });

  it('should invalidate the form if invalid', () => {
    const form = {
      $setSubmitted() {},
      $invalid: true,
    };

    CreateItdbCtrl.scrollToPos = function () {};

    CreateItdbCtrl.validateForm(form).should.beFalse;
  });

  it('should invalidate the form if acceptsCash and acceptsSwap not ticked', () => {
    instantiateController();

    const form = {
      $setSubmitted() {},
      $invalid: false,
    };
    CreateItdbCtrl.checkboxInvalid =  false;
    CreateItdbCtrl.scrollToPos = function(){};

    CreateItdbCtrl.itdb = {acceptsCash: false, acceptsSwap: false};

    const result = CreateItdbCtrl.validateForm(form);
    CreateItdbCtrl.checkboxInvalid.should.beTrue;
    result.should.beFalse;
  });
});
