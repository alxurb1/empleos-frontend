const userId = localStorage.getItem("id_user");
const token = localStorage.getItem("token");

if (!userId) {
  alert("Debes iniciar sesión primero.");
  window.location.href = "login.html";
}

const headers = { "Content-Type": "application/json" };

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

const calculateProgress = (profile) => {
  const fields = [
    profile.full_name,
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin_url,
    profile.bio,
    profile.professional_title,
  ];
  const completed = fields.filter(Boolean).length;
  const hasSkills = profile.skills?.length > 0 ? 1 : 0;
  const hasExperience = profile.work_experiences?.length > 0 ? 1 : 0;
  const hasCv = profile.cvs?.length > 0 ? 1 : 0;
  const total = fields.length + 3;
  return Math.round(
    ((completed + hasSkills + hasExperience + hasCv) / total) * 100,
  );
};

const applicationBadge = (status) => {
  const map = {
    pending: `<span class="badge bg-secondary">Pendiente</span>`,
    reviewing: `<span class="badge bg-secondary">En Revisión</span>`,
    interview: `<span class="badge text-light" style="background-color:blue">Entrevista Programada</span>`,
    offer: `<span class="badge bg-success">Oferta</span>`,
    rejected: `<span class="badge bg-light text-dark border">Rechazado</span>`,
  };
  return map[status] ?? `<span class="badge bg-secondary">${status}</span>`;
};

// ------------------------------------------PERFIL-------------------------------------
const loadProfile = () => {
  fetch(`${API_URL}/me/${userId}/profile`)
    .then((reply) => reply.json())
    .then((profile) => {
      document.getElementById("avatar").textContent = getInitials(
        profile.full_name,
      );
      document.getElementById("sidebar-nombre").textContent =
        profile.full_name ?? "";
      document.getElementById("sidebar-titulo").textContent =
        profile.professional_title ?? "";

      const progress = calculateProgress(profile);
      document.getElementById("progreso-bar").style.width = progress + "%";
      document.getElementById("progreso-pct").textContent = progress;

      document.getElementById("input-nombre").value = profile.full_name ?? "";
      document.getElementById("input-email").value = profile.email ?? "";
      document.getElementById("input-telefono").value = profile.phone ?? "";
      document.getElementById("input-ubicacion").value = profile.location ?? "";
      document.getElementById("input-linkedin").value =
        profile.linkedin_url ?? "";
      document.getElementById("input-titulo").value =
        profile.professional_title ?? "";
      document.getElementById("input-bio").value = profile.bio ?? "";

      renderSkills(profile.skills ?? []);
      renderExperiences(profile.work_experiences ?? []);
      renderCVs(profile.cvs ?? []);
    });
};

const saveProfile = () => {
  const profileData = {
    full_name: document.getElementById("input-nombre").value,
    phone: document.getElementById("input-telefono").value,
    location: document.getElementById("input-ubicacion").value,
    linkedin_url: document.getElementById("input-linkedin").value,
    professional_title: document.getElementById("input-titulo").value,
    bio: document.getElementById("input-bio").value,
  };

  fetch(`${API_URL}/me/${userId}/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify(profileData),
  })
    .then((reply) => reply.json())
    .then(() => {
      alert("Perfil actualizado correctamente.");
      loadProfile();
    });
};

// ------------------------------------SKILLS---------------------------------------
const renderSkills = (skills) => {
  const list = document.getElementById("skills-lista");
  list.innerHTML = "";

  for (let skill of skills) {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <span class="badge bg-dark d-flex align-items-center gap-1">
        ${skill.name}
        <i class="bi bi-x" style="cursor:pointer" onclick="deleteSkill('${skill.id_skill}')"></i>
      </span>`,
    );
  }
};

const addSkill = () => {
  const input = document.getElementById("input-skill");
  const name = input.value.trim();
  if (!name) return;

  fetch(`${API_URL}/me/${userId}/skills`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  })
    .then((reply) => reply.json())
    .then(() => {
      input.value = "";
      loadProfile();
    });
};

