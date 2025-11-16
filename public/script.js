// URL de tu API - FIJO a la URL de tu backend desplegado en Railway
const API_URL = 'https://postman-production-086e.up.railway.app';

// Variable global para almacenar el rol del usuario
let currentUserRole = null;

// Función para hacer login
async function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const alertDiv = document.getElementById('loginAlert');

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }

        const data = await response.json();

        // Guardar token y datos en sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('role', data.role);

        currentUserRole = data.role;

        // Mostrar interfaz según el rol
        showDashboard(data);

        console.log('✓ Login exitoso:', data);

    } catch (error) {
        alertDiv.textContent = '❌ ' + error.message;
        alertDiv.classList.remove('hidden');

        setTimeout(() => {
            alertDiv.classList.add('hidden');
        }, 3000);

        console.error('✗ Error al iniciar sesión:', error);
    }
}

// Función para mostrar el dashboard según el rol
function showDashboard(userData) {
    // Ocultar login, mostrar contenido
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('contentSection').classList.add('active');

    // Mostrar info del usuario
    document.getElementById('displayUsername').textContent = userData.username;
    document.getElementById('displayEmail').textContent = userData.email;
    document.getElementById('displayRole').textContent = userData.role;

    // Generar panel de acciones según el rol
    const actionsPanel = document.getElementById('actionsPanel');

    if (userData.role === 'ADMIN') {
        actionsPanel.innerHTML = `
            <button onclick="loadUsuarios()" class="btn btn-secondary">
                👥 Gestionar Usuarios
            </button>
            <button onclick="loadLogs()" class="btn btn-secondary">
                📋 Ver Logs del Sistema
            </button>
            <button onclick="loadPersonajes()" class="btn btn-secondary">
                🎭 Ver Personajes
            </button>
            <button onclick="loadHabilidades()" class="btn btn-secondary">
                ⚔️ Ver Habilidades
            </button>
        `;
    } else if (userData.role === 'USER') {
        actionsPanel.innerHTML = `
            <button onclick="loadPersonajes()" class="btn btn-secondary">
                🎭 Mis Personajes
            </button>
            <button onclick="loadHabilidades()" class="btn btn-secondary">
                ⚔️ Catálogo de Habilidades
            </button>
            <button onclick="showUserProfile()" class="btn btn-secondary">
                👤 Mi Perfil
            </button>
        `;
    } else {
        actionsPanel.innerHTML = `
            <button onclick="loadPersonajes()" class="btn btn-secondary">
                🎭 Ver Personajes
            </button>
            <button onclick="loadHabilidades()" class="btn btn-secondary">
                ⚔️ Ver Habilidades
            </button>
        `;
    }

    // Mostrar mensaje de bienvenida
    showWelcomeMessage(userData);
}

// Función para mostrar mensaje de bienvenida
function showWelcomeMessage(userData) {
    const dynamicContent = document.getElementById('dynamicContent');
    const greeting = userData.role === 'ADMIN' ? 'Administrador' : 'Jugador';

    dynamicContent.innerHTML = `
        <div class="alert alert-info">
            <h3>¡Bienvenido, ${greeting}!</h3>
            <p>Has iniciado sesión como **${userData.username}** con rol **${userData.role}**.</p>
            <p>Usa los botones de arriba para gestionar tu contenido.</p>
        </div>
    `;
}

// ========== FUNCIONES PARA ADMIN ==========

