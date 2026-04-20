const formCandidato = document.getElementById("formRegisterCandidate");
const formEmpresa = document.getElementById("formRegisterCompany");

const divCandidato = document.getElementById("divCandidate");
const divEmpresa = document.getElementById("divCompany");

const btnEmpleo = document.getElementById("busco-empleo");
const btnCompany = document.getElementById("soy-empresa");

const crearCuentaCandidato = async () => {
  const role = document.querySelector(
    "input[name='tipo-usuario']:checked",
  ).value;

  const full_name = document.getElementById("nombreCompleto").value;

  const email = document.getElementById("correoElectronico").value;

  const prevPassword = document.getElementById("contraseniaPrevia").value;

  const password = document.getElementById("contraseniaConfirmada").value;

  if (!full_name || !email || !prevPassword || !password) {
    alert("Por favor ingresa todos los campos");
    return false;
  }

  if (prevPassword != password) {
    alert("Las contraseñas tienen que ser iguales");
    return false;
  }

  if (prevPassword.length < 8 || password.length < 8) {
    alert("La contraseña debe de tener más de 8 caracteres");
    return false;
  }
  try {
    const response = await fetch(`${API_URL}/auth/registerCandidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name,
        email,
        password,
        role,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userData.id_user);
      localStorage.setItem("userRole", role);
      alert("Usuario registrado correctamente");
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

const crearCuentaEmpresa = async () => {
  const full_name = document.getElementById("nombreContacto").value;
  const email = document.getElementById("correoElectronicoContacto").value;
  const prevPassword = document.getElementById(
    "contraseniaPreviaEmpresa",
  ).value;
  const password = document.getElementById(
    "contraseniaConfirmadaEmpresa",
  ).value;
  const name = document.getElementById("nombreEmpresa").value;

  if (!full_name || !email || !prevPassword || !password || !name) {
    alert("Porfavor ingresa los datos requeridos");
    return false;
  }

  if (prevPassword != password) {
    alert("Las contraseñas tienen que ser iguales");
    return false;
  }

  if (prevPassword.length < 8 || password.length < 8) {
    alert("La contraseña debe de tener más de 8 caracteres");
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/registerCompany`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name,
        email,
        password,
        name,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem("token", result.token);
      localStorage.setItem("userId", result.userData.id_user);
      localStorage.setItem("userRole", "company");
      if (result.company && result.company.id_company) {
        localStorage.setItem("companyId", result.company.id_company);
      } else if (result.userData && result.userData.id_company) {
        localStorage.setItem("companyId", result.userData.id_company);
      }
      alert("Empresa registrada correctamente");
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

btnEmpleo.addEventListener("change", (event) => {
  divEmpresa.classList.add("d-none");
  divCandidato.classList.remove("d-none");
});

btnCompany.addEventListener("change", (event) => {
  divCandidato.classList.add("d-none");
  divEmpresa.classList.remove("d-none");
});

formCandidato.addEventListener("submit", async (event) => {
  event.preventDefault();

  const result = await crearCuentaCandidato();
  if (result) window.location.href = "/pages/home.html";
});

formEmpresa.addEventListener("submit", async (event) => {
  event.preventDefault();

  const result = await crearCuentaEmpresa();

  if (result) window.location.href = "/pages/home.html";
});
