const divLogIn = document.getElementById("divLogin");
const divPerfil = document.getElementById("divProfileBadge");
const btnProfile = document.getElementById("profileBadge");

const isToken = localStorage.getItem("token");

if (isToken) {
  divLogIn.classList.add("d-none");
  divPerfil.classList.remove("d-none");
  const userId = localStorage.getItem("userId");

  btnProfile.href = `./profile.html?id=${userId}`;

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "./login.html";
    });
  }
} else {
  divLogIn.classList.remove("d-none");
  divPerfil.classList.add("d-none");
}
