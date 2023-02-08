// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCzxAu9DupBaf9wosNPbybSri5SoBmFDbg",
    authDomain: "mis-auth-59312.firebaseapp.com",
    databaseURL: "https://mis-auth-59312.firebaseio.com",
    projectId: "mis-auth-59312",
    storageBucket: "mis-auth-59312.appspot.com",
    messagingSenderId: "649716066578",
    appId: "1:649716066578:web:7ea4f3dbca848eb6392bcb",
    measurementId: "G-VV4PJW7P0G"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
console.log(firebase.app().name);
