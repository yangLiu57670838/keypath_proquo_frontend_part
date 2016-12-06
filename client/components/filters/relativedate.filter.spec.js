'use strict';

describe('Filter: relativedate', function () {
  let relativedateFilter;

  beforeEach(() => {
    module('digitalVillageApp');

    inject((_relativedateFilter_) => {
      relativedateFilter = _relativedateFilter_;
    })
  });

  it('should format dates today', () => {
    relativedateFilter(moment().hour(1).minute(23)).should.equal('1:23AM');
    relativedateFilter(moment().hour(23).minute(44)).should.equal('11:44PM');
  });

  it('should format dates from yesterday', () => {
    relativedateFilter(moment().subtract(1, 'day').hour(1).minute(23)).should.equal('Yesterday, 1:23AM');
  });

  it('should format dates from last week', () => {
    const twoDaysAgo = moment().subtract(2, 'day').hour(1).minute(23);
    relativedateFilter(twoDaysAgo).should.equal(`${ twoDaysAgo.format('ddd') }, 1:23AM`);

    const sixDaysAgo = moment().subtract(6, 'day').hour(12).minute(15);
    relativedateFilter(sixDaysAgo).should.equal(`${ sixDaysAgo.format('ddd') }, 12:15PM`);
  });

  it('should format dates from more than one week ago as a full date/time', () => {
    const sevenDaysAgo = moment().subtract(7, 'day').hour(1).minute(23);
    relativedateFilter(sevenDaysAgo).should.equal(`${ sevenDaysAgo.format('DD/MM/YYYY') }, 1:23AM`);

    relativedateFilter(moment('20150703T1053')).should.equal('03/07/2015, 10:53AM');
  });
});
