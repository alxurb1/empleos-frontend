const PAGE_ROLES = {
  "admin.html": ["admin"],
  "home.html": ["candidate", "company"],
  "profile.html": ["candidate", "company", "admin"],
  "profileEdit.html": ["candidate"],
  "perfil_empresa.html": ["candidate", "company"],
  "companyEdit.html": ["company"],
  "vacancy_details.html": ["candidate", "company"],
  "search_results.html": ["candidate", "company"],
  "forums_and_ratings.html": ["candidate", "company"],
  "resources.html": ["candidate"],
  "cv_resources.html": ["candidate"],
  "development_resources.html": ["candidate"],
  "interviews_resources.html": ["candidate"],
  "skills_resources.html": ["candidate"],
};

const checkAccess = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const currentPage = window.location.pathname.split("/").pop();
  const allowedRoles = PAGE_ROLES[currentPage];

  const revealPage = () => {
    if (document.body) {
      document.body.style.setProperty("display", "block", "important");
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.style.setProperty("display", "block", "important");
      });
    }
  };

  if (!allowedRoles) {
    revealPage();
    return;
  }

  if (!token || !role) {
    window.location.href = "/pages/login.html";
    return;
  }

  if (allowedRoles.includes(role)) {
    revealPage();
  } else {
    alert("No tienes permiso para acceder a esta página.");
    if (role === "admin") {
      window.location.href = "/pages/admin.html";
    } else {
      window.location.href = "/pages/home.html";
    }
  }
};

checkAccess();
