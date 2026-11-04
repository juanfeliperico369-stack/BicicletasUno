/* =====================================================================
   RED: sala entre dos dispositivos con WebRTC, sin servidor propio.
   El "código" (oferta/respuesta comprimida) se comparte por WhatsApp o copiar/pegar.
   Misma red Wi-Fi: funciona sin internet. Redes distintas: usa STUN público (necesita internet).
   ===================================================================== */
const b64u = {
  enc(bytes) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
};
const Net = JE.net = {
  pc: null, ch: null, role: null, status: 'off', onmsg: null, onstatus: null,
  supported() { return !!window.RTCPeerConnection; },
  mk() {
    this.reset(); const pc = this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') this.setStatus(pc.connectionState); };
    return pc;
  },
  setStatus(s) { this.status = s; if (this.onstatus) this.onstatus(s); },
  wire(ch) {
    this.ch = ch;
    ch.onopen = () => this.setStatus('open');
    ch.onclose = () => this.setStatus('closed');
    ch.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } if (this.onmsg) this.onmsg(m); };
  },
  ice() { const pc = this.pc; return new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 3500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); }); },
  async host() { const pc = this.mk(); this.role = 'host'; this.wire(pc.createDataChannel('je', { ordered: true })); await pc.setLocalDescription(await pc.createOffer()); await this.ice(); this.setStatus('waiting'); return this.pack({ t: 'o', s: pc.localDescription.sdp }); },
  async join(code) {
    const o = await this.unpack(code); if (o.t !== 'o') throw new Error('Ese no es un código de sala');
    const pc = this.mk(); this.role = 'guest'; pc.ondatachannel = e => this.wire(e.channel);
    await pc.setRemoteDescription({ type: 'offer', sdp: o.s }); await pc.setLocalDescription(await pc.createAnswer()); await this.ice(); this.setStatus('waiting');
    return this.pack({ t: 'a', s: pc.localDescription.sdp });
  },
  async accept(code) { const o = await this.unpack(code); if (o.t !== 'a') throw new Error('Ese no es un código de respuesta'); if (!this.pc) throw new Error('Primero crea la sala'); await this.pc.setRemoteDescription({ type: 'answer', sdp: o.s }); },
  send(m) { if (this.ch && this.ch.readyState === 'open') { try { this.ch.send(JSON.stringify(m)); } catch (e) { } } },
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
  reset() { try { if (this.ch) this.ch.close(); } catch (e) { } try { if (this.pc) this.pc.close(); } catch (e) { } this.pc = this.ch = null; this.role = null; this.status = 'off'; }
};
