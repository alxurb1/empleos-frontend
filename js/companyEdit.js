const companyId = localStorage.getItem("companyId");
const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

if (!companyId) {
  alert("Debes iniciar sesión como empresa.");
  window.location.href = "login.html";
}

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-SV");
};

const statusBadge = (status) => {
  const map = {
    pending: `<span class="badge text-bg-secondary">Pendiente</span>`,
    reviewing: `<span class="badge text-bg-warning text-dark">En Revisión</span>`,
    interview: `<span class="badge text-light" style="background-color:blue">Entrevista</span>`,
    offer: `<span class="badge text-bg-success">Oferta</span>`,
    rejected: `<span class="badge text-bg-danger">Rechazado</span>`,
  };
  return (
    map[status] ?? `<span class="badge text-bg-secondary">${status}</span>`
  );
};

// -----------------------------PERFIL---------------------------------
const loadProfile = () => {
  fetch(`${API_URL}/companies/companiaId/${companyId}`)
    .then((reply) => reply.json())
    .then((company) => {
      if (!company) return;
      document.getElementById("avatar-initials").textContent = getInitials(
        company.name,
      );

      document.getElementById("input-nombre").value = company.name ?? "";
      document.getElementById("input-sector").value = company.sector ?? "";
      document.getElementById("input-tamano").value = company.size ?? "";
      document.getElementById("input-ubicacion").value = company.location ?? "";
      document.getElementById("input-website").value = company.website ?? "";
      document.getElementById("input-email").value = company.email ?? "";
      document.getElementById("input-linkedin").value =
        company.linkedin_url ?? "";
      document.getElementById("input-telefono").value = company.phone ?? "";
      document.getElementById("input-descripcion").value =
        company.description ?? "";
      document.getElementById("input-mision").value = company.mission ?? "";
      document.getElementById("input-vision").value = company.vision ?? "";

      if (company.logo_url) {
        document.getElementById("avatar-initials").innerHTML =
          `<img src="${company.logo_url}" class="rounded" style="width:60px;height:60px;object-fit:cover;">`;
      }
    });
};

