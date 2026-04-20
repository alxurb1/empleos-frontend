let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 6;

const formatSalary = (min, max) => {
  if (!min && !max) return null;
  if (min && max)
    return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
  if (min) return `Desde $${(min / 1000).toFixed(0)}K`;
  return `Hasta $${(max / 1000).toFixed(0)}K`;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Hace 1 día";
  return `Hace ${diff} días`;
};

const experienceBadge = (level) => {
  const map = {
    junior: "Junior",
    mid: "Medio",
    senior: "Senior",
    executive: "Ejecutivo",
  };
  return map[level] ?? level ?? "";
};

const contractLabel = (type) => {
  const map = {
    full_time: "Tiempo Completo",
    part_time: "Medio Tiempo",
    freelance: "Freelance",
    contract: "Contrato",
  };
  return map[type] ?? type ?? "";
};

const renderJobs = (jobs) => {
  const container = document.getElementById("jobs-container");
  const countEl = document.getElementById("jobs-count");
  const paginationEl = document.getElementById("pagination");

  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const start = (currentPage - 1) * jobsPerPage;
  const paginated = jobs.slice(start, start + jobsPerPage);

  countEl.textContent = jobs.length;

  if (paginated.length === 0) {
    container.innerHTML = `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-search fs-1 text-muted"></i>
          <p class="text-muted mt-3">No se encontraron empleos con los filtros seleccionados.</p>
        </div>
      </div>`;
    paginationEl.innerHTML = "";
    return;
  }

  container.innerHTML = "";

  for (let job of paginated) {
    const salary = formatSalary(job.salary_min, job.salary_max);
    const badge = experienceBadge(job.experience_level);
    const contract = contractLabel(job.contract_type);

    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex gap-3">
              <div class="bg-light rounded p-2 d-flex align-items-center justify-content-center" style="width:45px;height:45px;">
                <i class="bi bi-stack fs-5 text-primary"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0">${job.title ?? "—"}</h6>
                <p class="text-muted small mb-1">${job.companies?.name ?? "—"}</p>
                ${job.description ? `<p class="text-muted small mb-2">${job.description.slice(0, 80)}${job.description.length > 80 ? "..." : ""}</p>` : ""}
                <div class="d-flex gap-3 flex-wrap">
                  ${job.location ? `<span class="small text-muted"><i class="bi bi-geo-alt me-1"></i>${job.location}</span>` : ""}
                  ${contract ? `<span class="small text-muted"><i class="bi bi-briefcase me-1"></i>${contract}</span>` : ""}
                  ${salary ? `<span class="small text-success fw-semibold"><i class="bi bi-currency-dollar"></i>${salary}</span>` : ""}
                </div>
              </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-2">
              ${badge ? `<span class="badge bg-dark">${badge}</span>` : ""}
              <span class="text-muted" style="font-size:11px;">${timeAgo(job.published_at)}</span>
              <button class="btn text-light" style="background-color:blue;"
                onclick="window.location.href='vacancy_details.html?id=${job.id_vacancy}'">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>`,
    );
  }

  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let paginationHTML = `
    <nav><ul class="pagination justify-content-center">
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link text-muted" href="#" onclick="changePage(${currentPage - 1}); return false;">Anterior</a>
      </li>`;

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link ${i !== currentPage ? "text-muted" : ""}" href="#" onclick="changePage(${i}); return false;">${i}</a>
      </li>`;
  }

  paginationHTML += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link text-muted" href="#" onclick="changePage(${currentPage + 1}); return false;">Siguiente</a>
      </li>
    </ul></nav>`;

  paginationEl.innerHTML = paginationHTML;
};

const changePage = (page) => {
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderJobs(filteredJobs);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ---------------------------------------FILTROS---------------------------------------------------
const applyFilters = () => {
  const search =
    document.getElementById("search-input")?.value?.trim().toLowerCase() ?? "";

  const experienceLevels = ["junior", "medio", "senior", "ejecutivo"];
  const experienceMap = {
    junior: "junior",
    medio: "mid",
    senior: "senior",
    ejecutivo: "executive",
  };
  const selectedExperience = experienceLevels
    .filter((id) => document.getElementById(id)?.checked)
    .map((id) => experienceMap[id]);

  const categoryIds = [
    "tecnologia",
    "diseno",
    "marketing",
    "datos",
    "ventas",
    "rrhh",
  ];
  const categoryMap = {
    tecnologia: "Tecnología",
    diseno: "Diseño",
    marketing: "Marketing",
    datos: "Datos",
    ventas: "Ventas",
    rrhh: "Recursos Humanos",
  };
  const selectedCategories = categoryIds
    .filter((id) => document.getElementById(id)?.checked)
    .map((id) => categoryMap[id]);

  const contractIds = [
    "tiempoCompleto",
    "medioTiempo",
    "freelance",
    "contrato",
  ];
  const contractMap = {
    tiempoCompleto: "full_time",
    medioTiempo: "part_time",
    freelance: "freelance",
    contrato: "contract",
  };
  const selectedContracts = contractIds
    .filter((id) => document.getElementById(id)?.checked)
    .map((id) => contractMap[id]);

  filteredJobs = allJobs.filter((job) => {
    if (search) {
      const title = job.title?.toLowerCase() ?? "";
      const company = job.companies?.name?.toLowerCase() ?? "";
      if (!title.includes(search) && !company.includes(search)) return false;
    }
    if (
      selectedExperience.length > 0 &&
      !selectedExperience.includes(job.experience_level)
    )
      return false;

    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(job.category)
    )
      return false;

    if (
      selectedContracts.length > 0 &&
      !selectedContracts.includes(job.contract_type)
    )
      return false;

    return true;
  });

  currentPage = 1;
  renderJobs(filteredJobs);
};

const loadJobs = () => {
  document.getElementById("jobs-container").innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>`;

  fetch(`${API_URL}/vacancy`)
    .then((r) => r.json())
    .then((data) => {
      allJobs = Array.isArray(data) ? data : [];
      filteredJobs = allJobs;
      currentPage = 1;
      renderJobs(filteredJobs);
    })
    .catch(() => {
      document.getElementById("jobs-container").innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5 text-danger">
            <i class="bi bi-exclamation-triangle fs-1"></i>
            <p class="mt-3">Error al cargar los empleos. Verifica que el servidor esté activo.</p>
          </div>
        </div>`;
    });
};

document.getElementById("btn-limpiar")?.addEventListener("click", () => {
  document
    .querySelectorAll(".form-check-input")
    .forEach((cb) => (cb.checked = false));
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  applyFilters();
});

document.querySelectorAll(".form-check-input").forEach((cb) => {
  cb.addEventListener("change", applyFilters);
});

document
  .getElementById("search-input")
  ?.addEventListener("input", applyFilters);

loadJobs();
