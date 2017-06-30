import { database } from '../helpers/firebase'

export const Party = () => ({
  actions: {
    saveState: (s) => {
      if (s.partyId) {
        console.log('saving to db')
        database.child(s.partyId).set({
          id: s.id,
        })
      }
    },
  }
})
