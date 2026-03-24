import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNHZInSnRWlWGYMMol_FeuYK-UbY-4zDU",
  authDomain: "waste-6ffae.firebaseapp.com",
  projectId: "waste-6ffae",
  storageBucket: "waste-6ffae.firebasestorage.app",
  messagingSenderId: "609469944234",
  appId: "1:609469944234:web:3605cc91e2056bf578dbd3",
  measurementId: "G-373CNV5MCL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

analyticsSupported().then(function (supported) {
    if (supported) {
        getAnalytics(app);
    }
}).catch(function () {
    return null;
});

export { app, auth };
