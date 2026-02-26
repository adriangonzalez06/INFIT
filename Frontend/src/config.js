import { Platform } from 'react-native';

/**
 * URL base del backend.
 *
 * ── Para EMULADOR Android (AVD):
 *      MODE = 'emulator'   →  http://10.0.2.2:8082
 *
 * ── Para DISPOSITIVO FÍSICO en la misma red WiFi que el PC:
 *      MODE = 'lan'        →  http://<IP_DEL_PC>:8082
 *      Obtén la IP con: ipconfig (Windows) o ifconfig (Mac/Linux)
 *
 * ── Para DISPOSITIVO con red diferente (túnel ngrok / Cloudflare):
 *      MODE = 'tunnel'     →  pega la URL del túnel en TUNNEL_URL
 */

const MODE = 'lan'; // ← CAMBIA AQUÍ: 'emulator' | 'lan' | 'tunnel'

const LAN_IP = '172.20.10.5'; // ← Tu IP local (ipconfig en Windows)
const TUNNEL_URL = 'https://tu-tunel.ngrok-free.app'; // ← URL del túnel

function resolveBackendUrl() {
    switch (MODE) {
        case 'lan':
            return `http://${LAN_IP}:8082`;
        case 'tunnel':
            return TUNNEL_URL;
        case 'emulator':
        default:
            return Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';
    }
}

export const BACKEND_URL = resolveBackendUrl();
