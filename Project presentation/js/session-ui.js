import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

function setVisibility(selector, visible) {
    document.querySelectorAll(selector).forEach(function (node) {
        node.hidden = !visible;
    });
}

function updateDisplayName(user) {
    var nameTargets = document.querySelectorAll("[data-user-name]");
    if (!nameTargets.length) {
        return;
    }

    var rawName = user && user.displayName ? user.displayName : "";
    var shortName = rawName ? rawName.split(" (")[0] : "Member";

    nameTargets.forEach(function (node) {
        node.textContent = shortName;
    });
}

function bindLogout() {
    document.querySelectorAll("[data-logout-button]").forEach(function (button) {
        button.addEventListener("click", async function (event) {
            event.preventDefault();

            try {
                await signOut(auth);
                window.location.href = "index.html";
            } catch (error) {
                window.alert(error.message.replace("Firebase:", "").trim());
            }
        });
    });
}

onAuthStateChanged(auth, function (user) {
    var isLoggedIn = Boolean(user);

    setVisibility("[data-guest-only]", !isLoggedIn);
    setVisibility("[data-user-only]", isLoggedIn);
    updateDisplayName(user);
});

bindLogout();
