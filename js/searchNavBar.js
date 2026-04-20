document
  .getElementById("navbar-search")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const query = this.value.trim();
      if (query) {
        window.location.href = `./search_results.html?q=${encodeURIComponent(query)}`;
      } else {
        window.location.href = "./search_results.html";
      }
    }
  });
