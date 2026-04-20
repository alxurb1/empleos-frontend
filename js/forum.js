const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

if (!userId) {
  alert("Debes iniciar sesión primero.");
  window.location.href = "login.html";
}

const headers = { "Content-Type": "application/json" };

const loadPosts = (category = null) => {
  let url = `${API_URL}/forum/posts`;
  if (category) url += `?category=${category}`;

  fetch(url)
    .then((reply) => reply.json())
    .then((posts) => {
      const list = document.getElementById("posts-lista");
      list.innerHTML = "";

      if (!posts || posts.length === 0) {
        list.innerHTML =
          '<p class="text-muted small p-3">No hay discusiones aún.</p>';
        return;
      }

      for (let post of posts) {
        list.insertAdjacentHTML(
          "beforeend",
          `
          <div class="card border-0 bg-light mb-2">
            <div class="card-body py-2 px-3">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex align-items-center gap-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style="width: 38px; height: 38px; min-width: 38px; font-size: 13px">
                    U
                  </div>
                  <div>
                    <p class="fw-semibold small mb-0">${post.title}</p>
                    <p class="text-muted small mb-0">Usuario ID: ${post.user_id}</p>
                  </div>
                </div>
                <span class="badge bg-dark">${post.category}</span>
              </div>
              <div class="mt-2 ms-5">
                <p class="small mb-2 text-secondary">${post.content}</p>
                <button class="btn text-danger p-0" style="font-size: 11px" onclick="deletePost('${post.id}')">
                   <i class="bi bi-trash"></i> Eliminar
                </button>
              </div>
            </div>
          </div>`,
        );
      }
    });
};

const createPost = () => {
  const title = document.getElementById("post-titulo").value.trim();
  const content = document.getElementById("post-contenido").value.trim();
  const category = document.getElementById("post-categoria").value; // Captura la categoría seleccionada

  if (!title || !content) {
    alert("Título y contenido son obligatorios.");
    return;
  }

  const body = {
    user_id: userId,
    title: title,
    content: content,
    category: category,
  };

  fetch(`${API_URL}/forum/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((reply) => {
    document.getElementById("post-titulo").value = "";
    document.getElementById("post-contenido").value = "";
    loadPosts();
  });
};

const deletePost = (postId) => {
  if (!confirm("¿Eliminar esta discusión?")) return;
  fetch(`${API_URL}/forum/posts/${postId}`, { method: "DELETE" }).then(() =>
    loadPosts(),
  );
};

loadPosts();
