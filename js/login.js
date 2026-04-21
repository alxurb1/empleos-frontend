const btnLogin = document.getElementById("btnLogin");

const ROLES = {
  candidate: "candidate",
  company: "company",
  admin: "admin",
};

const login = async () => {
  const role = document.querySelector(
    "input[name='tipo-usuario']:checked",
  ).value;
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Porfavor rellena los campos requeridos");
    return false;
  }

  if (password.length < 8) {
    alert("La contraseña debe de tener más de 8 caracteres");
    return false;
  }

  try {
    let URL;
    if (role === ROLES.candidate) {
      URL = `${API_URL}/auth/loginCandidate`;
    } else if (role === ROLES.company) {
      URL = `${API_URL}/auth/loginCompany`;
    } else if (role === ROLES.admin) {
      URL = `${API_URL}/auth/loginAdmin`;
    }
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userData.id_user);
      localStorage.setItem("userRole", role);
      if (role === ROLES.company && result.userData.id_company) {
        localStorage.setItem("companyId", result.userData.id_company);
      }
      alert("Inicio de sesión realizado con éxito");
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

btnLogin.addEventListener("click", async (event) => {
  event.preventDefault();

  const result = await login();

  const userRole = localStorage.getItem("userRole");

  if (userRole === ROLES.admin) {
    if (result) window.location.href = "/pages/admin.html";
  } else {
    if (result) window.location.href = "/pages/home.html";
  }
});