const deleteSkill = (skillId) => {
  fetch(`${API_URL}/me/skills/${skillId}`, { method: "DELETE" })
    .then((reply) => reply.json())
    .then(() => loadProfile());
};
// -------------------------------------------------CV-----------------------------------
const renderCVs = (cvs) => {
  const list = document.getElementById("cv-lista");
  if (!cvs || cvs.length === 0) {
    list.innerHTML = '<p class="text-muted small">Sin CV subido.</p>';
    return;
  }
  list.innerHTML = "";
  for (let cv of cvs) {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 bg-light mb-2">
        <div class="card-body py-2 px-3 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-file-earmark-text text-primary fs-5"></i>
            <div>
              <p class="fw-semibold small mb-0">${cv.file_name}</p>
              <p class="text-muted small mb-0">Subido el ${new Date(cv.uploaded_at).toLocaleDateString("es-SV")}</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <a href="${cv.file_url}" target="_blank" class="btn btn-outline-secondary btn-sm">Ver</a>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteCV('${cv.id_cv}')">Eliminar</button>
          </div>
        </div>
      </div>`,
    );
  }
};

const uploadCV = () => {
  const file = document.getElementById("input-cv").files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("cv", file);

  fetch(`${API_URL}/me/${userId}/cv`, {
    method: "POST",
    body: formData,
  })
    .then((reply) => reply.json())
    .then(() => {
      alert("CV subido correctamente.");
      loadProfile();
    });
};

const deleteCV = (cvId) => {
  if (!confirm("¿Eliminar este CV?")) return;
  fetch(`${API_URL}/me/cv/${cvId}`, { method: "DELETE" })
    .then((reply) => reply.json())
    .then(() => loadProfile());
};

// --------------------------------------EXPERIENCIAS TRABAJOS--------------------------------------
const renderExperiences = (experiences) => {
  const list = document.getElementById("experiencia-lista");
  if (!experiences || experiences.length === 0) {
    list.innerHTML =
      '<p class="text-muted small">Sin experiencia registrada.</p>';
    return;
  }
  list.innerHTML = "";
  for (let exp of experiences) {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 bg-light mb-2">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p class="fw-bold small mb-0">${exp.job_title}</p>
              <p class="text-muted small mb-0">${exp.company_name}</p>
              <p class="text-muted small mb-0">${exp.start_year} - ${exp.end_year ?? "Actualidad"}</p>
              ${exp.description ? `<p class="text-muted small mb-0">${exp.description}</p>` : ""}
            </div>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteExperience('${exp.id_experience}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>`,
    );
  }
};

