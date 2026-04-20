const token = localStorage.getItem("token");

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

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

const statusBadge = (active) => {
  return active
    ? `<span class="badge text-light" style="background-color:blue">Activo</span>`
    : `<span class="badge bg-dark">Suspendido</span>`;
};

const vacancyStatusBadge = (status) => {
  const colors = {
    active: "blue",
    paused: "gray",
    expired: "orange",
    deleted: "red",
  };
  const labels = {
    active: "Activo",
    paused: "Pausado",
    expired: "Vencido",
    deleted: "Eliminado",
  };
  return `<span class="badge text-light" style="background-color:${colors[status] ?? "gray"}">${labels[status] ?? status}</span>`;
};

// -----------------------------------------ESTADISTICAS---------------------------------------

const renderBarChart = (data) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const maxHeight = 120;

  return data
    .map((d) => {
      const height = Math.max(Math.round((d.value / max) * maxHeight), 4);
      return `
      <div class="d-flex flex-column align-items-center gap-1">
        <small class="text-muted" style="font-size:10px">${d.value}</small>
        <div class="rounded-top" style="width:30px;height:${height}px;background-color:blue"></div>
        <small class="text-muted">${d.label}</small>
      </div>`;
    })
    .join("");
};

const renderSectorBars = (vacancies) => {
  const counts = {};
  for (let v of vacancies) {
    const cat = v.category ?? "Sin categoría";
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const max = sorted[0]?.[1] ?? 1;

  return sorted
    .map(([sector, count]) => {
      const pct = Math.round((count / max) * 100);
      return `
      <div class="mb-2">
        <small class="text-muted">${sector}</small>
        <div class="progress mt-1" style="height:6px">
          <div class="progress-bar" style="width:${pct}%;background-color:blue"></div>
        </div>
      </div>`;
    })
    .join("");
};

const renderLocationBadges = (users) => {
  const counts = {};
  for (let u of users) {
    const loc = u.location ?? "Sin ubicación";
    counts[loc] = (counts[loc] ?? 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted
    .map(
      ([loc, count]) => `
    <div class="d-flex justify-content-between mb-2">
      <small class="text-muted">${loc}</small>
      <span class="badge bg-dark">${count}</span>
    </div>`,
    )
    .join("");
};

const loadMetrics = () => {
  fetch(`${API_URL}/admin/metrics`, { headers: authHeaders })
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("total-usuarios").textContent =
        data.total_users?.toLocaleString() ?? "—";
      document.getElementById("total-empresas").textContent =
        data.total_companies?.toLocaleString() ?? "—";
      document.getElementById("total-vacantes").textContent =
        data.active_vacancies?.toLocaleString() ?? "—";
      document.getElementById("total-foros").textContent =
        data.total_forum_posts?.toLocaleString() ?? "—";
      document.getElementById("analitica-postulaciones").textContent =
        data.total_applications?.toLocaleString() ?? "—";
      document.getElementById("analitica-resenas").textContent =
        data.pending_reviews?.toLocaleString() ?? "—";
      document.getElementById("analitica-vacantes").textContent =
        data.active_vacancies?.toLocaleString() ?? "—";
      document.getElementById("analitica-total-usuarios").textContent =
        data.total_users?.toLocaleString() ?? "—";
      document.getElementById("analitica-total-empresas").textContent =
        data.total_companies?.toLocaleString() ?? "—";
    });
};

// -------------------------------------USUARIOS--------------------------------
let allUsers = [];

const renderUsers = (users) => {
  const tbody = document.getElementById("tabla-usuarios");
  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted small text-center">Sin usuarios.</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  for (let user of users) {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
              style="width:32px;height:32px;font-size:12px">${getInitials(user.full_name)}</div>
            <span class="small fw-semibold">${user.full_name ?? "—"}</span>
          </div>
        </td>
        <td class="small text-muted">${user.email ?? "—"}</td>
        <td class="small">${user.role ?? "—"}</td>
        <td class="small text-muted">${formatDate(user.created_at)}</td>
        <td>${statusBadge(user.is_active)}</td>
        <td>
          <button class="btn btn-sm text-light me-1" style="background-color:blue"
            onclick="toggleUser('${user.id_user}', ${user.is_active})">
            ${user.is_active ? "Suspender" : "Activar"}
          </button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteUser('${user.id_user}')">Eliminar</button>
        </td>
      </tr>`,
    );
  }
};

const loadUsers = () => {
  fetch(`${API_URL}/admin/users`, { headers: authHeaders })
    .then((reply) => reply.json())
    .then((data) => {
      allUsers = data;
      renderUsers(data);

      document.getElementById("ubicaciones-lista").innerHTML =
        renderLocationBadges(data);

      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const counts = Array(7).fill(0);
      const today = new Date();

      for (let u of data) {
        const d = new Date(u.created_at);
        const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
        if (diff < 7) counts[d.getDay()]++;
      }

      const chartData = days.map((label, i) => ({ label, value: counts[i] }));
      document.getElementById("grafico-barras").innerHTML =
        renderBarChart(chartData);

      const hoy = new Date().toLocaleDateString("es-SV");
      const registrosHoy = data.filter(
        (u) => new Date(u.created_at).toLocaleDateString("es-SV") === hoy,
      ).length;
      document.getElementById("analitica-registros-hoy").textContent =
        registrosHoy;
    });
};

const toggleUser = (id, active) => {
  fetch(`${API_URL}/admin/users/${id}/status`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ is_active: !active }),
  })
    .then((reply) => reply.json())
    .then(() => loadUsers());
};

const deleteUser = (id) => {
  if (!confirm("¿Desactivar este usuario?")) return;
  fetch(`${API_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders,
  })
    .then((reply) => reply.json())
    .then(() => loadUsers());
};