// Función para cargar usuarios (solo ADMIN)
async function loadUsuarios() {
    const token = sessionStorage.getItem('token');
    const dynamicContent = document.getElementById('dynamicContent');

    try {
        dynamicContent.innerHTML = '<div class="loading">⏳ Cargando usuarios...</div>';

        const response = await fetch(`${API_URL}/api/usuarios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('No tienes permisos para ver esta información');
        }

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const usuarios = await response.json();

        if (usuarios.length === 0) {
            dynamicContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>No hay usuarios registrados</p>
                </div>
            `;
            return;
        }

        // Mostrar usuarios en tabla
        let tableHTML = `
            <div class="data-section">
                <h3>👥 Gestión de Usuarios</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Correo</th>
                                <th>Rol</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        usuarios.forEach(u => {
            tableHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>**${u.nombreUsuario}**</td>
                    <td>${u.correo}</td>
                    <td><span class="role-badge">${u.role}</span></td>
                </tr>
            `;
        });

        tableHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        dynamicContent.innerHTML = tableHTML;
        console.log('✓ Usuarios cargados:', usuarios);

    } catch (error) {
        dynamicContent.innerHTML = `
            <div class="alert alert-error">
                ❌ ${error.message}
            </div>
        `;
        console.error('✗ Error al cargar usuarios:', error);
    }
}

