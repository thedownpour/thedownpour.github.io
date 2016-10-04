QUnit.module("Common functions");
QUnit.test( "findPageByHash", function( assert ) {
  var id=0;
  var page=findPageByHash([{"name":"Test","hash": "test"},{"name":"Found","hash": "find-me"}], "find-me");
  assert.deepEqual( page,{"id":1,"page":{"name":"Found","hash": "find-me"}}, "Found page ny hash!" );
});
