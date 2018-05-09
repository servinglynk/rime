import { logger } from '/imports/utils/logger';
import { HmisClient } from '/imports/api/hmisApi';
import Jobs, { JobStatus } from '/imports/api/jobs/jobs';
import SubmissionUploaderSurveyConfigs from
  '/imports/api/submissionUploader/submissionUploaderSurveyConfigs';
import {
  ClientMatcher,
  ResponseMapper,
  SubmissionUploader,
  createRowProcessor,
} from '/imports/api/submissionUploader/rowProcessor';
import {
  createQueue,
  onRowCompleted,
  onRowFailed,
} from '/imports/api/submissionUploader/submissionUploaderProcessor';

import SubmissionUploaderFixtures from '/imports/__tests__/fixtures/submissionUploader';
import TempFiles from '/imports/api/submissionUploader/tempFiles';
import SubmissionUploaderFiles from './submissionUploaderFiles';

const parseFile = (fileId, fileRows) => {
  fileRows.forEach(data => {
    Jobs.insert({
      status: JobStatus.PENDING,
      fileId,
      data,
    });
  });
};

Meteor.methods({
  'submissionUploader.prepopulateWithTestData'() {
    const definition = SubmissionUploaderFixtures.getSurveyDefinitionWithRealQuestionIds();
    const row = SubmissionUploaderFixtures.getSurvey1Row();
    SubmissionUploaderSurveyConfigs.upsert('4b79f42f-e793-4be4-a35f-4b7b56f14572', {
      definition,
    });
    Jobs.remove({ queue: 'file1' });
    Meteor.call('submissionUploader.addJob', 'job #1', 'file1', row);

    const SOURCE_SYSTEM_ID_INDEX = 1;
    row[SOURCE_SYSTEM_ID_INDEX] = -1; // strangely, -1 gets matched to a client
    Meteor.call('submissionUploader.addJob', 'job #2', 'file1', row);

    // Run the queue using:
    // Meteor.call('submissionUploader.run', '4b79f42f-e793-4be4-a35f-4b7b56f14572',
    //   'file1', function (err, res) { console.log(err,res) })
  },
  'submissionUploader.addJob'(jobName, queueName, row) {
    return Jobs.insert({
      name: jobName,
      queue: queueName,
      data: {
        row,
      },
    });
  },
  'submissionUploader.run'(surveyId, queueName) {
    logger.info(`METHOD[${this.userId}]: submissionUploader.run`, surveyId, queueName);

    if (!this.userId) {
      // TOOD: check user role
      throw new Meteor.Error(401, 'Unauthorized');
    }

    const hc = HmisClient.create(this.userId);
    const surveyConfig = SubmissionUploaderSurveyConfigs.findOne(surveyId).definition;

    if (!surveyConfig) {
      throw new Meteor.Error(400, 'Survey config does not exist');
    }

    const clientApi = hc.api('client');
    const surveyApi = hc.api('survey');

    const clientMatcher = new ClientMatcher({ surveyConfig, clientApi });
    const submissionMapper = new ResponseMapper({ surveyConfig });
    const submissionUploader = new SubmissionUploader({ surveyApi });

    const jobProcessor = createRowProcessor({
      surveyId,
      clientMatcher,
      submissionMapper,
      submissionUploader,
      jobsStore: Jobs,
    });
    const onJobCompleted = onRowCompleted({
      jobsStore: Jobs,
    });
    const onJobFailed = onRowFailed({
      jobsStore: Jobs,
    });

    const queue = createQueue({ jobProcessor, onJobCompleted, onJobFailed });

    queue.on('drain', () => {
      logger.info(`Done processing queue ${queueName}`);
    });

    const jobs = Jobs.find({ queue: queueName }).fetch();

    if (jobs.length) {
      logger.info(`Starting queue ${queueName}, ${jobs.length} jobs`);
      jobs.map(job => queue.push({
        id: job._id,
        data: job.data.row,
      }));
      jobs.map(job => Jobs.update(job._id, { $set: { status: JobStatus.IN_PROGRESS } }));
    } else {
      logger.warn(`Queue ${queueName} has no jobs`);
    }


    return jobs.length;
  },

  parseUpload(data) {
    // check(data, Array);
    console.log('parseUpload', data);
  },
  'tempFiles.create'(doc) {
    logger.info(`METHOD[${Meteor.userId()}]: files.create`, doc);
    check(doc, TempFiles.schema);
    // TODO: permissions
    return TempFiles.insert(doc);
  },
  'tempFiles.delete'(id) {
    logger.info(`METHOD[${Meteor.userId()}]: files.delete`, id);
    check(id, String);
    // TODO: permissions
    const currentFile = TempFiles.findOne(id);
    TempFiles.Uploads.remove(currentFile.fileId);
    TempFiles.remove(id);
    return;
  },
  processUploadedSubmission(doc) {
    logger.info(`METHOD[${Meteor.userId()}]: processUploadedSubmission()`);
    if (!Meteor.userId()) {
      throw new Meteor.Error(401, 'Unauthorized');
    }
    // Doc.process
    // Slice to drop info row:
    const fileRows = doc.lines.slice(1);
    const fileRef = SubmissionUploaderFiles.insert({
      fileName: doc.name,
      totalRows: fileRows.length,
    });
    parseFile(fileRef._id, fileRows);
  },
  // 'files.create'(doc) {
  //   logger.info(`METHOD[${Meteor.userId()}]: files.create`, doc);
  //   check(doc, Files.schema);
  //   // TODO: permissions
  //   return Files.insert(doc);
  // },
});