const http = require('http');

// Configuración
const PORT = 8082;
const BASE_URL = `http://localhost:${PORT}/api`;
// ID de usuario real obtenido de la inspección anterior
const TEST_USER_ID = '1eacd32f-6561-4802-8d5c-8da80e51f788';

// Función helper para requests
const request = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

async function runTests() {
    console.log('🧪 Iniciando Verificación de APIs (Sin Borrado)...\n');

    // 1. TEST EJERCICIOS
    console.log('1️⃣   Probando API de Ejercicios (GET /exercises)...');
    try {
        const res = await request('GET', '/exercises');
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`   ✅ Éxito: Se obtuvieron ${res.data.length} ejercicios.`);
        } else {
            console.error('   ❌ Fallo:', res.status, res.data.message || res.data);
        }
    } catch (e) {
        console.error('   ❌ Error de conexión. ¿Está el servidor corriendo?');
    }

    // 2. TEST RUTINAS - CREAR
    console.log('\n2️⃣   Probando API de Rutinas - CREAR (POST /routines)...');
    let routineId = null;
    try {
        const newRoutine = {
            name: `Rutina Persistente ${Date.now()}`,
            day: 'Viernes',
            exercises: ['id_ex_A', 'id_ex_B'] // IDs simulados
        };
        const res = await request('POST', `/routines/${TEST_USER_ID}`, newRoutine);

        if (res.status === 201) {
            routineId = res.data.id;
            console.log(`   ✅ Éxito: Rutina creada. ID: ${routineId}`);
        } else {
            console.error('   ❌ Fallo:', res.status, res.data);
        }
    } catch (e) {
        console.error('   ❌ Error:', e.message);
    }

    // 3. TEST RUTINAS - LISTAR
    if (routineId) {
        console.log('\n3️⃣   Probando API de Rutinas - LISTAR (GET /routines)...');
        try {
            const res = await request('GET', `/routines/${TEST_USER_ID}`);
            if (res.status === 200 && Array.isArray(res.data)) {
                const found = res.data.find(r => r.id === routineId);
                if (found) {
                    console.log(`   ✅ Éxito: La rutina creada (${found.name}) aparece en la lista.`);
                    console.log(`   ℹ️  NOTA: La rutina NO se ha borrado. Puedes verla en la base de datos.`);
                } else {
                    console.warn('   ⚠️  Advertencia: Se obtuvo la lista pero no se encontró la rutina creada.');
                }
            } else {
                console.error('   ❌ Fallo:', res.status);
            }
        } catch (e) {
            console.error('   ❌ Error:', e.message);
        }
    }

    console.log('\n🏁 Verificación finalizada.');
    process.exit(0);
}

runTests();
