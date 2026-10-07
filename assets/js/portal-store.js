(() => {
  "use strict";

  const ID_KEY = "msa_portal_identity_v1";
  const QUEUE_KEY = "msa_portal_sync_queue_v1";
  const STATUS_EVENT = "msa-store-status";

  const cfg = () => window.MSA_SUPABASE || {};
  const configured = () => {
    const c = cfg();
    return /^https:\/\/.+\.supabase\.co\/?$/.test(String(c.url || "")) &&
      /^sb_publishable_/.test(String(c.publishableKey || ""));
  };

  function emit(status, detail = {}) {
    window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: { status, ...detail } }));
  }

  function uuid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function recoveryCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    let raw = "";
    for (const b of bytes) raw += alphabet[b % alphabet.length];
    return raw.match(/.{1,5}/g).join("-");
  }

  function getIdentity() {
    let id;
    try { id = JSON.parse(localStorage.getItem(ID_KEY) || "null"); } catch (_) {}
    if (!id?.participantId || !id?.accessToken || !id?.recoveryCode) {
      id = {
        participantId: uuid(),
        accessToken: uuid(),
        recoveryCode: recoveryCode(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(ID_KEY, JSON.stringify(id));
    }
    return id;
  }

  function setIdentity(id) {
    localStorage.setItem(ID_KEY, JSON.stringify(id));
  }

  function getQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
    catch (_) { return []; }
  }
  function setQueue(q) { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }

  async function rpc(name, payload) {
    if (!configured()) throw new Error("Supabase ainda não configurado.");
    const c = cfg();
    const url = c.url.replace(/\/$/, "") + "/rest/v1/rpc/" + name;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": c.publishableKey
      },
      body: JSON.stringify(payload || {})
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try { msg = JSON.parse(text).message || text; } catch (_) {}
      throw new Error(msg || `HTTP ${res.status}`);
    }
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return text; }
  }

  let participantReady = null;
  async function ensureParticipant() {
    if (!configured()) return false;
    if (participantReady) return participantReady;
    participantReady = (async () => {
      const i = getIdentity();
      await rpc("portal_register_participant", {
        p_participant_id: i.participantId,
        p_access_token: i.accessToken,
        p_recovery_code: i.recoveryCode
      });
      return true;
    })().catch(err => {
      participantReady = null;
      throw err;
    });
    return participantReady;
  }

  function enqueue(kind, args, compactKey = null) {
    const q = getQueue();
    if (compactKey) {
      for (let i = q.length - 1; i >= 0; i--) {
        if (q[i].compactKey === compactKey) q.splice(i, 1);
      }
    }
    q.push({ id: uuid(), kind, args, compactKey, queuedAt: new Date().toISOString() });
    setQueue(q);
    emit("queued", { pending: q.length });
    flush();
  }

  async function flush() {
    if (!configured()) {
      emit("local-only", { pending: getQueue().length });
      return;
    }
    if (flush.running) return;
    flush.running = true;
    try {
      await ensureParticipant();
      let q = getQueue();
      while (q.length) {
        const item = q[0];
        try {
          if (item.kind === "record") {
            await rpc("portal_upsert_record", item.args);
          } else if (item.kind === "event") {
            await rpc("portal_append_event", item.args);
          }
          q.shift();
          setQueue(q);
          emit("synced", { pending: q.length });
        } catch (err) {
          emit("offline", { pending: q.length, error: String(err.message || err) });
          break;
        }
      }
    } finally {
      flush.running = false;
    }
  }

  function record(module, type, key, payload) {
    const i = getIdentity();
    enqueue("record", {
      p_participant_id: i.participantId,
      p_access_token: i.accessToken,
      p_module: module,
      p_record_type: type,
      p_record_key: String(key),
      p_payload: payload || {}
    }, `${module}|${type}|${key}`);
  }

  function event(module, type, payload) {
    const i = getIdentity();
    enqueue("event", {
      p_participant_id: i.participantId,
      p_access_token: i.accessToken,
      p_module: module,
      p_event_type: type,
      p_payload: payload || {}
    });
  }

  async function getRecords(module = null) {
    if (!configured()) return [];
    await ensureParticipant();
    const i = getIdentity();
    return await rpc("portal_get_records", {
      p_participant_id: i.participantId,
      p_access_token: i.accessToken,
      p_module: module
    }) || [];
  }

  async function recover(code) {
    if (!configured()) throw new Error("Configure o Supabase primeiro.");
    const result = await rpc("portal_recover", { p_recovery_code: String(code || "").trim().toUpperCase() });
    const row = Array.isArray(result) ? result[0] : result;
    if (!row?.participant_id || !row?.access_token) throw new Error("Código de recuperação não encontrado.");
    const id = {
      participantId: row.participant_id,
      accessToken: row.access_token,
      recoveryCode: row.recovery_code,
      createdAt: new Date().toISOString(),
      recoveredAt: new Date().toISOString()
    };
    setIdentity(id);
    participantReady = null;
    await ensureParticipant();
    emit("recovered", {});
    return id;
  }

  function status() {
    return {
      configured: configured(),
      identity: getIdentity(),
      pending: getQueue().length
    };
  }

  window.addEventListener("online", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flush();
  });

  window.MSAStore = {
    record, event, getRecords, recover, flush, status,
    getIdentity,
    getRecoveryCode: () => getIdentity().recoveryCode,
    isConfigured: configured
  };

  // Cria o identificador imediatamente e tenta sincronizar a fila existente.
  getIdentity();
  setTimeout(flush, 0);
})();
