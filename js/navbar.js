const divLogIn = document.getElementById("divLogin");
const divPerfil = document.getElementById("divProfileBadge");
const btnProfile = document.getElementById("profileBadge");

const isToken = localStorage.getItem("token");

const logOut = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      alert("Cierre de sesión realizado con éxito");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      return true;
    } else {
      const error = await response.json();
      alert(error.message);
      return false;
    }
  } catch (error) {
    alert("Error del servidor");
    return false;
  }
};

if (isToken) {
  divLogIn.classList.add("d-none");
  divPerfil.classList.remove("d-none");
  const userId = localStorage.getItem("userId");

  btnProfile.href = `./profile.html?id=${userId}`;

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      const result = await logOut();
      if (result) window.location.href = "./home.html";
    });
  }
} else {
  divLogIn.classList.remove("d-none");
  divPerfil.classList.add("d-none");
}
