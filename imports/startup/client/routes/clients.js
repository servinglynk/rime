import { Clients } from '/imports/api/clients/clients';
import { PendingClients } from '/imports/api/pending-clients/pending-clients';
import { RecentClients } from '/imports/api/recent-clients';
import { AppController } from './controllers';


Router.route('adminDashboardclientsView', {
  path: '/clients',
  template: 'AdminDashboardView',
  controller: AppController,
});

Router.route('adminDashboardclientsNew', {
  path: '/clients/new',
  template: 'AdminDashboardNew',
  controller: AppController,
  waitOn() {
    /*
      Meteor.subscribe('collectionDoc', collectionName, HomeUtils.parseID(this.params._id));
      if (collection.templates && collection.templates.edit && collection.templates.edit.waitOn) {
        collection.templates.edit.waitOn();
      }
    */
    return [];
  },
  action() {
    this.render();
  },
  onBeforeAction() {
    /*
    if (collection.userRoles) {
      if (!Roles.userIsInRole(Meteor.user(), collection.userRoles)) {
        Router.go('notEnoughPermission');
      }
    }
    */
    this.next();
  },
  onAfterAction() {
    /*
    Session.set('admin_title', HomeDashboard.collectionLabel(collectionName));
    Session.set('admin_subtitle', 'Create new');
    Session.set('admin_collection_page', 'new');
    Session.set('admin_collection_name', collectionName);
    if (collection.templates && collection.templates.new
        && collection.templates.new.onAfterAction) {
      collection.templates.new.onAfterAction();
    }
    */
  },
  data() {
    return {
      admin_collection: Clients,
    };
  },
});

Router.route('adminDashboardclientsEdit', {
  path: '/clients/edit',
  template: 'AdminDashboardEdit',
  controller: AppController,
  action() {
    this.render();
  },
  waitOn() {
    return [];
  },
  onBeforeAction() {

  },
  onAfterAction() {

  },
  data() {
    return {
      admin_collection: Clients,
    };
  },
});


Router.onBeforeAction(
  function clientAction() {
    const that = this;

    const routeName = this.route.getName();

    let clientID = this.params._id;

    if (routeName === 'adminDashboardresponsesNew') {
      clientID = this.params.query.client_id;
    }

    const client = PendingClients.findOne(clientID) || Clients.findOne(clientID);

    const viewClientRoute = Router.routes.viewClient;
    if (!client) {
      that.render('clientNotFound');
    } else if (this.params.query && this.params.query.schema) {
      client.personalId = client.clientId;
      client.isHMISClient = true;
      client.schema = this.params.query.schema;
      client.url = viewClientRoute.path(
        { _id: client.clientId },
        { query: `schema=${this.params.query.schema}` }
      );
    } else {
      client.url = viewClientRoute.path({ _id: client._id });
    }

    RecentClients.upsert(client);

    this.next();
  }, {
    only: ['viewClient', 'selectSurvey', 'adminDashboardresponsesNew'],
  }
);

Router.route(
  '/clients/:_id', {
    name: 'viewClient',
    template: 'viewClient',
    controller: 'AppController',
    waitOn() {
      const id = Router.current().params._id;
      if (this.params.query && this.params.query.schema) {
        return [
          Meteor.subscribe('client', id, this.params.query.schema),
          Meteor.subscribe('responses', id),
        ];
      }
      return [
        Meteor.subscribe('pendingClient', id),
        Meteor.subscribe('responses', id),
      ];
    },

    onBeforeAction() {
      const collection = HomeConfig.collections.clients;

      if (collection.userRoles) {
        if (!Roles.userIsInRole(Meteor.userId(), collection.userRoles)) {
          Router.go('notEnoughPermission');
        }
      }

      // External Surveyor redirects
      const clientID = Router.current().params._id;
      if (Roles.userIsInRole(Meteor.userId(), 'External Surveyor')) {
        const pausedResponse = responses.findOne({
          clientID,
          responsestatus: 'Paused',
        });
        const hasNoResponses = responses.find({ clientID }).count() === 0;
        const hmisClient = Clients.findOne(clientID);
        const query = hmisClient ? { schema: hmisClient.schema } : {};

        if (pausedResponse) {
          Bert.alert('Finish the response', 'success', 'growl-top-right');
          Router.go('adminDashboardresponsesEdit', { _id: pausedResponse._id });
        } else if (hasNoResponses) {
          Bert.alert('Create new response', 'success', 'growl-top-right');
          Router.go('selectSurvey', { _id: clientID }, { query });
        } else {
          if (hmisClient) {
            Bert.alert('This client has already been surveyed', 'danger', 'growl-top-right');
            Router.go('adminDashboardclientsView');
          } else {
            Bert.alert('Please upload the client', 'warning', 'growl-top-right');
          }
        }
      }
      this.next();
    },

    onAfterAction() {
      Session.set('admin_title', HomeDashboard.collectionLabel('clients'));
      Session.set('admin_subtitle', `View: ${this.params._id}`);
      Session.set('admin_collection_name', 'clients');
      Session.set('admin_id', HomeUtils.parseID(this.params._id));
    },

    data() {
      const isExtSurveyor = Roles.userIsInRole(Meteor.userId(), 'External Surveyor');
      const pendingClient = PendingClients.findOne({ _id: this.params._id });
      const client = Clients.findOne({ _id: this.params._id });
      return {
        client: pendingClient || client,
        showSurveyButton: !isExtSurveyor,
        showUploadButton: !client,
        showEditButton: !isExtSurveyor,
        showResponsesButton: !isExtSurveyor,
      };
    },
  }
);

Router.route(
  '/clients/:_id/select-survey', {
    name: 'selectSurvey',
    template: 'selectSurvey',
    controller: 'AppController',
    waitOn() {
      if (this.params.query && this.params.query.schema) {
        const _id = Router.current().params._id;
        return Meteor.subscribe('client', _id, this.params.query.schema);
      }

      const _id = Router.current().params._id;
      return Meteor.subscribe('pendingClient', _id);
    },
    onBeforeAction() {
      const collection = HomeConfig.collections.clients;
      if (collection.userRoles) {
        if (!Roles.userIsInRole(Meteor.user(), collection.userRoles)) {
          Router.go('notEnoughPermission');
        }
      }
      this.next();
    },
    onAfterAction() {
      Session.set('admin_title', HomeDashboard.collectionLabel('clients'));
      Session.set('admin_subtitle', `Select Survey: ${this.params._id}`);
      Session.set('admin_collection_name', 'clients');
      Session.set('admin_id', HomeUtils.parseID(this.params._id));
    },
  }
);