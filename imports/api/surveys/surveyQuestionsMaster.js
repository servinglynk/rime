import { Mongo } from 'meteor/mongo';

const SurveyQuestionsMaster = new Mongo.Collection('surveyQuestionsMaster');

SurveyQuestionsMaster.schema = new SimpleSchema(
  {
    surveyID: {
      type: String,
    },
    surveyTitle: {
      type: String,
    },
    sectionID: {
      type: String,
      optional: true,
    },
    allowSkip: {
      type: String,
      optional: true,
    },
    contentType: {
      type: String,
    },
    content: {
      type: String,
    },
    order: {
      type: Number,
    },
    apiSurveyServiceId: {
      type: String,
      optional: true,
    },
  }
);

SurveyQuestionsMaster.attachSchema(SurveyQuestionsMaster.schema);

SurveyQuestionsMaster.allow(
  {
    update(userId, doc, fieldNames, modifier) {
      if (fieldNames.length !== 1 || fieldNames[0] !== 'order') return false;
      if (!Match.test(modifier, { $set: { order: Number } })) return false;
      if (typeof Meteor.users !==
          'undefined' &&
          Meteor.users.findOne(
            userId,
            { fields: { Id: 1 } }
          ).Id !== doc.Id) {
        return false;
      }
      return true;
    },
  }
);


export default SurveyQuestionsMaster;
