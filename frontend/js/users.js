import {
    getUsers,
    createUser,
    deleteUser,
    updateUser
} from "./api.js";

let editingUserId = null;

export async function loadUsers() {

    const tbody = document.querySelector("#users tbody");

    const users = await getUsers();

    tbody.innerHTML = "";

    if (users.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;

        return;

    }

    users.forEach(user => {

        tbody.innerHTML += `
            <tr>
                <td>${user.nombre}</td>
                <td>${user.rol}</td>
                <td>${user.estado}</td>
                <td>${user.ultimoAcceso ?? "-"}</td>

                <td>

                    <button class="edit-btn" data-id="${user.id_usuario}">
                        ✏️
                    </button>

                    <button class="delete-btn" data-id="${user.id_usuario}">
                        <i class="bi bi-trash3-fill"></i>
                    </button>

                </td>

            </tr>
        `;

    });

    // ========= BORRAR =========

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.addEventListener("click", async () => {

            const id = button.dataset.id;

            const confirmar = confirm("¿Eliminar este usuario?");

if (!confirmar) return;

await deleteUser(id);

alert("Usuario eliminado correctamente");

await loadUsers();

        });

    });

    // ========= EDITAR =========

    document.querySelectorAll(".edit-btn").forEach(button => {

    button.addEventListener("click", () => {

        const id = button.dataset.id;

        editingUserId = Number(id);

        const user = users.find(u => u.id_usuario == id);

        document.getElementById("nombre").value = user.nombre;
        document.getElementById("email").value = user.email;
        document.getElementById("rol").value = String(user.id_rol);
       
        document.getElementById("estado").value = user.estado;

        document.getElementById("userModalTitle").textContent = "Editar usuario";
        document.getElementById("saveUser").textContent = "Guardar cambios";

        document.getElementById("userModal").classList.remove("hidden");

    });

});

}

export function initUsersModal() {

    const modal = document.getElementById("userModal");

    const openButton = document.querySelector("#users .btn-primary");

    const cancelButton = document.getElementById("cancelUser");

    const form = document.getElementById("userForm");

    openButton.addEventListener("click", () => {

    editingUserId = null;

    form.reset();

    document.getElementById("userModalTitle").textContent = "Nuevo usuario";

    document.getElementById("saveUser").textContent = "Crear usuario";

    modal.classList.remove("hidden");

});

    cancelButton.addEventListener("click", () => {

    editingUserId = null;

    form.reset();

    document.getElementById("userModalTitle").textContent = "Nuevo usuario";

    document.getElementById("saveUser").textContent = "Crear usuario";

    modal.classList.add("hidden");

});

    form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();

    if (nombre === "") {

        alert("El nombre es obligatorio.");

        return;

    }

    if (email === "") {

        alert("El email es obligatorio.");

        return;

    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

        alert("El email no tiene un formato válido.");

        return;

    }

    const user = {

        nombre,
        email,
        password: "1234",
        id_rol: document.getElementById("rol").value,
        estado: document.getElementById("estado").value

    };

    if (editingUserId === null) {

    await createUser(user);

    alert("Usuario creado correctamente");

} else {

    await updateUser(Number(editingUserId), user);

    alert("Usuario actualizado correctamente");

}

    editingUserId = null;

form.reset();

modal.classList.add("hidden");

await loadUsers();

});

}