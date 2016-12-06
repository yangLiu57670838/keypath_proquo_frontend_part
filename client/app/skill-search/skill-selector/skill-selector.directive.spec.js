'use strict';

describe('Directive: skillSelector', function () {
  // load the directive's module and view
  beforeEach(module('digitalVillageApp'));

  beforeEach(module('app/skill-search/skill-selector/skill-selector.html', 'app/category/categoryGenericSelector.html',
    'components/suggestedSkillsList/suggestedSkills.html', 'app/category/categorySelectorTextSearchTemplate.html'));

  beforeEach(inject(($rootScope, $httpBackend, $compile) => {
    $httpBackend.when('GET', default_query_url).respond(defaultCategories);
    $httpBackend.when('GET', /^\/assets\/images\/.*/).respond('<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 463.33 463.33"><defs><style>.cls-1{fill:#1e3246;}.cls-2,.cls-3{fill:none;stroke:#fff;stroke-linecap:round;stroke-width:24px;}.cls-2{stroke-linejoin:round;}.cls-3{stroke-miterlimit:10;}</style></defs><circle class="cls-1" cx="231.66" cy="231.66" r="217.71"/><polyline class="cls-2" points="159.74 169.53 276.11 121.88 276.11 169.53"/><polyline class="cls-3" points="303.59 278.21 303.59 341.45 159.74 341.45 159.74 278.21"/><polyline class="cls-2" points="159.74 278.21 159.74 169.53 303.59 169.53 303.59 278.21"/><line class="cls-2" x1="195.26" y1="212.73" x2="268.07" y2="212.73"/><line class="cls-2" x1="195.26" y1="250.13" x2="268.07" y2="250.13"/></svg>');

    scope = $rootScope.$new();

    template_place_holder = '<skill-selector></skill-selector>';
    element = angular.element(template_place_holder);

    $compile(element)(scope);
    scope.$digest();

  }));

  it('should make hidden element visible', inject(($httpBackend) => {
    $httpBackend.flush();
    let ctrl = element.controller('skillSelector');
    const technologyCategory = ctrl.topCategories.find((topCategory) => topCategory.name === 'technology');
    should.equal(technologyCategory.children.length, 1);
    should.equal(technologyCategory.children[0].name, 'Javascript');
  }));

  let template_place_holder, element, scope;
  const default_query_url = '/api/categories?fields=%7B%22description%22:0,%22active%22:0%7D&pageNum=1&pageSize=1000&sort=name:asc';
  const defaultCategories = [
    {
      "_id": "56c50280e3ffd3a7aaf8d0df",
      "name": "Technology",
      "description": "Technology",
      "active": true
    },
    {
      "_id": "57710790e6eb543f96e9efb7",
      "name": "Javascript",
      "description": "Javascript",
      "parentCategory": "56c50280e3ffd3a7aaf8d0df",
      "active": true
    }
  ];
});
