const functions = require('firebase-functions');
const admin = require('../../admin');

const user = functions.auth.user();

module.exports = user.onCreate((user, context) => {
  const userRef = admin.firestore().doc(`users/${user.uid}`);

  return userRef.set({
    email: user.email,
    createdAt: context.timestamp,
  });
});