// Función para cargar logs (solo ADMIN)
async function loadLogs() {
    const token = sessionStorage.getItem('token');
    const dynamicContent = document.getElementById('dynamicContent');

    try {
        dynamicContent.innerHTML = '<div class="loading">⏳ Cargando logs del sistema...</div>';

        const response = await fetch(`${API_URL}/api/logs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('No tienes permisos para ver los logs');
        }

        if (!response.ok) {
            throw new Error('Error al cargar logs');
        }

        const logs = await response.json();

        if (logs.length === 0) {
            dynamicContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>No hay logs registrados</p>
                </div>
            `;
            return;
        }

        // Mostrar logs en tabla
        let tableHTML = `
            <div class="data-section">
                <h3>📋 Logs del Sistema</h3>
                <p style="color: #666; margin-bottom: 15px;">
                    Total de solicitudes registradas: **${logs.length}**
                </p>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Método</th>
                                <th>Ruta</th>
                                <th>IP</th>
                                <th>Fecha/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Ordenar logs por fecha (más recientes primero)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        logs.forEach(log => {
            const date = new Date(log.timestamp);
            const formattedDate = date.toLocaleString('es-ES');

            let methodClass = '';
            if (log.method === 'GET') methodClass = 'style="color: #27ae60;"';
            else if (log.method === 'POST') methodClass = 'style="color: #3498db;"';
            else if (log.method === 'PUT') methodClass = 'style="color: #f39c12;"';
            else if (log.method === 'DELETE') methodClass = 'style="color: #e74c3c;"';

            tableHTML += `
                <tr>
                    <td>${log.id}</td>
                    <td ${methodClass}>**${log.method}**</td>
                    <td><code>${log.path}</code></td>
                    <td>${log.ip}</td>
                    <td>${formattedDate}</td>
                </tr>
            `;
        });

        tableHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        dynamicContent.innerHTML = tableHTML;
        console.log('✓ Logs cargados:', logs.length, 'registros');

    } catch (error) {
        dynamicContent.innerHTML = `
            <div class="alert alert-error">
                ❌ ${error.message}
            </div>
        `;
        console.error('✗ Error al cargar logs:', error);
    }
}

// ========== FUNCIONES PARA USER Y ADMIN ==========

// Función para cargar personajes
async function loadPersonajes() {
    const token = sessionStorage.getItem('token');
    const dynamicContent = document.getElementById('dynamicContent');

    try {
        dynamicContent.innerHTML = '<div class="loading">⏳ Cargando personajes...</div>';

        const response = await fetch(`${API_URL}/api/personajes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
        }

        if (!response.ok) {
            throw new Error('Error al cargar personajes');
        }

        const personajes = await response.json();

        if (personajes.length === 0) {
            dynamicContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎭</div>
                    <p>No hay personajes disponibles</p>
                </div>
            `;
            return;
        }

        // Mostrar personajes en cards
        let cardsHTML = `
            <div class="data-section">
                <h3>🎭 ${currentUserRole === 'ADMIN' ? 'Todos los Personajes' : 'Mis Personajes'}</h3>
                <div class="data-list">
        `;

        personajes.forEach(p => {
            cardsHTML += `
                <div class="data-card">
                    <h4>${p.nombre}</h4>
                    <p>**Tipo:** ${p.tipo}</p>
                    <p>**⚔️ Ataque:** ${p.ataque}</p>
                    <p>**🛡️ Defensa:** ${p.defensa}</p>
                    <p>**💪 Estamina:** ${p.estamina}</p>
                    <p style="margin-top: 10px; font-size: 0.85rem; opacity: 0.9;">
                        ${p.descripcion}
                    </p>
                </div>
            `;
        });

        cardsHTML += `
                </div>
            </div>
        `;

        dynamicContent.innerHTML = cardsHTML;
        console.log('✓ Personajes cargados:', personajes);

    } catch (error) {
        dynamicContent.innerHTML = `
            <div class="alert alert-error">
                ❌ ${error.message}
            </div>
        `;
        console.error('✗ Error al cargar personajes:', error);
    }
}

// Función para cargar habilidades
async function loadHabilidades() {
    const token = sessionStorage.getItem('token');
    const dynamicContent = document.getElementById('dynamicContent');

    try {
        dynamicContent.innerHTML = '<div class="loading">⏳ Cargando habilidades...</div>';

        const response = await fetch(`${API_URL}/api/habilidades`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error('Token inválido o expirado.');
        }

        if (!response.ok) {
            throw new Error('Error al cargar habilidades');
        }

        const habilidades = await response.json();

        if (habilidades.length === 0) {
            dynamicContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚔️</div>
                    <p>No hay habilidades disponibles</p>
                </div>
            `;
            return;
        }

        // Mostrar habilidades en cards
        let cardsHTML = `
            <div class="data-section">
                <h3>⚔️ Catálogo de Habilidades</h3>
                <div class="data-list">
        `;

        habilidades.forEach(h => {
            cardsHTML += `
                <div class="data-card">
                    <h4>${h.nombre}</h4>
                    <p style="margin: 10px 0;">${h.descripcion}</p>
                    <p>**⚔️ Ataque:** ${h.incrementoAtaque > 0 ? '+' : ''}${h.incrementoAtaque}</p>
                    <p>**🛡️ Defensa:** ${h.incrementoDefensa > 0 ? '+' : ''}${h.incrementoDefensa}</p>
                    <p>**💪 Estamina:** ${h.incrementoEstamina > 0 ? '+' : ''}${h.incrementoEstamina}</p>
                </div>
            `;
        });

        cardsHTML += `
                </div>
            </div>
        `;

        dynamicContent.innerHTML = cardsHTML;
        console.log('✓ Habilidades cargadas:', habilidades);

    } catch (error) {
        dynamicContent.innerHTML = `
            <div class="alert alert-error">
                ❌ ${error.message}
            </div>
        `;
        console.error('✗ Error al cargar habilidades:', error);
    }
}

// Función para mostrar perfil de usuario (solo USER)
function showUserProfile() {
    const dynamicContent = document.getElementById('dynamicContent');
    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');

    dynamicContent.innerHTML = `
        <div class="data-section">
            <h3>👤 Mi Perfil</h3>
            <div class="user-info" style="max-width: 600px;">
                <p>**Nombre de usuario:** ${username}</p>
                <p>**Correo electrónico:** ${email}</p>
                <p>**Rol:** <span class="role-badge">${role}</span></p>
                <p style="margin-top: 20px; opacity: 0.8; font-size: 0.9rem;">
                    💡 Como usuario registrado puedes crear personajes, asignarles habilidades
                    y explorar el mundo del juego.
                </p>
            </div>
        </div>
    `;
}

// Función para cerrar sesión
function logout() {
    sessionStorage.clear();
    currentUserRole = null;
    location.reload();
}

// Verificar si ya hay sesión al cargar la página
window.onload = function() {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');

    if (token && username && email && role) {
        currentUserRole = role;
        showDashboard({
            token: token,
            username: username,
            email: email,
            role: role
        });
    }
};