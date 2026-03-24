import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

var pageMode = document.body.dataset.authMode;
var form = document.getElementById("auth-form");
var feedback = document.getElementById("auth-feedback");

onAuthStateChanged(auth, function (user) {
    if (user && (pageMode === "login" || pageMode === "signup")) {
        window.location.href = "index.html";
    }
});

function showFeedback(type, message) {
    feedback.className = "feedback visible " + type;
    feedback.textContent = message;
}

if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        var email = document.getElementById("auth-email").value.trim();
        var password = document.getElementById("auth-password").value.trim();

        try {
            if (pageMode === "signup") {
                var fullName = document.getElementById("full-name").value.trim();
                var role = document.getElementById("user-role").value;

                if (!fullName || !role) {
                    showFeedback("error", "Enter your full name and select a role.");
                    return;
                }

                var signUpResult = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(signUpResult.user, {
                    displayName: fullName + " (" + role + ")"
                });

                showFeedback("success", "Account created successfully. Redirecting to login.");
                window.setTimeout(function () {
                    window.location.href = "login.html";
                }, 1400);
                return;
            }

            await signInWithEmailAndPassword(auth, email, password);
            showFeedback("success", "Login successful. Redirecting to the home page.");
            window.setTimeout(function () {
                window.location.href = "index.html";
            }, 1200);
        } catch (error) {
            showFeedback("error", error.message.replace("Firebase:", "").trim());
        }
    });
}
