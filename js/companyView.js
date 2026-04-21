const getIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
};

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '<i class="bi bi-star-fill"></i>'.repeat(full) +
    '<i class="bi bi-star-half"></i>'.repeat(half) +
    '<i class="bi bi-star"></i>'.repeat(empty)
  );
};

const renderVacantes = (vacantes) => {
  const lista = document.getElementById("empleos-lista");
  if (!vacantes || vacantes.length === 0) {
    lista.innerHTML = '<p class="text-muted small">Sin vacantes activas.</p>';
    document.getElementById("stat-activos").textContent = 0;
    return;
  }
  lista.innerHTML = "";
  document.getElementById("stat-activos").textContent = vacantes.length;
  for (let v of vacantes) {
    const fecha = v.published_at
      ? new Date(v.published_at).toLocaleDateString("es-SV")
      : "";
    const modalidad = [v.modality, v.contract_type].filter(Boolean).join(" · ");
    lista.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 bg-light mb-2">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="fw-bold small mb-0">${v.title}</p>
              <p class="text-muted small mb-0">${v.location ?? ""} ${modalidad ? "· " + modalidad : ""}</p>
              <p class="text-muted small mb-0">Publicado el ${fecha}</p>
            </div>
            <a href="./vacancy_details.html?id=${v.id_vacancy}">
              <button class="btn btn-sm fw-bold text-light" style="background-color:blue">Ver Vacante</button>
            </a>
          </div>
        </div>
      </div>`,
    );
  }
};

const renderResenas = (reviews) => {
  const lista = document.getElementById("resenas-lista");
  if (!reviews || reviews.length === 0) {
    lista.innerHTML = '<p class="text-muted small">Sin reseñas aún.</p>';
    return;
  }
  lista.innerHTML = "";
  for (let r of reviews) {
    let displayName = r.reviewer_name ?? r.users?.full_name ?? "Anónimo";
    let displayPos = r.position ?? "";
    let displayPeriod = r.period ?? "";
    let displayComment = r.comment ?? "";

    if (displayComment.startsWith("[")) {
      const closeBracketIndex = displayComment.indexOf("]");
      if (closeBracketIndex !== -1) {
        const detailsStr = displayComment.substring(1, closeBracketIndex);
        const details = detailsStr.split(" - ");
        if (details.length > 0) displayName = details[0];
        if (details.length > 1) displayPos = details[1];
        if (details.length > 2) displayPeriod = details[2];
        displayComment = displayComment.substring(closeBracketIndex + 1).trim();
      }
    }

    lista.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card border-0 bg-light mb-2">
        <div class="card-body py-2 px-3">
          <div class="d-flex align-items-start gap-3">
            <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width:40px;height:40px">
              ${getInitials(displayName)}
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-center">
                <p class="fw-bold small mb-0">${displayName}</p>
                <span class="text-warning small">${renderStars(r.rating ?? 0)}</span>
              </div>
              <p class="text-muted small mb-1">${displayPos} ${displayPeriod ? "· " + displayPeriod : ""}</p>
              <p class="text-muted small mb-0">${displayComment}</p>
            </div>
          </div>
        </div>
      </div>`,
    );
  }
};

const renderPerfil = (
  empresa,
  benefits,
  values,
  ratingData,
  vacantes,
  reviews,
) => {
  document.getElementById("loading").classList.add("d-none");
  document.getElementById("contenido").classList.remove("d-none");

  const company = Array.isArray(empresa) ? empresa[0] : empresa;
  if (!company) {
    document.getElementById("error").classList.remove("d-none");
    return;
  }

  if (company.logo_url) {
    document.getElementById("avatar-img").src = company.logo_url;
    document.getElementById("avatar-img").classList.remove("d-none");
    document.getElementById("avatar-initials").classList.add("d-none");
  } else {
    document.getElementById("avatar-initials").textContent = getInitials(
      company.name,
    );
  }

  document.getElementById("nombre").textContent = company.name ?? "";
  document.getElementById("industria").textContent =
    company.sector ?? company.industry ?? "";

  const rating = ratingData.average_rating ?? 0;
  const totalReviews = ratingData.total_reviews ?? 0;
  document.getElementById("rating").innerHTML = `
    <span class="text-warning small">${renderStars(rating)}</span>
    ${Number(rating).toFixed(1)} <span class="text-muted">(${totalReviews} Reseñas)</span>`;

  document.getElementById("fundada").textContent =
    company.founded_year ?? "N/D";
  document.getElementById("empleados").textContent =
    company.size ?? company.employees_range ?? "N/D";
  document.getElementById("ubicacion").textContent = company.location ?? "N/D";
  document.getElementById("email").textContent = company.email ?? "N/D";
  document.getElementById("telefono").textContent = company.phone ?? "N/D";

  const linkedinEl = document.getElementById("linkedin");
  if (company.linkedin_url) {
    linkedinEl.href = company.linkedin_url;
  } else {
    linkedinEl.classList.add("d-none");
  }

  const webEl = document.getElementById("web");
  if (company.website) {
    webEl.href = company.website;
  } else {
    webEl.classList.add("d-none");
  }

  document.getElementById("vistas-perfil").textContent =
    company.profile_views ?? 0;

  document.getElementById("descripcion").textContent =
    company.description ?? "Sin descripción.";
  document.getElementById("mision").textContent =
    company.mission ?? "Sin misión registrada.";
  document.getElementById("vision").textContent =
    company.vision ?? "Sin visión registrada.";

  const beneficiosEl = document.getElementById("beneficios-lista");
  if (benefits && benefits.length > 0) {
    beneficiosEl.innerHTML = benefits
      .map(
        (b) =>
          `<li class="mb-1"><i class="bi bi-dot text-primary"></i> ${b.benefit}</li>`,
      )
      .join("");
  } else {
    beneficiosEl.innerHTML =
      '<li class="text-muted small">Sin beneficios registrados.</li>';
  }

  const valoresEl = document.getElementById("valores-lista");
  if (values && values.length > 0) {
    valoresEl.innerHTML = values
      .map(
        (v) =>
          `<li class="mb-1"><i class="bi bi-dot text-primary"></i> ${v.value_name}</li>`,
      )
      .join("");
  } else {
    valoresEl.innerHTML =
      '<li class="text-muted small">Sin valores registrados.</li>';
  }

  document.getElementById("stat-postulantes").textContent =
    company.total_applicants ?? 0;
  document.getElementById("stat-contratados").textContent =
    company.total_hired ?? 0;

  renderVacantes(vacantes);
  renderResenas(reviews);
};