document
  .getElementById("buscar-usuario")
  .addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const filtered = allUsers.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term),
    );
    renderUsers(filtered);
  });

// -------------------------------COMPAÑIAS--------------------------------
let allCompanies = [];

const renderCompanies = (companies) => {
  const tbody = document.getElementById("tabla-empresas");
  if (!companies || companies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted small text-center">Sin empresas.</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  for (let company of companies) {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
              style="width:32px;height:32px;font-size:11px">${getInitials(company.name)}</div>
            <span class="small fw-semibold">${company.name ?? "—"}</span>
          </div>
        </td>
        <td class="small text-muted">${company.sector ?? "—"}</td>
        <td class="small text-muted">${company.location ?? "—"}</td>
        <td>${statusBadge(company.is_active)}</td>
        <td>
          <button class="btn btn-sm text-light me-1" style="background-color:blue"
            onclick="toggleCompany('${company.id_company}', ${company.is_active})">
            ${company.is_active ? "Suspender" : "Activar"}
          </button>
          <button class="btn btn-sm btn-danger"
            onclick="deleteCompany('${company.id_company}')">Eliminar</button>
        </td>
      </tr>`,
    );
  }
};

const loadCompanies = () => {
  fetch(`${API_URL}/admin/companies`, { headers: authHeaders })
    .then((reply) => reply.json())
    .then((data) => {
      allCompanies = data;
      renderCompanies(data);
    });
};

const toggleCompany = (id, active) => {
  fetch(`${API_URL}/admin/companies/${id}/status`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ is_active: !active }),
  })
    .then((reply) => reply.json())
    .then(() => loadCompanies());
};

const deleteCompany = (id) => {
  if (!confirm("¿Desactivar esta empresa?")) return;
  fetch(`${API_URL}/admin/companies/${id}`, {
    method: "DELETE",
    headers: authHeaders,
  })
    .then((reply) => reply.json())
    .then(() => loadCompanies());
};

document
  .getElementById("buscar-empresa")
  .addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const filtered = allCompanies.filter((company) =>
      company.name?.toLowerCase().includes(term),
    );
    renderCompanies(filtered);
  });

// ---------------------------------------------VACANTES---------------------------------
let allVacancies = [];

const renderVacancies = (vacancies) => {
  const tbody = document.getElementById("tabla-vacantes");
  if (!vacancies || vacancies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted small text-center">Sin vacantes.</td></tr>`;
    return;
  }
  tbody.innerHTML = "";
  for (let vacancy of vacancies) {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td class="small fw-semibold">${vacancy.title ?? "—"}</td>
        <td class="small text-muted">${vacancy.companies?.name ?? "—"}</td>
        <td class="small text-muted">${formatDate(vacancy.published_at)}</td>
        <td>${vacancyStatusBadge(vacancy.status)}</td>
        <td>
          <button class="btn btn-sm text-light me-1" style="background-color:blue"
            onclick="changeVacancyStatus('${vacancy.id_vacancy}', 'active')">Activar</button>
          <button class="btn btn-sm btn-warning text-dark me-1"
            onclick="changeVacancyStatus('${vacancy.id_vacancy}', 'paused')">Pausar</button>
          <button class="btn btn-sm btn-danger"
            onclick="changeVacancyStatus('${vacancy.id_vacancy}', 'deleted')">Eliminar</button>
        </td>
      </tr>`,
    );
  }
};

const loadVacancies = () => {
  fetch(`${API_URL}/admin/jobs`, { headers: authHeaders })
    .then((reply) => reply.json())
    .then((data) => {
      allVacancies = data;
      renderVacancies(data);

      document.getElementById("sectores-lista").innerHTML =
        renderSectorBars(data);

      const hoy = new Date().toLocaleDateString("es-SV");
      const vacantesHoy = data.filter(
        (v) => new Date(v.published_at).toLocaleDateString("es-SV") === hoy,
      ).length;
      document.getElementById("analitica-vacantes-hoy").textContent =
        vacantesHoy;
    });
};

const changeVacancyStatus = (id, status) => {
  fetch(`${API_URL}/admin/jobs/${id}/status`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ status }),
  })
    .then((reply) => reply.json())
    .then(() => loadVacancies());
};

document
  .getElementById("buscar-vacante")
  .addEventListener("input", function () {
    const term = this.value.toLowerCase();
    const filtered = allVacancies.filter((vacancy) =>
      vacancy.title?.toLowerCase().includes(term),
    );
    renderVacancies(filtered);
  });

// --------------------------------------REVIEWS-----------------------------------
const renderReviews = (reviews) => {
  const list = document.getElementById("lista-comentarios");
  if (!reviews || reviews.length === 0) {
    list.innerHTML =
      '<p class="text-muted small">Sin comentarios pendientes.</p>';
    return;
  }
  list.innerHTML = "";
  for (let review of reviews) {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 bg-light mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style="width:36px;height:36px;font-size:12px">${getInitials(review.users?.full_name ?? "?")}</div>
              <div>
                <p class="fw-semibold small mb-0">${review.users?.full_name ?? "Usuario"}</p>
                <p class="text-muted small mb-0">Valoración de empresa: ${review.companies?.name ?? "—"}</p>
              </div>
            </div>
            <span class="badge bg-dark">${review.status ?? "pending"}</span>
          </div>
          <p class="small mb-1">${review.comment ?? "Sin comentario."}</p>
          <p class="text-muted small mb-2">${formatDate(review.created_at)}</p>
          <button class="btn btn-outline-secondary btn-sm me-1"
            onclick="moderateReview('${review.id}', 'approved')">Aprobar</button>
          <button class="btn btn-outline-secondary btn-sm"
            onclick="moderateReview('${review.id}', 'rejected')">Rechazar</button>
        </div>
      </div>`,
    );
  }
};

const loadReviews = () => {
  fetch(`${API_URL}/admin/reviews`, { headers: authHeaders })
    .then((reply) => reply.json())
    .then((data) => renderReviews(data));
};

const moderateReview = (id, status) => {
  fetch(`${API_URL}/admin/reviews/${id}/status`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ status }),
  })
    .then((reply) => reply.json())
    .then(() => loadReviews());
};

loadMetrics();
loadUsers();
loadCompanies();
loadVacancies();
loadReviews();
