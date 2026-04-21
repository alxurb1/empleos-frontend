const ROLES = {
  candidate: "candidate",
  company: "company",
  admin: "admin",
};

const getIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const currentRole = localStorage.getItem("userRole");

if (currentRole === ROLES.company) {
  document.getElementById("btn-postular").classList.add("d-none");
}

const formatK = (num) => `${Math.round(num / 1000)}K`;

const formatSalario = (min, max) => {
  if (!min && !max) return "Salario no especificado";
  if (min && max) return `$${formatK(min)} - $${formatK(max)} mensual`;
  if (min) return `Desde $${formatK(min)} mensual`;
  return `Hasta $${formatK(max)} mensual`;
};

const formatFecha = (fecha) => {
  if (!fecha) return "";
  const dias = Math.floor(
    (new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24),
  );
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Hace 1 día";
  return `Hace ${dias} días`;
};

const formatContrato = (tipo) => {
  const tipos = {
    full_time: "Tiempo Completo",
    part_time: "Medio Tiempo",
    freelance: "Freelance",
    contract: "Contrato",
  };
  return tipos[tipo] ?? tipo ?? "No especificado";
};

const formatNivel = (nivel) => {
  const niveles = {
    junior: "Junior",
    mid: "Mid",
    senior: "Senior",
    executive: "Ejecutivo",
  };
  return niveles[nivel] ?? nivel ?? "";
};

const renderEmpleosSimilares = (vacantes) => {
  const lista = document.getElementById("empleos-similares");

  if (!vacantes || vacantes.length === 0) {
    lista.innerHTML = '<p class="text-muted small">Sin empleos similares.</p>';
    return;
  }

  lista.innerHTML = "";

  for (let v of vacantes) {
    lista.insertAdjacentHTML(
      "beforeend",
      `<div class="d-flex align-items-center gap-3 mb-3">
              <div class="bg-light rounded p-2 d-flex align-items-center justify-content-center"
                style="width: 40px; height: 40px">
                <i class="bi bi-stack text-primary"></i>
              </div>
              <div>
                <a href="detalle-empleo.html?id=${v.id_vacancy}"
                  class="fw-bold small mb-0 text-dark text-decoration-none d-block">
                  ${v.title}
                </a>
                <p class="text-muted small mb-0">${v.companies?.name ?? ""}</p>
              </div>
            </div>`,
    );
  }
};

const renderVacante = (vacante) => {
  document.getElementById("loading").classList.add("d-none");
  document.getElementById("contenido").classList.remove("d-none");

  document.getElementById("titulo").textContent = vacante.title ?? "";
  document.getElementById("nivel").textContent = formatNivel(
    vacante.experience_level,
  );
  document.getElementById("empresa-nombre").textContent =
    vacante.companies?.name ?? "";
  document.getElementById("ubicacion").textContent =
    vacante.location ?? "No especificada";
  document.getElementById("contrato").textContent = formatContrato(
    vacante.contract_type,
  );
  document.getElementById("salario").textContent = formatSalario(
    vacante.salary_min,
    vacante.salary_max,
  );
  document.getElementById("fecha").textContent = formatFecha(
    vacante.published_at,
  );

  document.getElementById("descripcion").textContent =
    vacante.description ?? "Sin descripción.";
  document.getElementById("requisitos").textContent =
    vacante.requirements ?? "Sin requisitos especificados.";
  document.getElementById("beneficios").textContent =
    vacante.benefits ?? "Sin beneficios especificados.";

  document.getElementById("empresa-nombre-2").textContent =
    vacante.companies?.name ?? "";
  document.getElementById("empresa-ubicacion").textContent =
    vacante.companies?.location ?? "";
  document.getElementById("empresa-tamanio").textContent =
    vacante.companies?.size ?? "";
  document.getElementById("empresa-sector").textContent =
    vacante.companies?.sector ?? "";
  document.getElementById("empresa-descripcion").textContent =
    vacante.companies?.description ?? "";
  document.getElementById("empresa-email").textContent =
    vacante.companies?.email ?? "";
  document.getElementById("empresa-telefono").textContent =
    vacante.companies?.phone ?? "";
  document.getElementById("empresa-web").textContent =
    vacante.companies?.website ?? "";

  if (vacante.companies?.id_company) {
    document.getElementById("empresa-link").href =
      `perfil-empresa.html?id=${vacante.companies.id_company}`;
  }

  document.getElementById("btn-postular").addEventListener("click", () => {
    postularse(vacante.id_vacancy);
  });

  const logoUrl = vacante.companies?.logo_url;

  const logoHeader = document.getElementById("logo-header");
  const logoHeaderFallback = document.getElementById("logo-header-fallback");
  const logoEmpresa = document.getElementById("logo-empresa");
  const logoEmpresaFallback = document.getElementById("logo-empresa-fallback");

  if (logoUrl) {
    logoHeader.src = logoUrl;
    logoHeader.classList.remove("d-none");
    logoHeaderFallback.classList.add("d-none");

    logoEmpresa.src = logoUrl;
    logoEmpresa.classList.remove("d-none");
    logoEmpresaFallback.classList.add("d-none");
  }
};

const postularse = (id_vacancy) => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Debes iniciar sesión para postularte.");
    return;
  }

  fetch(`${API_URL}/vacancy/${id_vacancy}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_user: userId }),
  })
    .then((reply) => reply.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
      } else {
        alert("¡Postulación enviada correctamente!");
      }
    })
    .catch(() => alert("Error al enviar la postulación."));
};

const getVacante = () => {
  const id = getIdFromURL();

  if (!id) {
    document.getElementById("loading").classList.add("d-none");
    document.getElementById("error").classList.remove("d-none");
    return;
  }

  fetch(`${API_URL}/vacancy/${id}`)
    .then((reply) => reply.json())
    .then((data) => {
      renderVacante(data);

      if (data.category) {
        fetch(`${API_URL}/vacancy?category=${data.category}`)
          .then((reply) => reply.json())
          .then((similares) => {
            const filtrados = similares
              .filter((v) => v.id_vacancy !== data.id_vacancy)
              .slice(0, 3);
            renderEmpleosSimilares(filtrados);
          });
      }
    })
    .catch(() => {
      document.getElementById("loading").classList.add("d-none");
      document.getElementById("error").classList.remove("d-none");
    });
};

getVacante();
