import Alert from '/imports/ui/alert';

const clientPage = {
  state: {
    client: {},
    eligibleClient: {},
    enrollments: [],
  },
  reducers: {
    setClient(state, payload) {
      return {
        ...state,
        client: payload,
      };
    },
    setEligibleClient(state, payload) {
      return {
        ...state,
        eligibleClient: payload,
      };
    },
    setClientPhoto(state, payload) {
      return {
        ...state,
        client: {
          ...state.client,
          photo: payload,
        },
      };
    },
  },

  effects: (dispatch) => ({
    loadClient(dedupClientId) {
      console.log('lc');
      return new Promise((resolve, reject) => {
        console.log('lc2');
        Meteor.call('clients.getClientPageViewModel', dedupClientId, (err, res) => {
          console.log(err,res);
          if (err) {
            reject(err);
          } else {
            console.log('aaa', res);
            dispatch.clientPage.setClient(res.client);
            dispatch.clientPage.setEligibleClient(res.eligibleClient);
            resolve(res);
          }
        });
      });
    },

    loadClientPhoto(dedupClientId) {
      Meteor.call('s3bucket.get', dedupClientId, 'photo', (err, res) => {
        if (err) {
          dispatch.clientPage.setClientPhoto('/imgs/client.jpg');
        } else {
          dispatch.clientPage.setClientPhoto(res);
        }
      });
    },

    addToActiveList({ dedupClientId, removalDate, removalReason, removalRemarks }) {

    },

    removeFromActiveList({ dedupClientId, removalDate, removalReason, removalRemarks }) {
      Meteor.call('clients.removeFromActiveList', dedupClientId, removalDate,
        removalReason, removalRemarks, (err, res) => {
          if (err) {
            Alert.error(err);
          }

        });
      console.log('removeFromActiveList', dedupClientId, removalDate, removalReason, removalRemarks);
    },
  }),
};

export default clientPage;