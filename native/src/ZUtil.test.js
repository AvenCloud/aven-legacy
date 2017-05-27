

const ZUtil = require('./ZUtil');

it('identifies type literals', () => {
  expect(ZUtil.isTypeLiteral(2)).toBeTruthy();
  expect(ZUtil.isTypeLiteral('asdf')).toBeTruthy();
  expect(ZUtil.isTypeLiteral({type: 'object'})).toBeFalsy();

});