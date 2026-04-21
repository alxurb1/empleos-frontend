const PAGE_ROLES = {
  "admin.html": ["admin"],
  "profile.html": ["candidate", "company"],
  "profileEdit.html": ["candidate"],
  "perfil_empresa.html": ["candidate", "company"],
  "companyEdit.html": ["company"],
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
