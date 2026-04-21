const ROLES = {
  candidate: "candidate",
  company: "company",
  admin: "admin",
};

const urlId = new URLSearchParams(window.location.search).get("id");
const myId = localStorage.getItem("userId");

const currentRole = localStorage.getItem("userRole");

if (currentRole === ROLES.admin) {
  document.getElementById("divDescripcionPerfil").classList.add("d-none");
  document
    .getElementById("divIzquierdaPerfil")
    .classList.add("col-md-6", "mx-auto");
  document.getElementById("divIzquierdaPerfil").classList.remove("col-md-3");
  document.getElementById("divCerrarSesion").classList.add("text-center");
}

if (urlId !== myId) {
  document.getElementById("btnLogout").classList.add("d-none");
}

const getIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const getInitials = (fullName) => {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

const renderExperiencia = (experiencias) => {
  const lista = document.getElementById("experiencia-lista");

  if (!experiencias || experiencias.length === 0) {
    lista.innerHTML =
      '<p class="text-muted small">Sin experiencia registrada.</p>';
    return;
  }

  lista.innerHTML = "";

  for (let exp of experiencias) {
    lista.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 bg-light mb-2">
        <div class="card-body py-2 px-3">
          <p class="fw-bold small mb-0">${exp.job_title}</p>
          <p class="text-muted small mb-0">${exp.company_name}</p>
          <p class="text-muted small mb-0">
            ${exp.start_year} - ${exp.end_year ?? "Actualidad"}
          </p>
          ${
            exp.description
              ? `<p class="text-muted small mb-0">${exp.description}</p>`
              : ""
          }
        </div>
      </div>
      `,
    );
  }
};

const renderHabilidades = (skills) => {
  const lista = document.getElementById("habilidades-lista");

  if (!skills || skills.length === 0) {
    lista.innerHTML =
      '<p class="text-muted small">Sin habilidades registradas.</p>';
    return;
  }

  lista.innerHTML = "";

  for (let skill of skills) {
    lista.insertAdjacentHTML(
      "beforeend",
      `<span class="badge bg-dark px-3 py-2">${skill.name}</span>`,
    );
  }
};

const renderPerfil = (perfil) => {
  document.getElementById("loading").classList.add("d-none");
  document.getElementById("contenido").classList.remove("d-none");

  if (perfil.avatar_url) {
    document.getElementById("avatar").innerHTML =
      `<img src="${perfil.avatar_url}" alt="Avatar" class="w-100 h-100 rounded-circle object-fit-cover" style="width: 120px; height: 120px;">`;
  } else {
    document.getElementById("avatar").innerHTML = ""; // Limpiar imagen previa
    document.getElementById("avatar").textContent = getInitials(
      perfil.full_name,
    );
  }

  document.getElementById("nombre").textContent = perfil.full_name ?? "";
  document.getElementById("titulo").textContent =
    perfil.professional_title ?? "";
  document.getElementById("email").textContent = perfil.email ?? "";
  document.getElementById("telefono").textContent =
    perfil.phone ?? "No registrado";
  document.getElementById("bio").textContent = perfil.bio ?? "Sin descripción.";

  if (perfil.linkedin_url) {
    document.getElementById("linkedin").href = perfil.linkedin_url;
    document.getElementById("linkedin-container").classList.remove("d-none");
  }

  if (perfil.cvs && perfil.cvs.length > 0) {
    document.getElementById("cv-link").href = perfil.cvs[0].file_url;
    document.getElementById("cv-container").classList.remove("d-none");
  }

  renderExperiencia(perfil.work_experiences);
  renderHabilidades(perfil.skills);
};

const getPerfil = () => {
  let id = getIdFromURL();

  if (!id) {
    id = localStorage.getItem("userId");
  }

  if (!id) {
    document.getElementById("loading").classList.add("d-none");
    document.getElementById("error").textContent =
      "No se especificó un usuario o debes iniciar sesión.";
    document.getElementById("error").classList.remove("d-none");
    return;
  }

  fetch(`${API_URL}/me/${id}/profile`)
    .then((reply) => reply.json())
    .then((data) => renderPerfil(data))
    .catch(() => {
      document.getElementById("loading").classList.add("d-none");
      document.getElementById("error").classList.remove("d-none");
    });
};

getPerfil();
