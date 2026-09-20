export async function getUsers() {

    const response = await fetch("http://localhost:3000/api/users");

    const users = await response.json();

    return users;

}

export async function createUser(user) {

    const response = await fetch("http://localhost:3000/api/users", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(user)

    });

    return await response.json();

}

export async function deleteUser(id) {

    const response = await fetch(`http://localhost:3000/api/users/${id}`, {

        method: "DELETE"

    });

    return await response.json();

}

export async function updateUser(id, user) {

    const response = await fetch(`http://localhost:3000/api/users/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(user)

    });

    return await response.json();

}


export async function getServers() {

    const response = await fetch("http://localhost:3000/api/servers");

    return await response.json();

}

export async function createServer(server) {

    const response = await fetch("http://localhost:3000/api/servers", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(server)

    });

    return await response.json();

}


export async function updateServer(id, server) {

    const response = await fetch(`http://localhost:3000/api/servers/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(server)

    });

    return await response.json();

}

export async function deleteServer(id) {

    const response = await fetch(`http://localhost:3000/api/servers/${id}`, {

        method: "DELETE"

    });

    return await response.json();

}


export async function getLogs() {

    const response = await fetch("http://localhost:3000/api/logs");

    return await response.json();

}

export async function getDashboard() {

    const response = await fetch("http://localhost:3000/api/dashboard");

    return await response.json();

}

export async function getServerMetrics(id) {

    const response = await fetch(`http://localhost:3000/api/servers/${id}/metrics`);

    return await response.json();

}

export async function getPcMetrics(id) {

    const response = await fetch(`http://localhost:3000/api/pcs/${id}/metrics`);

    return await response.json();

}

export async function getAlerts() {
    const response = await fetch("http://localhost:3000/api/alerts");
    return await response.json();
}

//pcs

export async function getPcs() {

    const response = await fetch("http://localhost:3000/api/pcs");

    return await response.json();

}


export async function createPc(pc) {

    const response = await fetch("http://localhost:3000/api/pcs", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(pc)

    });

    return await response.json();

}


export async function updatePc(id, pc) {

    const response = await fetch(`http://localhost:3000/api/pcs/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(pc)

    });

    return await response.json();

}


export async function deletePc(id) {

    const response = await fetch(`http://localhost:3000/api/pcs/${id}`, {

        method: "DELETE"

    });

    return await response.json();

}