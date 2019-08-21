import React, { useEffect, useState } from 'react';
import ReferralSteps from '/imports/ui/components/referrals/Steps';
import PastReferralsList from '/imports/ui/components/referrals/PastReferralsList';
import MatchingContainer from '/imports/ui/components/matching/MatchingContainer';

function isMatchCompleted(match) {
  // for now lets assume that completed match has end date set
  return !!match.endDate;
}
// const getOngoingReferral = (referrals) => {
//   const now = new Date();
//   return referrals
//     .find((referral) =>
//       now >= referral.startDate && (!referral.endDate ||
//         (now <= referral.endDate && !referral.outcome)));
// };


function ClientReferrals(props) {
  console.log('ClientReferrals', props);
  const { client: { dedupClientId }, helpers } = props;
  const [lastDataFetch, setLastDataFetch] = useState(new Date());
  const projects = helpers.getProjects();
  console.log('projects', projects);
  const [clientMatches, setClientMatches] = useState([]);
  // const [lastDataFetch, setLastDataFetch] = useState(null);

  const ongoingReferral = clientMatches.find(m => !isMatchCompleted(m));
  const pastReferrals = clientMatches.filter(isMatchCompleted);

  function updateClientMatches() {
    setLastDataFetch(new Date());
  }

  useEffect(() => {
    Meteor.call('matchApi', 'getClientMatches', dedupClientId, (err, res) => {
      if (err) {
        setClientMatches([]);
        console.error('Failed to load client matches', err);
      } else {
        setClientMatches(res);
        console.log('new data', res);
      }
    });
  }, [lastDataFetch]);


  const isActive = !!ongoingReferral;
  // const renderActiveReferral = () => (
  //   <div>
  //     <span>
  //       Referred on: {ongoingReferral.startDate}
  //     </span>
  //     <span>
  //       Referred to: {ongoingReferral.projectId}
  //     </span>
  //     <span>
  //       Referred by: {ongoingReferral.userId}
  //     </span>
  //   </div>
  // );

  function renderSelectedReferral() {
    if (!ongoingReferral) {
      return (
        <p>
          No ongoing referrals.
          Switch to <strong>New Referral</strong> tab to create a new referral.
        </p>
      );
    }

    const lastStepId = ongoingReferral.history.length ?
      ongoingReferral.history[ongoingReferral.history.length - 1].step
      : null;

    return (
      <div>
        {/*
        <h3>Current Referral</h3>
        {renderActiveReferral()}
        */}
        <h3>Curent Referral Status</h3>
        <ReferralSteps
          matchId={ongoingReferral.id}
          lastStepId={lastStepId}
          handleDataReload={updateClientMatches}
        />
      </div>
    );
  }

  return (
    <div className="col-xs-12">
      {isActive && renderSelectedReferral()}
      {!isActive && <MatchingContainer
        dedupClientId={dedupClientId}
        helpers={props.helpers}
        handleDataReload={updateClientMatches}
      />}
      <h3>Past Referrals</h3>
      <PastReferralsList referrals={pastReferrals} />
    </div>
  );
}

export default ClientReferrals;