const setupFormResena = (id) => {
  const form = document.getElementById("form-resena");
  const btnMostrar = document.getElementById("btn-resena");

  btnMostrar.addEventListener("click", () => {
    document.getElementById("seccion-form-resena").classList.toggle("d-none");
    btnMostrar.textContent = document
      .getElementById("seccion-form-resena")
      .classList.contains("d-none")
      ? "✏️ Escribir una Reseña"
      : "Cancelar";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnEnviar = document.getElementById("btn-enviar-resena");
    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    const name = document.getElementById("resena-nombre").value.trim();
    const pos = document.getElementById("resena-cargo").value.trim();
    const period = document.getElementById("resena-periodo").value.trim();
    const rawComment = document
      .getElementById("resena-comentario")
      .value.trim();

    let finalComment = rawComment;
    const details = [name, pos, period].filter(Boolean).join(" - ");
    if (details) {
      finalComment = `[${details}] ${rawComment}`;
    }

    const payload = {
      rating: parseInt(document.getElementById("resena-rating").value),
      comment: finalComment,
      user_id: localStorage.getItem("userId"),
    };

    try {
      const res = await fetch(`${API_URL}/reviews/company/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Error al enviar la reseña");
        return;
      }

      const nueva = await res.json();
      document.getElementById("seccion-form-resena").classList.add("d-none");
      btnMostrar.textContent = "Escribir una Reseña";
      form.reset();

      const lista = document.getElementById("resenas-lista");
      if (lista.querySelector("p")) lista.innerHTML = "";

      let displayName = name || "Anónimo";
      let displayPos = pos || "";
      let displayPeriod = period || "";
      let displayComment = rawComment || "";

      lista.insertAdjacentHTML(
        "afterbegin",
        `
    <div class="card border-0 bg-light mb-2">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-start gap-3">
          <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width:40px;height:40px">
            ${getInitials(displayName)}
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
              <p class="fw-bold small mb-0">${displayName}</p>
              <span class="text-warning small">${renderStars(nueva.rating ?? 0)}</span>
            </div>
            <p class="text-muted small mb-1">${displayPos} ${displayPeriod ? "· " + displayPeriod : ""}</p>
            <p class="text-muted small mb-0">${displayComment}</p>
          </div>
        </div>
      </div>
    </div>`,
      );
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar Reseña";
    }
  });
};

const incrementarVisitas = async (id, currentViews) => {
  await fetch(`${API_URL}/companies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile_views: (currentViews ?? 0) + 1 }),
  }).catch(() => {});
};

const getEmpresa = async () => {
  const id = getIdFromURL();
  if (!id) {
    document.getElementById("loading").classList.add("d-none");
    document.getElementById("error").classList.remove("d-none");
    return;
  }

  try {
    const [
      empresaRes,
      benefitsRes,
      valuesRes,
      ratingRes,
      vacantesRes,
      reviewsRes,
    ] = await Promise.all([
      fetch(`${API_URL}/companies/companiaId/${id}`),
      fetch(`${API_URL}/companies/${id}/benefits`),
      fetch(`${API_URL}/companies/${id}/values`),
      fetch(`${API_URL}/companies/${id}/rating`),
      fetch(`${API_URL}/vacancy/company/${id}`),
      fetch(`${API_URL}/reviews/company/${id}`),
    ]);

    const empresa = await empresaRes.json();
    const benefits = await benefitsRes.json();
    const values = await valuesRes.json();
    const ratingData = await ratingRes.json();
    const vacantes = await vacantesRes.json();
    const reviews = await reviewsRes.json();

    const company = Array.isArray(empresa) ? empresa[0] : empresa;
    renderPerfil(empresa, benefits, values, ratingData, vacantes, reviews);
    setupFormResena(id);
    incrementarVisitas(id, company?.profile_views);

    document.getElementById("empleos-activos").textContent = Array.isArray(
      vacantes,
    )
      ? vacantes.length
      : 0;
  } catch {
    document.getElementById("loading").classList.add("d-none");
    document.getElementById("error").classList.remove("d-none");
  }
};

getEmpresa();
