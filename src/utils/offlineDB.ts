// Utilitário para IndexedDB - armazenar apontamentos offline

const DB_NAME = 'gwind_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'apontamentos_pendentes';

interface ApontamentoOffline {
  id: string; // ID temporário gerado localmente
  data: any; // Dados completos do apontamento
  timestamp: number; // Quando foi criado
  tentativas: number; // Quantas vezes tentou sincronizar
}

let db: IDBDatabase | null = null;

// Abrir conexão com IndexedDB
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Salvar apontamento offline
export async function salvarApontamentoOffline(data: any): Promise<string> {
  const database = await openDB();
  const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const apontamento: ApontamentoOffline = {
    id,
    data,
    timestamp: Date.now(),
    tentativas: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(apontamento);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

// Listar todos os apontamentos pendentes
export async function listarApontamentosPendentes(): Promise<ApontamentoOffline[]> {
  const database = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Remover apontamento após sincronização bem-sucedida
export async function removerApontamentoOffline(id: string): Promise<void> {
  const database = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Incrementar tentativas de sincronização
export async function incrementarTentativas(id: string): Promise<void> {
  const database = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const apontamento = getRequest.result;
      if (apontamento) {
        apontamento.tentativas += 1;
        const putRequest = store.put(apontamento);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Contar apontamentos pendentes
export async function contarApontamentosPendentes(): Promise<number> {
  const apontamentos = await listarApontamentosPendentes();
  return apontamentos.length;
}

