const game_container = document.getElementById("game-container");

window.addEventListener("DOMContentLoaded", () => {
    let message = { type: 'load', loaded: true };
    window.parent.postMessage(JSON.stringify(message), location.origin);
});

window.addEventListener("focus", () => {
    game_container.classList.add("focused");
});

window.addEventListener("blur", () => {
    game_container.classList.remove("focused");
});