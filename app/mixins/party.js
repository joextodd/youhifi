const database = firebase.database().ref('parties')

export const Party = () => ({
  state: {
    partyQ: [],
    partyId: '',
    popupVisible: false,
  },
  actions: {
    setPartyId: (s,a,d) => ({ partyId: d }),
    setPartyQ: (s,a,d) => ({ partyQ: d }),
    getPartyQ: (s,a,d) => {
      s.partyId &&
        database.child(s.partyId).on('value', (data) => {
          data.val() && data.val() && a.updateQ(data.val())
        })
    },
    updateQ: (s,a,q) => {
      a.setPartyQ(q)
      s.track.id !== q[0] && a.getVideo(q[0])
    },
    setPopupVisible: (s,a,d) => ({ popupVisible: d }),
    savePartyState: (s,a,d) => {
      if (s.partyId) {
        a.setPopupVisible(true)
        database.child(s.partyId).transaction((q) =>
          q ? q.concat(d) : [d])
      }
    },
    nextQTrack: (s,a,d) => {
      s.partyId &&
        database.child(s.partyId).transaction((q) =>
          s.track.id === q[0] ? q.splice(0, 1) && q : q)
    }
  }
})
