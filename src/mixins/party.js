import { database } from '../helpers/firebase'

export const Party = () => ({
  events: {
    loaded: (s,a) => {
      s.partyId &&
        database.child(s.partyId).on('value', (data) => {
          a.router.go(`/party/${s.partyId}/${data.val().id}`)
        })
    }
  },
  actions: {
    saveState: (s) => {
      s.partyId && s.id &&
        database.child(s.partyId).set({ id: s.id })
    },
  }
})
