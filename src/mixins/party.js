import { database } from '../helpers/firebase'

export const Party = () => ({
  state: {
    partyQ: [],
    partyId: '',
  },
  actions: {
    setPartyId: (s,a,d) => ({ partyId: d }),
    setPartyQ: (s,a,d) => ({ partyQ: d }),
    getPartyQ: (s,a,d) => {
      s.partyId &&
        database.child(s.partyId).on('value', (data) => {
          data.val() && data.val().ids && a.updateQ(data.val().ids)
        })
    },
    updateQ: (s,a,d) => {
      if (s.id !== d[0]) {
        a.setId(d[0])
        a.setPartyQ(d)
        a.getVideo()
      }
    },
    savePartyState: (s,a,d) => {
      s.partyId &&
        database.child(s.partyId).set({ ids: s.partyQ.push(d) && s.partyQ })
    },
    nextQTrack: (s,a,d) => {
      s.partyId &&
        database.child(s.partyId).set({
          ids: s.id === s.partyQ[0] ?
            s.partyQ.splice(0, 1) && s.partyQ :
              s.partyQ
        })
    }
  }
})
