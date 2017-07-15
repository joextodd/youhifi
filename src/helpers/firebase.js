import firebase from 'firebase/app'
import 'firebase/database'

const app = firebase.initializeApp({
  databaseURL: 'https://audiostream-d2fbc.firebaseio.com'
})

export const database = app.database().ref('parties')
