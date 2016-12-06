'use strict';

describe('Filter: filesize', function () {
  let filesizeFilter;

  beforeEach(() => {
    module('digitalVillageApp');

    inject((_filesizeFilter_) => {
      filesizeFilter = _filesizeFilter_;
    })
  });

  it('should format in bytes', () => {
    filesizeFilter(1023).should.equal('1023.00 bytes');
  });

  it('should format in KB', () => {
    filesizeFilter(1024).should.equal('1.00 KB');
  });

  it('should format in MB', () => {
    filesizeFilter(10000000).should.equal('9.54 MB');
  });

  it('should format in GB', () => {
    filesizeFilter(10000000000).should.equal('9.31 GB');
  });

  it('should format in TB', () => {
    filesizeFilter(10000000000000).should.equal('9.09 TB');
  });

  it('should format in PB', () => {
    filesizeFilter(10000000000000000).should.equal('8.88 PB');
  });
});
