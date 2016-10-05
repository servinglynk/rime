/**
 * Created by udit on 03/10/16.
 */

Template.globalHouseholdMembers.helpers(
  {
    getGlobalHouseholdMembers() {
      const globalHousehold = globalHouseholds.findOne({ _id: Router.current().params._id });
      if (globalHousehold) {
        return globalHousehold.clients;
      }
      return [];
    },
  }
);

Template.singleGlobalHouseholdMember.helpers(
  {
    isHOH(hohId, currentId) {
      return currentId === hohId ? 'checked' : '';
    },
    isRelationshipToHOHSelected(relationshipToHeadOfHousehold, currentVal) {
      return currentVal === relationshipToHeadOfHousehold ? 'selected' : '';
    },
  }
);