const saveProfile = () => {
  const body = {
    name: document.getElementById("input-nombre").value.trim(),
    sector: document.getElementById("input-sector").value.trim() || null,
    size: document.getElementById("input-tamano").value.trim() || null,
    location: document.getElementById("input-ubicacion").value.trim() || null,
    website: document.getElementById("input-website").value.trim() || null,
    email: document.getElementById("input-email").value.trim() || null,
    linkedin_url: document.getElementById("input-linkedin").value.trim() || null,
    phone: document.getElementById("input-telefono").value.trim() || null,
    description: document.getElementById("input-descripcion").value.trim() || null,
    mission: document.getElementById("input-mision").value.trim() || null,
    vision: document.getElementById("input-vision").value.trim() || null,
  };

  fetch(`${API_URL}/companies/${companyId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  })
    .then(async (reply) => {
      if (!reply.ok) {
        const err = await reply.json();
        throw new Error(err.message || "Error en el servidor");
      }
      return reply.json();
    })
    .then(() => alert("Perfil actualizado correctamente."))
    .catch((err) => alert("Error al guardar el perfil: " + err.message));
};

// ----------------------------------VACANTES------------------------------
const publishVacancy = () => {
  const contractMap = {
    "Tiempo Completo": "full_time",
    "Medio Tiempo": "part_time",
    Contrato: "contract",
    Freelance: "freelance",
    Pasantía: "internship",
  };
  const experienceMap = {
    "Junior (0-2 años)": "junior",
    "Semi-Senior (2-5 años)": "mid",
    "Senior (5+ años)": "senior",
    "Lead / Manager": "executive",
  };

  const contractRaw = document.getElementById("vac-contrato").value;
  const experienceRaw = document.getElementById("vac-experiencia").value;

  const body = {
    id_company: companyId,
    title: document.getElementById("vac-titulo").value.trim(),
    contract_type: contractMap[contractRaw] ?? null,
    location: document.getElementById("vac-ubicacion").value.trim(),
    experience_level: experienceMap[experienceRaw] ?? null,
    salary_min:
      parseInt(document.getElementById("vac-salario-min").value) || null,
    salary_max:
      parseInt(document.getElementById("vac-salario-max").value) || null,
    description: document.getElementById("vac-descripcion").value.trim(),
    requirements: document.getElementById("vac-requisitos").value.trim(),
    benefits: document.getElementById("vac-beneficios").value.trim(),
  };

  if (!body.title) return alert("El título del puesto es obligatorio.");

  fetch(`${API_URL}/vacancy`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
    .then((reply) => reply.json())
    .then((data) => {
      if (data.id_vacancy) {
        alert("Vacante publicada correctamente.");
        [
          "vac-titulo",
          "vac-ubicacion",
          "vac-salario-min",
          "vac-salario-max",
          "vac-descripcion",
          "vac-requisitos",
          "vac-beneficios",
        ].forEach((id) => (document.getElementById(id).value = ""));
        document.getElementById("vac-contrato").selectedIndex = 0;
        document.getElementById("vac-experiencia").selectedIndex = 0;
      } else {
        alert(data.message ?? "Error al publicar la vacante.");
      }
    })
    .catch(() => alert("Error al conectar con el servidor."));
};

// ------------------------------------------POSTULACIONES---------------------------------
const loadApplications = () => {
  fetch(`${API_URL}/companies/${companyId}/applications`, { headers })
    .then((reply) => reply.json())
    .then((data) => {
      const list = document.getElementById("applications-list");
      console.log(data);

      if (!data || data.length === 0) {
        list.innerHTML =
          '<p class="text-muted small">Sin postulaciones aún.</p>';
        return;
      }

      list.innerHTML = "";
      for (let app of data) {
        const user = app.users ?? {};
        const vacancy = app.vacancies ?? {};
        const initials = getInitials(user.full_name ?? "?");

        list.insertAdjacentHTML(
          "beforeend",
          `
          <div class="card border-0 bg-light mb-3">
            <div class="card-body py-3 px-3">
              <div class="d-flex align-items-start gap-3">
                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                  style="width:45px;height:45px;">
                  ${initials}
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <p class="fw-bold small mb-0">${user.full_name ?? "—"}</p>
                      <p class="text-muted small mb-2">${vacancy.title ?? "—"}</p>
                      <div class="row g-2 small text-muted">
                        <div class="col-auto">
                          <span class="fw-semibold text-dark">Fecha de Postulación</span><br>
                          ${formatDate(app.applied_at)}
                        </div>
                        ${
                          user.professional_title
                            ? `
                        <div class="col-auto">
                          <span class="fw-semibold text-dark">Cargo</span><br>
                          ${user.professional_title}
                        </div>`
                            : ""
                        }
                      </div>
                    </div>
                    ${statusBadge(app.status)}
                  </div>
                  <div class="d-flex gap-2 mt-2 flex-wrap">
                    <a href="perfil-publico.html?id=${app.id_user}" class="btn btn-outline-secondary btn-sm">Ver Perfil</a>
                    <button class="btn btn-sm fw-bold text-light" style="background-color:blue"
                      onclick="updateStatus('${app.id_application}', 'interview')">Aceptar</button>
                    <button class="btn btn-sm btn-outline-danger"
                      onclick="updateStatus('${app.id_application}', 'rejected')">Rechazar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>`,
        );
      }
    })
    .catch(() => {
      document.getElementById("applications-list").innerHTML =
        '<p class="text-danger small">Error al cargar postulaciones.</p>';
    });
};

const updateStatus = (applicationId, status) => {
  fetch(`${API_URL}/applications/${applicationId}/status`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status }),
  })
    .then((reply) => reply.json())
    .then(() => loadApplications())
    .catch(() => alert("Error al actualizar el estado."));
};

document
  .getElementById("btn-guardar-perfil")
  ?.addEventListener("click", saveProfile);
document
  .getElementById("btn-publicar")
  ?.addEventListener("click", publishVacancy);

document
  .querySelector('[data-bs-target="#postulaciones"]')
  ?.addEventListener("shown.bs.tab", loadApplications);

loadProfile();