const addExperience = () => {
  const body = {
    job_title: document.getElementById("exp-titulo").value.trim(),
    company_name: document.getElementById("exp-empresa").value.trim(),
    start_year: parseInt(document.getElementById("exp-inicio").value),
    end_year: document.getElementById("exp-fin").value
      ? parseInt(document.getElementById("exp-fin").value)
      : null,
    description: document.getElementById("exp-descripcion").value.trim(),
  };

  if (!body.job_title || !body.company_name || !body.start_year) {
    alert("Cargo, empresa y año de inicio son obligatorios.");
    return;
  }

  fetch(`${API_URL}/me/${userId}/experience`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
    .then((reply) => reply.json())
    .then(() => {
      document.getElementById("exp-titulo").value = "";
      document.getElementById("exp-empresa").value = "";
      document.getElementById("exp-inicio").value = "";
      document.getElementById("exp-fin").value = "";
      document.getElementById("exp-descripcion").value = "";
      loadProfile();
    });
};

const deleteExperience = (experienceId) => {
  if (!confirm("¿Eliminar esta experiencia?")) return;
  fetch(`${API_URL}/me/experience/${experienceId}`, { method: "DELETE" })
    .then((reply) => reply.json())
    .then(() => loadProfile());
};

// ------------------------------------APLICAR VACANTE---------------------------------
const loadApplications = () => {
  fetch(`${API_URL}/me/${userId}/applications`)
    .then((reply) => reply.json())
    .then((data) => {
      const list = document.getElementById("postulaciones-lista");

      if (!data || data.length === 0) {
        list.innerHTML =
          '<p class="text-muted small">Sin postulaciones aún.</p>';
        document.getElementById("sidebar-postulaciones").textContent = 0;
        return;
      }

      document.getElementById("sidebar-postulaciones").textContent =
        data.length;
      document.getElementById("stat-total").textContent = data.length;
      document.getElementById("stat-proceso").textContent = data.filter((a) =>
        ["pending", "reviewing"].includes(a.status),
      ).length;
      document.getElementById("stat-entrevistas").textContent = data.filter(
        (a) => a.status === "interview",
      ).length;

      list.innerHTML = "";
      for (let application of data) {
        list.insertAdjacentHTML(
          "beforeend",
          `
          <div class="card border-0 bg-light mb-2">
            <div class="card-body py-2 px-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                  <i class="bi bi-star text-muted"></i>
                  <div>
                    <p class="fw-bold small mb-0">${application.vacancies?.title ?? "—"}</p>
                    <p class="text-muted small mb-0">${application.vacancies?.companies?.name ?? "—"}</p>
                    <p class="text-muted small mb-0">Postulado el ${new Date(application.applied_at).toLocaleDateString("es-SV")}</p>
                  </div>
                </div>
                ${applicationBadge(application.status)}
              </div>
            </div>
          </div>`,
        );
      }
    });
};

// ----------------------------ALERTAS--------------------------------------
const loadAlerts = () => {
  fetch(`${API_URL}/me/${userId}/alerts`)
    .then((reply) => reply.json())
    .then((data) => {
      const list = document.getElementById("alertas-lista");
      if (!data || data.length === 0) {
        list.innerHTML =
          '<p class="text-muted small">Sin alertas configuradas.</p>';
        return;
      }
      list.innerHTML = "";
      for (let alert of data) {
        list.insertAdjacentHTML(
          "beforeend",
          `
          <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
              <p class="fw-semibold small mb-0">${alert.name}</p>
              <p class="text-muted small mb-0">${alert.keywords ?? ""} · ${alert.frequency}</p>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div class="form-check form-switch ms-3 mb-0">
                <input class="form-check-input" type="checkbox" role="switch"
                  ${alert.is_active ? "checked" : ""}
                  onchange="toggleAlert('${alert.id_alert}', this.checked)" />
              </div>
              <button class="btn btn-outline-danger btn-sm" onclick="deleteAlert('${alert.id_alert}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>`,
        );
      }
    });
};

const createAlert = () => {
  const body = {
    name: document.getElementById("alerta-nombre").value.trim(),
    keywords: document.getElementById("alerta-keywords").value.trim(),
    location: document.getElementById("alerta-ubicacion").value.trim(),
    frequency: document.getElementById("alerta-frecuencia").value,
  };
  if (!body.name) {
    alert("El nombre de la alerta es obligatorio.");
    return;
  }

  fetch(`${API_URL}/me/${userId}/alerts`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
    .then((reply) => reply.json())
    .then(() => {
      document.getElementById("alerta-nombre").value = "";
      document.getElementById("alerta-keywords").value = "";
      document.getElementById("alerta-ubicacion").value = "";
      loadAlerts();
    });
};

const toggleAlert = (alertId, isActive) => {
  fetch(`${API_URL}/me/alerts/${alertId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ is_active: isActive }),
  }).then((reply) => reply.json());
};

const deleteAlert = (alertId) => {
  if (!confirm("¿Eliminar esta alerta?")) return;
  fetch(`${API_URL}/me/alerts/${alertId}`, { method: "DELETE" })
    .then((reply) => reply.json())
    .then(() => loadAlerts());
};

loadProfile();
loadApplications();
loadAlerts();
