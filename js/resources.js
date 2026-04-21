let recursos = [];

const categoryMap = {
  interviews: "Entrevistas",
  cv_portfolio: "CV y Portafolio",
  professional_development: "Desarrollo Profesional",
  technical_skills: "Habilidades Técnicas",
};

const typeMap = {
  article: "articulo",
  video: "video",
  tutorial: "tutorial",
};

const container = document.getElementById("recursos-container");
const inputSearch = document.getElementById("input-search-recursos");
const filterButtons = document.querySelectorAll(".btn-filter");

let currentFilter = "todos";

const pageCategory = container
  ? container.getAttribute("data-page-category")
  : null;

const renderResources = (filterType, searchTerm) => {
  if (!container) return;
  container.innerHTML = "";

  const filtered = recursos.filter((r) => {
    const matchesType = filterType === "todos" || r.type === filterType;
    const matchesSearch =
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !pageCategory || r.category === pageCategory;

    return matchesType && matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-muted col-12 text-center py-4">No se encontraron recursos.</p>`;
    return;
  }

  filtered.forEach((r) => {
    const isVideo = r.type === "video";
    const buttonText = isVideo ? "Ver Video" : "Ver Más";
    const bgHeader = isVideo ? "blue" : "#e9ecef";
    const textHeader = isVideo ? "text-light" : "text-primary";
    const btnClass = isVideo ? "btn text-light" : "btn btn-outline-primary";
    const btnStyle = isVideo ? 'style="background-color: blue"' : "";

    const isImage = r.icon && r.icon.startsWith("http");

    let mediaHTML = "";
    if (isImage) {
      mediaHTML = `<img src="${r.icon}" alt="Thumbnail" class="w-100 object-fit-cover rounded-top-3" style="height: 180px;">`;
    } else {
      mediaHTML = `
        <div class="text-center ${textHeader} rounded-top-3 p-5" style="background-color: ${bgHeader}; height: 180px; display: flex; align-items: center; justify-content: center;">
          <i class="bi ${r.icon || "bi-image"} fs-1"></i>
        </div>
      `;
    }

    const cardHTML = `
      <div class="col-12 col-md-6 col-lg-4 d-flex">
        <div class="card rounded-3 shadow-sm border-0 d-flex flex-column w-100">
          ${mediaHTML}
          <div class="p-4 d-flex flex-column flex-grow-1">
            <div class="mb-2">
              <span class="text-bg-dark rounded-5 px-3 py-1 text-uppercase fw-semibold" style="font-size:0.7rem">${r.category}</span>
            </div>
            <p class="fw-bold fs-5 mt-2 mb-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${r.title}</p>
            <p class="small text-muted mb-4">${r.details}</p>
            <div class="mt-auto">
              <a href="${r.url}" target="_blank" class="text-decoration-none">
                <button class="${btnClass} rounded-4 w-100 fw-bold py-2" ${btnStyle}>
                  ${buttonText}
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", cardHTML);
  });
};

if (filterButtons.length > 0) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      filterButtons.forEach((b) => {
        b.classList.remove("text-white");
        b.style.backgroundColor = "";
      });
      btn.classList.add("text-white");
      btn.style.backgroundColor = "blue";

      currentFilter = btn.dataset.filter;
      renderResources(currentFilter, inputSearch ? inputSearch.value : "");
    });
  });
}

if (inputSearch) {
  inputSearch.addEventListener("input", (e) => {
    renderResources(currentFilter, e.target.value);
  });
}

const fetchResources = async () => {
  try {
    const response = await fetch(`${API_URL}/resources`);
    if (!response.ok) throw new Error("Error fetching resources");

    const data = await response.json();

    recursos = data.map((dbRes) => ({
      id: dbRes.id_resource,
      type: typeMap[dbRes.content_type] || dbRes.content_type,
      category: categoryMap[dbRes.category] || dbRes.category,
      title: dbRes.title,
      details:
        dbRes.content_type === "video"
          ? `Video · ${dbRes.read_time_minutes || 0} min`
          : `${dbRes.read_time_minutes || 0} min de lectura · ${dbRes.view_count || 0} vistas`,
      url: dbRes.url,
      icon: dbRes.thumbnail_url,
    }));

    renderResources("todos", "");
  } catch (error) {
    console.error("Error al obtener los recursos:", error);
    if (container) {
      container.innerHTML = `<p class="text-danger col-12 text-center py-4">Hubo un problema al cargar los recursos. Verifica que tu servidor backend esté en ejecución y tenga la ruta /resources.</p>`;
    }
  }
};

fetchResources();
