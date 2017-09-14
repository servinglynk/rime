import { logger } from '/imports/utils/logger';
import { HmisClient } from '../hmis-api';

Meteor.methods({
  getEligibleClients() {
    logger.info(`METHOD[${Meteor.userId()}]: getEligibleClients()`);
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Unauthorized');
    }

    const hc = HmisClient.create(Meteor.userId());
    return hc.api('house-matching').getEligibleClients();
  },

  ignoreMatchProcess(clientId, ignoreMatchProcess, remarks = '') {
    logger.info(`METHOD[${Meteor.userId()}]: ignoreMatchProcess(${clientId}, ${ignoreMatchProcess})`); // eslint-disable-line max-len
    check(clientId, String);
    check(ignoreMatchProcess, Boolean);
    check(remarks, String);

    let eligibleClient;
    if (Meteor.userId()) {
      const hc = HmisClient.create(Meteor.userId());

      // get client details
      eligibleClient = hc.api('house-matching').getEligibleClient(clientId);

      // update the client status
      eligibleClient.ignoreMatchProcess = ignoreMatchProcess;
      eligibleClient.remarks = remarks;
      delete eligibleClient.links;
      hc.api('house-matching').updateEligibleClient(eligibleClient);

      // return updated eligible client object to the client
    } else {
      throw new Meteor.Error('403', 'You are not authorized to perform this action');
    }
    return eligibleClient;
  },

  postHousingMatchScores() {
    logger.info(`METHOD[${Meteor.userId()}]: postHousingMatchScores()`);
    const hc = HmisClient.create(Meteor.userId());
    return hc.api('house-matching').postHousingMatchScores();
  },
});
