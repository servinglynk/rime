import moment from 'moment';
import { logger } from '/imports/utils/logger';
import { PendingClients } from '/imports/api/pendingClients/pendingClients';
import './searchClient.html';


const tableOptions = {
  columns: [
    {
      title: 'Client Name',
      data: '_id',
      render(value) {
        const client = PendingClients.findOne({ _id: value });
        const name = (`${client.firstName.trim()} ${client.lastName.trim()}`).trim();
        return `<a href="/clients/${value}">${name}</a>`;
      },
    },
    {
      title: 'Date of Birth',
      data: 'dob',
      render(value) {
        return moment(value).format('MM/DD/YYYY');
      },
    },
  ],
  dom: HomeConfig.adminTablesDom,
};


const debouncedSearch = _.debounce((query, options, callback) => {
  Meteor.call('searchClient', query, options, (err, res) => {
    if (err) {
      logger.log(err);
      return;
    }
    callback(
      res.map(
        (v) => {
          const vz = v;
          const fn = (vz && vz.firstName) ? vz.firstName.trim() : '';
          const mn = (vz && vz.middleName) ? vz.middleName.trim() : '';
          const ln = (vz && vz.lastName) ? vz.lastName.trim() : '';
          vz.value = `${fn} ${mn} ${ln}`;
          vz.value = vz.value.trim();
          return vz;
        }
      )
    );
  });
}, 1000);

Template.searchClient.helpers(
  {
    hasPendingClients() {
      return PendingClients.find().count() > 0;
    },
    tableOptions() {
      return tableOptions;
    },
    tableData() {
      return () => PendingClients.find().fetch();
    },


    isGlobalHousehold() {
      const route = Router.current().location.get().path.split('/')[1];
      return route === 'globalHouseholds';
    },
    searchClient(query, sync, callback) {
      const options = {
        limit: 10,
      };
      const route = Router.current().location.get().path.split('/')[1];
      if (route === 'globalHouseholds') {
        options.excludeLocalClients = true;
      }
      debouncedSearch(query, options, callback);
    },
    clientSelected(event, dataObject) {
      const route = Router.current().location.get().path.split('/')[1];
      if (route === 'globalHouseholds') {
        if (dataObject.clientNotFound) {
          $('#search-client-keyword').val(dataObject.query).change();
        } else {
          const client = {};
          client.clientId = dataObject._id;
          client.clientName =
            `${dataObject.firstName} ${dataObject.middleName} ${dataObject.lastName}`;

          if ($('.globalHouseholdMembers').find(`#${client.clientId}`).length < 1) {
            $('.globalHouseholdMembers').append(globalHouseholdsHelpers.generateMemberHtml(client));
            $('.no-household-members-found-row').remove();
          }
        }
      } else {
        // NoOp Statement. Not going to be used anywhere.
        const temp = '';
        if (dataObject.clientNotFound) {
          $('#search-client-keyword').val(dataObject.query + temp).change();
          Router.go('adminDashboardclientsNew', {}, { query: `firstName=${dataObject.query}` });
        } else {
          const query = {};
          if (dataObject.isHMISClient) {
            query.query = `isHMISClient=true&schema=${dataObject.schema}`;
          }
          Router.go('viewClient', { _id: dataObject._id }, query);
        }
      }
    },
    getRecentClients() {
      return Session.get('recentClients') || [];
    },
    alertMessages() {
      const params = Router.current().params;
      if (params && params.query && params.query.deleted) {
        return '<p class="notice bg-success text-success">Client is removed successfully.</p>';
      }
      return '';
    },
  }
);

Template.searchClient.events(
  {
    'click .client-search-icon-container': () => {
      $('#search-client-keyword').focus();
    },
  }
);

Template.searchClient.onRendered(
  () => {
    Meteor.typeahead.inject();
  }
);
