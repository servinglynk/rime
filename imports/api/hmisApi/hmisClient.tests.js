/* eslint prefer-arrow-callback: "off", func-names: "off" */

import nock from 'nock';
import { chai } from 'meteor/practicalmeteor:chai';
import { HmisClient } from './hmisClient';
import { ApiRegistry } from './apiRegistry';

class DummyApi {
  bar() {
    return 'baz';
  }
}

const fakeCollection = {
  findOne() {
    return {
      services: {
        HMIS: {},
      },
    };
  },
  update() {},
};

describe('hmisApi', function () {
  describe('client', function () {
    it('can use dummy api', function () {
      nock('https://api.hslynk.com')
        .post('/hmis-authorization-service/rest/token/')
        .query(() => true)
        .reply(
          200,
          JSON.stringify({
            oAuthAuthorization: {
              accessToken: 'test-access-token',
              expiresIn: 1000000,
              refreshToken: 'test-refresh-token',
            },
          })
        );

      const registry = new ApiRegistry();
      registry.addApi('dummy', DummyApi);

      const config = {
        appId: 'appId',
        appSecret: 'secret',
      };
      const client = new HmisClient({
        userId: 'userId',
        serviceConfig: config,
        hmisApiRegistry: registry,
        usersCollection: fakeCollection,
      });
      client.authData = { expiresAt: new Date().getTime() + 10 * 60 * 1000 };
      const api = client.api('dummy');
      chai.assert.equal(api.bar(), 'baz');
    });

    it('will throw an error if unknown api is used', function () {
      const emptyRegistry = new ApiRegistry();
      const config = {
        appId: 'appId',
        appSecret: 'secret',
      };
      const client = new HmisClient({
        userId: 'userId',
        serviceConfig: config,
        hmisApiRegistry: emptyRegistry,
        usersCollection: Meteor.users,
      });
      chai.assert.throws(() => client.api('non-existent').bar(), Error);
    });
  });
});
