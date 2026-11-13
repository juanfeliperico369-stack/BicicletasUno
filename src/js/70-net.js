/* =====================================================================
   RED: salas de hasta 4 dispositivos con WebRTC, sin servidor propio.
   El anfitrión crea un código por cada invitado (oferta) y recibe su respuesta.
   Topología en estrella: el anfitrión reenvía los mensajes de cada invitado a los demás.
   Misma red Wi-Fi: funciona sin internet. Redes distintas: usa STUN público (necesita internet).
   ===================================================================== */
const b64u = {
  enc(bytes) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
};
const Net = JE.net = {
  peers: [], role: null, myId: 0, status: 'off', pending: null, onmsg: null, onstatus: null, MAX: 3,
  supported() { return !!window.RTCPeerConnection; },
  newPC(peer) {
    const pc = new RTCPeerConnection({ iceServers: this.lan ? [] : [{ urls: 'stun:stun.l.google.com:19302' }] });   // misma red: sin STUN (funciona sin internet)
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') { peer.open = false; this.setStatus(this.openCount() ? 'open' : pc.connectionState); } };
    return pc;
  },
  setStatus(s) { this.status = s; if (this.onstatus) this.onstatus(s); },
  openCount() { return this.peers.filter(p => p.open).length; },
  wire(peer, ch) {
    peer.ch = ch;
    ch.onopen = () => { peer.open = true; if (this.role === 'host') this.rawSend(peer, { t: 'id', id: peer.id }); this.setStatus('open'); };
    ch.onclose = () => { peer.open = false; this.setStatus(this.openCount() ? 'open' : 'closed'); if (this.onmsg) this.onmsg({ t: 'bye', from: this.role === 'host' ? peer.id : 0 }); };
    ch.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } if (!m || typeof m !== 'object') return; this.recv(peer, m); };
  },
  recv(peer, m) {
    if (this.role === 'host') { m.from = peer.id; for (const q of this.peers) if (q !== peer && q.open) this.rawSend(q, m); }
    if (this.onmsg) this.onmsg(m);
  },
  ice(pc) { return new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 3500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); }); },
  /* anfitrión: un código (oferta) por invitado */
  async host() {
    if (this.role !== 'host') { this.reset(); this.role = 'host'; this.myId = 0; }
    if (this.peers.length >= this.MAX) throw new Error('La sala ya tiene 4 jugadores');
    const peer = { id: this.peers.length + 1, open: false }; peer.pc = this.newPC(peer); this.peers.push(peer);
    this.wire(peer, peer.pc.createDataChannel('je', { ordered: true }));
    await peer.pc.setLocalDescription(await peer.pc.createOffer()); await this.ice(peer.pc);
    this.pending = peer; this.setStatus('waiting');
    return this.pack({ t: 'o', s: peer.pc.localDescription.sdp });
  },
  async accept(code) {
    const o = await this.unpack(code); if (o.t !== 'a') throw new Error('Ese no es un código de respuesta');
    const p = this.pending; if (!p) throw new Error('Primero crea un código de invitación');
    await p.pc.setRemoteDescription({ type: 'answer', sdp: o.s }); this.pending = null;
  },
  /* invitado */
  async join(code) {
    const o = await this.unpack(code); if (o.t !== 'o') throw new Error('Ese no es un código de sala');
    this.reset(); this.role = 'guest'; const peer = { id: 0, open: false }; peer.pc = this.newPC(peer); this.peers = [peer];
    peer.pc.ondatachannel = e => this.wire(peer, e.channel);
    await peer.pc.setRemoteDescription({ type: 'offer', sdp: o.s }); await peer.pc.setLocalDescription(await peer.pc.createAnswer()); await this.ice(peer.pc); this.setStatus('waiting');
    return this.pack({ t: 'a', s: peer.pc.localDescription.sdp });
  },
  rawSend(peer, m) { if (peer.ch && peer.ch.readyState === 'open') { try { peer.ch.send(JSON.stringify(m)); } catch (e) { } } },
  send(m) { if (this.role === 'host') m.from = 0; for (const p of this.peers) if (p.open) this.rawSend(p, m); },
  async pack(o) {
    const txt = JSON.stringify(o);
    if (window.CompressionStream) { const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'JE1' + o.t + b64u.enc(new Uint8Array(await new Response(cs).arrayBuffer())); }
    return 'JE0' + o.t + b64u.enc(new TextEncoder().encode(txt));
  },
  async unpack(code) {
    code = String(code || '').replace(/\s+/g, ''); const i = code.indexOf('JE'); if (i < 0) throw new Error('Código no válido'); code = code.slice(i);
    const v = code.slice(0, 3), body = code.slice(4), bytes = b64u.dec(body);
    if (v === 'JE1') { if (!window.DecompressionStream) throw new Error('Tu navegador no puede leer este código'); const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); return JSON.parse(await new Response(ds).text()); }
    if (v === 'JE0') return JSON.parse(new TextDecoder().decode(bytes));
    throw new Error('Código no válido');
  },
  reset() { for (const p of this.peers) { try { if (p.ch) p.ch.close(); } catch (e) { } try { if (p.pc) p.pc.close(); } catch (e) { } } this.peers = []; this.pending = null; this.role = null; this.myId = 0; this.status = 'off'; }
};
