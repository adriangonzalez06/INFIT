#!/usr/bin/env node

/**
 * Verificador de cambios realizados
 * Este script verifica que todos los cambios se hayan aplicado correctamente
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function check(description, filePath, searchString) {
    const fullPath = path.join(__dirname, filePath);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const found = content.includes(searchString);
        checks.push({
            description,
            filePath,
            passed: found
        });
        return found;
    } catch (error) {
        checks.push({
            description,
            filePath,
            passed: false,
            error: error.message
        });
        return false;
    }
}

console.log('\n🔍 Verificando cambios realizados...\n');

// Verificaciones
check(
    '✅ Controlador: Método create() mejorado',
    'Backend/src/controller/infopersonalizeddiet.controller.js',
    'const dietData = {'
);

check(
    '✅ Controlador: Logging de guardado',
    'Backend/src/controller/infopersonalizeddiet.controller.js',
    '📝 Guardando dieta personalizada:'
);

check(
    '✅ Servicio: serverTimestamp() en create()',
    'Backend/src/service/firestoreservice.js',
    'admin.firestore.FieldValue.serverTimestamp()'
);

check(
    '✅ Servicio: Logging mejorado en create()',
    'Backend/src/service/firestoreservice.js',
    '[firestore] Creando documento en'
);

check(
    '✅ Frontend: Mejor manejo de errores',
    'Frontend/views/AddDietMenu.js',
    'errorData.details || errorData.error'
);

check(
    '✅ Test: Script de prueba de Firestore',
    'Backend/test-firestore.js',
    'testFirestore'
);

// Mostrar resultados
console.log('┌──────────────────────────────────────────────────────┐');
console.log('│              RESULTADOS DE VERIFICACIÓN              │');
console.log('└──────────────────────────────────────────────────────┘\n');

let allPassed = true;
checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    console.log(`${status} ${check.description}`);
    if (!check.passed) {
        console.log(`   Archivo: ${check.filePath}`);
        if (check.error) {
            console.log(`   Error: ${check.error}`);
        }
        allPassed = false;
    }
});

console.log('\n' + '─'.repeat(55) + '\n');

if (allPassed) {
    console.log('✅ TODOS LOS CAMBIOS VERIFICADOS CORRECTAMENTE\n');
    console.log('Próximos pasos:');
    console.log('1. cd Backend');
    console.log('2. npm start');
    console.log('3. Abre la app en Android Studio');
    console.log('4. Crea una dieta y presiona "Guardar Dieta"\n');
} else {
    console.log('❌ ALGUNOS CAMBIOS NO SE ENCONTRARON\n');
    console.log('Verifica que:\n');
    console.log('- Los archivos existan en las rutas correctas');
    console.log('- Se hayan guardado los cambios correctamente');
    console.log('- No haya errores de edición\n');
}

process.exit(allPassed ? 0 : 1);
