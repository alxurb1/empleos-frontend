document.addEventListener("DOMContentLoaded", () => {
  const btnSearch = document.getElementById("btnSearch");
  const vacanciesContainer = document.getElementById("vacanciesContainer");

  const renderVacancies = (vacancies) => {
    vacanciesContainer.innerHTML = "";

    if (!vacancies || vacancies.length === 0) {
      vacanciesContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <h5 class="text-muted"><i class="bi bi-search me-2"></i>No se encontraron vacantes con esos filtros.</h5>
        </div>
      `;
      return;
    }

    vacancies.forEach((vacancy) => {
      const salaryText = vacancy.salary_min
        ? `$${vacancy.salary_min} - $${vacancy.salary_max}`
        : "Salario a convenir";

      let modalityText = "No especificada";
      // Ajustamos para que coincida con lo que viene de tu base de datos
      if (vacancy.modality === "remote" || vacancy.modality === "Remoto")
        modalityText = "Remoto";
      if (vacancy.modality === "in_person" || vacancy.modality === "Presencial")
        modalityText = "Presencial";
      if (vacancy.modality === "hybrid" || vacancy.modality === "Hibrido")
        modalityText = "Híbrido";

      const cardHTML = `
        <div class="col-md-4">
          <div class="card border rounded-3 p-3 h-100 shadow-sm">
            <div class="d-flex gap-3 mb-2">
              <div class="bg-primary bg-opacity-10 rounded-2 d-flex align-items-center justify-content-center text-primary" style="width: 42px; height: 42px">
                <i class="bi bi-layers fs-5"></i>
              </div>
              <div>
                <p class="fw-bold mb-0 small text-truncate" style="max-width: 150px;">${vacancy.title}</p>
                <small class="text-muted">Empresa ID: ${vacancy.id_company ? vacancy.id_company.substring(0, 8) : "N/A"}...</small>
              </div>
            </div>
            <small class="text-muted d-block"><i class="bi bi-geo-alt me-1"></i>${vacancy.location || "Sin ubicación"}</small>
            <small class="text-muted d-block"><i class="bi bi-briefcase me-1"></i>${modalityText}</small>
            <small class="text-primary fw-bold d-block mt-1">${salaryText}</small>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <button class="btn btn-sm text-light" style="background-color: blue" onclick="window.location.href='vacancy_details.html?id=${vacancy.id_vacancy}'">Ver Más</button>
            </div>
          </div>
        </div>
      `;

      vacanciesContainer.innerHTML += cardHTML;
    });
  };

  const fetchVacancies = async (queryString = "") => {
    try {
      const url = `${API_URL}/vacancy/search?${queryString}`;
      console.log("Buscando en:", url); // Esto te ayudará a ver qué se envía
      const response = await fetch(url);
      const result = await response.json();

      if (response.ok) {
        renderVacancies(result.data);
      } else {
        console.error("Error del backend:", result.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  fetchVacancies();

  if (btnSearch) {
    btnSearch.addEventListener("click", () => {
      // USAMOS OPCIONAL CHAINING (?.) PARA EVITAR EL ERROR DE NULL
      const keyword = document.getElementById("searchKeyword")?.value || "";
      const location = document.getElementById("searchLocation")?.value || "";
      const type = document.getElementById("searchType")?.value || "";
      const salary = document.getElementById("searchSalary")?.value || "";
      const experience =
        document.getElementById("searchExperience")?.value || "";

      let queryParams = new URLSearchParams();

      if (keyword) queryParams.append("keyword", keyword);
      if (location) queryParams.append("location", location);
      if (type) queryParams.append("type", type);
      if (salary) queryParams.append("salary", salary);
      if (experience) queryParams.append("experience", experience);

      fetchVacancies(queryParams.toString());
    });
  }
});
