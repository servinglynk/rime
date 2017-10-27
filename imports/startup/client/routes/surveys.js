import { AppController } from './controllers';
import { DefaultAdminAccessRoles } from '/imports/config/permissions';
import Surveys from '/imports/api/surveys/surveys';
import Questions from '/imports/api/questions/questions';
import '/imports/ui/surveys/surveysListView';
import '/imports/ui/surveys/surveyForm';
import '/imports/ui/responses/responsesNew';


Router.route('adminDashboardsurveysView', {
  path: '/surveys',
  template: Template.surveysListView,
  controller: AppController,
  authorize: {
    allow() {
      return Roles.userIsInRole(Meteor.userId(), DefaultAdminAccessRoles);
    },
  },
  waitOn() {
    return Meteor.subscribe('surveys.all');
  },
  data() {
    return {
      title: 'Surveys',
      subtitle: 'List',
    };
  },
});


Router.route('surveysNew', {
  path: '/surveys/new',
  template: Template.surveyForm,
  controller: AppController,
  waitOn() {
    return Meteor.subscribe('questions.all');
  },
  data() {
    return {
      title: 'Surveys',
      subtitle: 'New',
      survey: {},
      questions: Questions.find().fetch(),
    };
  },
});

Router.route('surveysEdit', {
  path: '/surveys/:_id/edit',
  template: Template.surveyForm,
  controller: AppController,
  authorize: {
    allow() {
      return Roles.userIsInRole(Meteor.userId(), DefaultAdminAccessRoles);
    },
  },
  waitOn() {
    const id = Router.current().params._id;
    return [
      Meteor.subscribe('surveys.one', id),
      Meteor.subscribe('questions.all'),
    ];
  },
  data() {
    const id = Router.current().params._id;
    const survey = Surveys.findOne(id) || {};
    return {
      title: 'Surveys',
      subtitle: survey ? `Edit ${survey.title}` : '',
      survey,
      questions: Questions.find().fetch(),
    };
  },
});

Router.route('surveysPreview', {
  path: '/surveys/:_id/preview',
  template: Template.responsesNew,
  controller: AppController,
  authorize: {
    allow() {
      return Roles.userIsInRole(Meteor.userId(), DefaultAdminAccessRoles);
    },
  },
  waitOn() {
    const id = Router.current().params._id;
    return Meteor.subscribe('surveys.one', id);
  },
  data() {
    const id = Router.current().params._id;
    const survey = Surveys.findOne(id) || {};
    return {
      title: 'Surveys',
      subtitle: survey ? `Preview ${survey.title}` : '',
      survey,
    };
  },
});
