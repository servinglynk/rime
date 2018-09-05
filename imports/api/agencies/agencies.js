import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


const Agencies = new Mongo.Collection('agencies');

const ProjectMembershipSchema = new SimpleSchema({
  projectId: {
    type: String,
  },
  userId: {
    type: String,
  },
});

Agencies.schema = new SimpleSchema({
  agencyName: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  projectGroupId: {
    type: String,
    defaultValue: '',
  },
  members: {
    type: [String],
  },
  projects: {
    type: [String],
  },
  projectsMembers: {
    type: [ProjectMembershipSchema],
    optional: true,
  },
  createdAt: {
    type: Date,
    label: 'Created At',
    optional: true,
    autoValue() {
      let val;
      if (this.isInsert) {
        val = new Date();
      } else if (this.isUpsert) {
        val = { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
      return val;
    },
  },
  createdBy: {
    type: String,
    optional: true,
    autoValue() {
      let val;
      if (this.isInsert) {
        val = this.userId;
      } else if (this.isUpsert) {
        val = { $setOnInsert: this.userId };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
      return val;
    },
  },
});

Agencies.attachSchema(Agencies.schema);

Agencies.helpers({
  projectsOfUser(userId) {
    return (this.projectsMembers || [])
      .filter(m => m.userId === userId)
      .map(m => m.projectId);
  },
  getEnrollmentSurveysOfUser(userId) {
    // TODO: implement real logic
    return {
      // v2017 project
      '43262c8c-39ac-4224-8679-e9858451831b': {
        entry: '1888eb2d-0eac-4fce-88c4-229895027541', // Enrollment #1 survey
        update: '1888eb2d-0eac-4fce-88c4-229895027541', // Enrollment #1 survey
        exit: '1888eb2d-0eac-4fce-88c4-229895027541', // Enrollment #1 survey
      },
    };
  },
});

export default Agencies;
