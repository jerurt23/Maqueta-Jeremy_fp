import { TaskData } from '../types/task';
import { INITIAL_TASKS } from '../data/mockData';

const STORAGE_KEY = 'fiberpro.tasks.v1';
const VERSION_KEY = 'fiberpro.version.v1';

/** Cuota aproximada de localStorage (5 MB en la mayoria de navegadores). */
const QUOTA_BYTES = 5 * 1024 * 1024;

/** Por debajo de este margen avisamos que la persistencia se va a saturar. */
const WARN_RATIO = 0.85;

/**
 * Indica si los datos guardados corresponden a una version anterior del
 * esquema. Al agregar campos nuevos (vtRetiro, rtRetiro, etc.) hay que
 * subir la version para forzar una relectura limpia de INITIAL_TASKS.
 */
const SCHEMA_VERSION = '2';

function bytesOf(value: string): number {
  // approximate: 2 bytes por char en UTF-16
  return value.length * 2;
}

function readVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_KEY);
  } catch {
    return null;
  }
}

function writeVersion(v: string) {
  try {
    localStorage.setItem(VERSION_KEY, v);
  } catch {
    /* modo privado o storage bloqueado */
  }
}

export function clearPersistedTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Carga las tareas persistidas. Si no hay datos, si el esquema cambio, o si
 * los datos estan corruptos, devuelve los datos iniciales.
 */
export function loadTasks(): TaskData[] {
  try {
    const storedVersion = readVersion();
    if (storedVersion !== SCHEMA_VERSION) {
      // esquema nuevo: limpiamos para no mezclar formas distintas
      clearPersistedTasks();
      writeVersion(SCHEMA_VERSION);
      return INITIAL_TASKS;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TASKS;

    // Sanitizado defensivo: si un registro perdio campos clave, se descarta
    // ese registro en vez de romper el render de toda la app.
    const validos = parsed.filter(
      (t): t is TaskData =>
        !!t && typeof t.id === 'string' && Array.isArray(t.coordenadas) && !!t.nombre
    );

    if (validos.length === 0) return INITIAL_TASKS;

    // Si el usuario elimino registros y quedo alguno de INITIAL_TASKS que nunca
    // existio guardado, no los re-agregamos: respetamos lo que el usuario tiene.
    return validos;
  } catch (err) {
    console.warn('[fiberpro] No se pudieron leer las tareas guardadas:', err);
    clearPersistedTasks();
    return INITIAL_TASKS;
  }
}

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'error' };

/**
 * Persiste las tareas. Si la cuota se excede (tipicamente por las fotos en
 * base64) devuelve { ok: false } para que la UI pueda avisar, pero conserva
 * el estado en memoria.
 */
export function saveTasks(tasks: TaskData[]): SaveResult {
  try {
    const payload = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, payload);
    writeVersion(SCHEMA_VERSION);
    return { ok: true };
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014);

    if (isQuota) {
      console.error(
        '[fiberpro] Cuota de localStorage excedida. Las fotos adjuntas no se pudieron guardar.'
      );
      return { ok: false, reason: 'quota' };
    }

    console.warn('[fiberpro] Error al guardar tareas:', err);
    return { ok: false, reason: 'error' };
  }
}

/** Porcentaje aproximado de ocupacion de la cuota. */
export function storageUsageRatio(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    return bytesOf(raw) / QUOTA_BYTES;
  } catch {
    return 0;
  }
}

export function isStorageNearFull(): boolean {
  return storageUsageRatio() >= WARN_RATIO;
}

export { STORAGE_KEY, SCHEMA_VERSION };