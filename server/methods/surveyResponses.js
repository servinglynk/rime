/**
 * Created by udit on 26/07/16.
 */

Meteor.methods(
  {
    addSurveyResponse(surveyID, clientID, userID, mainSectionObject, status) {
      const responsesCollection = HomeUtils.adminCollectionObject('responses');
      const responseRecords = responsesCollection.insert(
        {
          clientID,
          surveyID,
          userID,
          responsestatus: status,
          section: mainSectionObject,
        }
      );
      return responseRecords;
    },
    updateSurveyResponse(responseID, surveyID, clientID, userID, mainSectionObject, status) {
      const responsesCollection = HomeUtils.adminCollectionObject('responses');
      const responseRecords = responsesCollection.update(
        {
          _id: responseID,
        }, {
          $set: {
            clientID,
            surveyID,
            userID,
            responsestatus: status,
            section: mainSectionObject,
          },
        }
      );
      return responseRecords;
    },
    sendScoresToHMIS(surveyId, clientId, score) {
      // Send scores section-wise here.
      for (let i = 0; i < score.length; i++) {
        const sectionId = score[i].sectionId;
        const sectionScore = { sectionScore: score[i].sectionScore };
        const sectionScoresId =
          HMISAPI.createSectionScores(surveyId, clientId, sectionId, sectionScore);
        if (sectionScoresId) {
          // Add this ID to DB. For any reference.
          logger.log(`SurveyResponse.Js: ${sectionScoresId}`);
        }
      }
    },
    deleteOldScores(surveyId, clientId) {
      return HMISAPI.deleteSurveyScores(surveyId, clientId);
    },
  }
);
