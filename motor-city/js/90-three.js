/* Vista opcional. Cada juego proporciona su copia local de three.js. */
Vistas.registrarThree = function (THREE) {
  if (!THREE?.WebGLRenderer) throw new TypeError('Se necesita three.js con WebGLRenderer');
  const previa = VISTAS.find(v => v.id === 'three');
  if (previa) return previa;
  const vista = {id:'three', n:'Three.js', icon:'🌆', tipo:'three', control:'mundo', crear() {
    const renderer = new THREE.WebGLRenderer({antialias:true});
    const escena = new THREE.Scene(), cam = new THREE.PerspectiveCamera(48,1,.5,2000);
    const material = new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    const sol = new THREE.DirectionalLight(0xffffff,1.8);
    escena.background = new THREE.Color(0xbad5e7);
    escena.add(sol,new THREE.HemisphereLight(0xe6f5ff,0x77604d,1.5));
    const barrio = new THREE.Group();
    escena.add(barrio);
    let anterior = null, cx, cy;
    function malla(nombre,m) {
      if (!m.i.length) return;
      const geo = new THREE.BufferGeometry();
      for (const [a,datos] of [['position',m.p],['normal',m.n],['color',m.c]])
        geo.setAttribute(a,new THREE.Float32BufferAttribute(datos,3));
      geo.setIndex(m.i);
      const obj = new THREE.Mesh(geo,material);
      obj.name = nombre;
      barrio.add(obj);
    }
    return {renderer, escena, dibujar(w,h,E) {
      const M=E.mundo, C=E.camara, x=Math.floor(C.x/128), y=Math.floor(C.y/128);
      if (M!==anterior || x!==cx || y!==cy) {
        for (const viejo of [...barrio.children]) { viejo.geometry.dispose(); barrio.remove(viejo); }
        const caja=[x*128-192,y*128-192,x*128+320,y*128+320];
        malla('terreno',Exportar._terreno(M,Exportar.alturas(M,caja,8)));
        malla('edificios',Exportar._edificios(M,M.edificiosEn(...caja)));
        malla('vias',Exportar._vias(M,Exportar.viasEn(M,caja)));
        malla('arboles',Exportar._arboles(M,Arboleda.en(M,...caja,2400)));
        anterior=M; cx=x; cy=y;
      }
      if (renderer.domElement.width!==w || renderer.domElement.height!==h) {
        renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix();
      }
      const base=M.cota(C.x,C.y), r=clamp(190/Math.max(1,C.zoom),20,120);
      cam.position.set(C.x+Math.sin(C.yaw)*r,base+r*.85,C.y+Math.cos(C.yaw)*r);
      cam.lookAt(C.x,base+2,C.y); sol.position.set(-.5,1,.4);
      renderer.render(escena,cam);
      return renderer.domElement;
    }};
  }};
  VISTAS.push(vista);
  return vista;
};
