/* EnCicla · Canvas 2D. Coordenadas locales en metros: x derecha, y frente, z altura. */
const TallerValle = (() => {
  const tinta = '#10273c', verde = '#9bd341', metal = '#d4e3dc', piel = '#ad7050';
  const medidas = {
    bici:[.64,1.82,1.12], electrica:[.68,1.9,1.16], scooter:[.48,1.08,1.02],
    monopatin:[.53,1.18,1.12], skate:[.24,.80,.12], patines:[.46,.31,.18],
    balance:[2.15,5.6,2.55], pie:[.48,.32,1.72]
  };
  function lapiz(c) {
    return {
      pol(p,color) { c.fillStyle=color; c.beginPath(); p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill(); },
      linea(p,color,w) { c.strokeStyle=color; c.lineWidth=w; c.lineJoin=c.lineCap='round'; c.beginPath(); p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke(); },
      oval(x,y,a,b,color) { c.fillStyle=color; c.beginPath(); c.ellipse(x,y,a,b,0,0,2*Math.PI); c.fill(); },
      rect(x,y,w,h,color) { c.fillStyle=color; c.fillRect(x,y,w,h); }
    };
  }
  // Un mismo modelo da la planta, el perfil y la vista desde la rueda trasera.
  // Las caras y tubos se ordenan por distancia a la cámara antes de pintar.
  function vehiculo(c,tipo,vista,x,y,px,op={}) {
    const [ancho,largo,alto]=medidas[tipo];
    c.save(); c.translate(x,y); c.scale(px,px);
    const b=lapiz(c), cola=[], noche=op.noche, fase=op.fase || 0;
    const bici=tipo==='bici'||tipo==='electrica', tabla=tipo==='skate'||tipo==='patines';
    const cabina=tipo==='balance', a=vista==='lado'?Math.PI/2:vista==='atras'?.18:0;
    const t=vista==='arriba'?Math.PI/2:vista==='lado'?.04:.21;
    const cos=Math.cos(a),sin=Math.sin(a),ct=Math.cos(t),st=Math.sin(t);
    function proyecta([u,v,z]) {
      const d=u*sin+v*cos;
      return [u*cos-v*sin,-z*ct-d*st,d*ct-z*st];
    }
    function cara(p,color,trazo=0) {
      const q=p.map(proyecta), d=q.reduce((s,v)=>s+v[2],0)/q.length;
      cola.push({d,p:q,color,trazo});
    }
    function caja(u,v,z,w,l,h,frente,lado,tapa) {
      const esquinas=[[-w/2,-l/2],[w/2,-l/2],[w/2,l/2],[-w/2,l/2]];
      const base=esquinas.map(([dx,dy])=>[u+dx,v+dy,z]);
      const techo=base.map(([x,y])=>[x,y,z+h]);
      for(let i=0;i<4;i++){const j=(i+1)%4;cara([base[i],base[j],techo[j],techo[i]],i%2?lado:frente);}
      cara(techo,tapa);
    }
    function rueda(u,v,r) {
      const aro=Array.from({length:20},(_,i)=>[u,v+Math.cos(i*Math.PI/10)*r,r+Math.sin(i*Math.PI/10)*r]);
      cara([...aro,aro[0]],tinta,Math.max(.048,r*.17));
      if(r>.2) for(let i=0;i<10;i+=2) cara([aro[i],aro[i+10]],metal,.018);
    }
    if(vista==='primera') {
      // Plano de contacto en primer término: cabeza fuera de cuadro, manos sobre los puños.
      if(cabina) {
        b.pol([[-1.15,0],[-.94,-.44],[.94,-.44],[1.15,0]],tinta);
        b.oval(-.37,-.19,.24,.21,'#7995a0'); b.oval(-.37,-.21,.17,.14,tinta);
        b.rect(.16,-.33,.39,.11,noche?'#ffd27c':'#80a89c');
      } else if(tabla||tipo==='pie') {
        if(tipo==='skate')b.oval(0,-.17,.19,.40,'#c88952');
        for(const s of [-1,1]) {const h=Math.sin(fase+s)*.045;b.oval(s*.14,-.15+h,.079,.17,tinta);b.rect(s*.14-.065,-.12+h,.13,.038,metal);}
      } else {
        if(bici){b.pol([[-.38,-.56],[.38,-.56],[.28,-.24],[-.28,-.24]],verde);
          for(let i=-2;i<=2;i++)b.linea([[i*.13,-.54],[i*.10,-.28]],tinta,.018);}
        b.linea([[0,-.09],[0,-.23]],verde,.088);
        b.linea([[-.65,-.07],[-.32,-.18],[.32,-.18],[.65,-.07]],metal,.063);
        for(const s of [-1,1]){b.linea([[s*.45,-.12],[s*.68,-.065]],tinta,.09);
          b.linea([[s*.76,.08],[s*.59,-.075]],piel,.115);}
        if(tipo==='electrica'||tipo==='monopatin')b.rect(-.073,-.25,.146,.105,noche?'#ffd27c':'#39706b');
      }
      c.restore();return;
    }
    b.oval(.05,vista==='arriba'?0:.025,vista==='lado'?largo*.51:ancho*.64,
      vista==='arriba'?largo*.53:.095,'rgba(13,29,39,.26)');
    if(cabina) {
      for(const side of [-1,1])for(const axle of [-1.6,1.62])rueda(side*1.01,axle,.44);
      caja(0,-.62,.48,ancho,4.06,2.03,'#e6eadf','#afc2bc','#f4f5e6');
      caja(0,1.88,.50,2.0,1.82,1.66,'#618997','#65949d',metal);
      caja(0,1.86,1.2,2.03,1.73,.64,'#52717e','#446477','#9bb8b7');
      caja(0,-2.67,.86,2.07,.06,.18,verde,verde,verde);
    } else if(bici) {
      const r=.33, eje=largo/2-r;
      rueda(0,-eje,r);rueda(0,eje,r);
      cara([[0,-eje,r],[0,-.16,.81],[0,.04,.30],[0,-eje,r]],verde,.065);
      cara([[0,.04,.30],[0,.42,.87],[0,eje,r]],verde,.077);
      cara([[0,-.16,.81],[0,-.15,.91]],metal,.046); caja(0,-.18,.89,.19,.27,.06,tinta,tinta,tinta);
      caja(0,.58,.76,.43,.32,.22,'#769b44','#628541',verde);
      for(let i=-2;i<=2;i++)caja(i*.074,.411,.80,.019,.018,.15,metal,metal,metal);
      if(tipo==='electrica')caja(0,-.10,.35,.14,.42,.18,'#346878',tinta,metal);
    } else if(tipo==='patines') {
      for(const s of [-1,1]){for(const v of [-.10,0,.10])rueda(s*.14,v,.047);
        caja(s*.14,0,.075,.125,.28,.12,'#d9865c',tinta,'#ffb779');}
    } else if(tipo!=='pie') {
      const skate=tipo==='skate',r=skate?.055:.10;
      for(const s of (skate?[-1,1]:[0]))for(const v of [-1,1])rueda(s*.103,v*(largo/2-r),r);
      caja(0,0,r+.03,skate?ancho:.18,largo-2*r,.062,skate?'#d08349':verde,tinta,skate?'#57626a':verde);
      if(tipo==='monopatin')caja(0,0,.07,.18,.60,.10,tinta,tinta,'#46737b');
    }
    if(bici||tipo==='scooter'||tipo==='monopatin') {
      const v=bici?.42:largo*.35;
      cara([[0,v,.18],[0,v,alto-.10]],bici?verde:metal,.055);
      cara([[-ancho/2,v,alto-.10],[ancho/2,v,alto-.10]],tinta,.06);
    }
    if(!cabina && op.persona!==false) {
      const sentado=bici?.18:0, paso=Math.sin(fase)*.13;
      for(const s of [-1,1]) {
        cara([[s*.12,-.13,.88-sentado],[s*.14,.04,.51],[s*.14,s*paso,.18]],'#354862',.12);
        cara([[s*.20,-.05,1.37-sentado],[s*.27,.03,1.14-sentado],[s*.25,bici?.41:.17,1.05-sentado]],piel,.09);
      }
      caja(0,-.10,.84-sentado,.44,.23,.55,'#2b6891','#295077','#5984a1');
      caja(0,-.13,1.41-sentado,.23,.22,.23,piel,'#885840',piel);
      caja(0,-.13,1.58-sentado,.27,.28,.11,'#ece4cb',metal,'#fff5db');
    }
    if(noche && tipo!=='pie') for(const s of (cabina?[-.81,.81]:[0])) {
      caja(s,-largo*.47,.52,.12,.048,.072,'#ff7861','#ff7861','#ffae86');
      caja(s,largo*.47,.58,.12,.048,.072,'#ffe2a5','#ffe2a5','#fff2d4');
    }
    cola.sort((a,b)=>b.d-a.d);
    for(const q of cola){if(q.trazo)b.linea(q.p,q.color,q.trazo);else b.pol(q.p,q.color);}
    c.restore();
  }
  function horizonte(c,w,h,hora,clima='seco',fase=0) {
    const b=lapiz(c),n=hora<6||hora>=19,oro=hora<8||hora>16;
    const cielo=n?'#20344d':oro?'#e6ad8c':'#b2d8db';
    b.rect(0,0,w,h,cielo); b.oval(w*.72,h*.26,h*.07,h*.07,n?'#dce6de':'#ffe3a6');
    for(let j=0;j<3;j++){
      const p=[[0,h]];for(let i=0;i<=48;i++){const x=i/48;
        const y=.38+j*.14+.11*Math.sin(x*8+j)+.052*Math.sin(x*19+j*2)+.08*(1-Math.abs(x-.5)*2);
        p.push([w*x,h*y]);}p.push([w,h]);
      b.pol(p,(n?['#48576b','#354d5f','#28473f']:['#94acb2','#70949a','#4a796d'])[j]);
    }
    if(clima==='niebla')for(let i=1;i<=3;i++)b.rect(0,h*(.41+i*.10),w,h*.048,'rgba(223,230,222,.24)');
    if(clima==='lluvia')for(let i=0;i<42;i++){const x=(i*43)%w,y=(i*71+fase*80)%h;b.linea([[x,y],[x-3,y+8]],'#a6c2cd',1);}
  }
  // Piezas en alzado local; la escala equivale a px por metro de la cámara.
  function pieza(c,id,x,y,px,noche=false) {
    c.save(); c.translate(x,y); c.scale(px,px);const b=lapiz(c), luz=noche?'#ffd27c':'#b3d3cf';
    const r=(...p)=>b.rect(...p),p=(...v)=>b.pol(...v),l=(...v)=>b.linea(...v),o=(...v)=>b.oval(...v);
    switch(id){
      case 'casa':
        r(-3,-4.4,6,4.4,'#b46b53');p([[-3.4,-4.4],[-.8,-5.5],[3.4,-4.4]],'#884b41');
        r(-2.3,-3.8,1.1,1,luz);r(.8,-3.8,1.35,1,luz);r(-.5,-1.9,1,1.9,tinta);
        r(-3,-2.45,6,.25,'#ddd0ad');r(1.2,-5.3,1.1,.79,'#52616a');break;
      case 'quebrada':
        p([[-4,0],[-2,-1],[2,-1],[4,0],[1.6,.9],[-2,.7]],'#56756b');
        p([[-3.4,.12],[-1.7,-.54],[2,-.65],[3.4,.1],[1.6,.55],[-2,.45]],'#559da5');
        l([[-1.8,.13],[-.7,-.12],[.8,-.07]],'#b8dcce',.10);break;
      case 'parque': r(-4,-.35,8,.35,'#648a58');pieza(c,'banca',-1.7,-.3,1);pieza(c,'arbol',1.7,-.3,.82);break;
      case 'separador':r(-2,-.19,4,.19,'#bfb8a5');r(-1.8,-.32,3.6,.14,'#749557');break;
      case 'anden':r(-2,-.16,4,.16,'#c2b9aa');for(const u of [-1,0,1])l([[u,-.16],[u,0]],'#827e76',.04);break;
      case 'banca':r(-.8,-.54,1.6,.12,'#aa7550');r(-.8,-.84,1.6,.15,'#b98155');for(const u of [-.58,.52])r(u,-.42,.08,.42,tinta);break;
      case 'poste':r(-.08,-4,.16,4,'#647581');l([[0,-4],[.6,-4.18],[.9,-4.1]],tinta,.12);r(.55,-4.10,.45,.1,luz);break;
      case 'guadua':for(let i=0;i<5;i++){const k=(i-2)*.35;l([[0,0],[k,-2],[k*1.4,-4.5+Math.abs(k)]],'#557a4e',.12);p([[k,-3],[k+.8,-3.7],[k+.25,-3.1]],'#7b9c5d');}break;
      case 'arbol':r(-.16,-2.8,.32,2.8,'#75543e');o(-.65,-2.9,1.3,1.36,'#477256');o(.6,-3.4,1.45,1.68,'#699461');o(.2,-4.35,.87,.73,'#91ad72');break;
      case 'coltejer':p([[-8,0],[-8,-32],[-4,-32],[-3,-41],[0,-51],[3,-41],[4,-32],[8,-32],[8,0]],'#708893');
        for(let i=-6;i<8;i+=3)r(i,-31,.6,31,luz);break;
      case 'orquideorama':for(const u of [-3,0,3]){l([[u,0],[u,-2.4],[u-1.5,-3.4]],'#9d7049',.24);p([[u-1.7,-3.5],[u,-4],[u+1.7,-3.5],[u,-3.05]],'#bb956c');}break;
      case 'tunel':p([[-4.5,0],[-4.5,-3.6],[-3,-4.6],[3,-4.6],[4.5,-3.6],[4.5,0]],'#839497');p([[-3.7,0],[-3.7,-3],[-2.8,-3.7],[2.8,-3.7],[3.7,-3],[3.7,0]],tinta);r(-2.6,-3.4,.55,.13,'#ffd27c');break;
      case 'deprimido':p([[-4,-1.3],[-2,0],[2,0],[4,-1.3],[3.6,-1.3],[1.9,-.26],[-1.9,-.26],[-3.6,-1.3]],'#8e9c9c');break;
      case 'cono':p([[-.24,0],[0,-.60],[.24,0]],'#ea7d4c');r(-.15,-.28,.30,.10,'#fff3d6');break;
      case 'hueco':p([[-.7,0],[-.26,-.18],[.43,-.12],[.67,.03],[.18,.17],[-.58,.12]],tinta);break;
      case 'charco':o(0,0,.85,.19,'#568899');l([[-.55,.03],[-.19,-.02],[.34,-.02]],metal,.045);break;
      case 'moto':for(const u of [-.55,.55])o(u,-.25,.24,.24,tinta);
        p([[-.55,-.39],[-.16,-.69],[.33,-.75],[.51,-.43],[0,-.33]],'#467799');l([[.58,-.28],[.34,-.89],[.12,-.95]],metal,.07);break;
      case 'perro':o(0,-.39,.33,.19,'#a76f4a');o(.29,-.61,.18,.19,'#b7845a');
        for(const u of [-.20,.15])r(u,-.38,.09,.38,'#785239');l([[-.26,-.41],[-.44,-.63]],'#a76f4a',.08);break;
      case 'chaza':r(-.64,-1.08,1.28,.74,'#daaf71');for(const u of [-.48,.48]){o(u,-.19,.18,.18,tinta);r(u,-1.87,.05,.8,metal);}
        p([[-.9,-1.8],[-.59,-2.13],[.59,-2.13],[.9,-1.8]],'#bd6653');break;
      case 'rampa':p([[-.8,0],[.75,-.48],[.75,0]],'#caab7d');break;
      case 'hoja':p([[0,-.76],[.34,-.65],[.26,-.32],[-.22,-.20],[-.19,-.52]],verde);l([[-.21,-.17],[.16,-.58]],'#40754a',.045);break;
      case 'regalo':r(-.32,-.57,.64,.57,'#e6b663');r(-.06,-.6,.12,.6,'#497b83');break;
      case 'boleto':p([[-.39,-.44],[.31,-.54],[.40,-.12],[-.30,0]],'#f3d9a3');l([[-.17,-.16],[.15,-.24]],'#558082',.06);break;
      case 'senal':p([[-.5,-1], [0,-1.6],[.5,-1],[0,-.55]],tinta);l([[-.18,-1.02],[0,-1.23],[.18,-1.02]],'#ffdb85',.09);r(-.04,-.54,.08,.54,'#697b7b');break;
    }
    c.restore();
  }
  function retrato(c,x,y,px,quien) {
    c.save();c.translate(x,y);c.scale(px,px);const b=lapiz(c),tecnica=quien==='Cata';
    b.oval(0,-.04,.46,.42,tecnica?'#5a8994':'#a26773');
    b.oval(0,-.56,.26,.32,tecnica?'#975f48':'#bb896e');
    b.pol([[-.28,-.58],[-.29,-.76],[-.12,-.91],[.17,-.90],[.29,-.74],[.22,-.64],[.03,-.73]],tecnica?tinta:'#cfc8b9');
    for(const u of [-.105,.105]){b.oval(u,-.58,.025,.023,tinta);if(!tecnica)b.linea([[u-.07,-.62],[u+.07,-.62],[u+.07,-.52],[u-.07,-.52],[u-.07,-.62]],tinta,.015);}
    b.linea([[-.08,-.44],[0,-.41],[.08,-.44]],'#75483d',.018);
    b.pol([[-.22,-.19],[0,-.09],[.20,-.19],[0,.04]],tecnica?verde:'#edc882');c.restore();
  }
  function escena(c,w,h,id,noche=false) {
    const b=lapiz(c),s=Math.min(w/16,h/8);
    horizonte(c,w,h,noche?21:7);b.rect(0,h*.72,w,h*.28,'#737f78');
    if(id==='estacion'||id==='taller'){
      b.rect(0,h*.12,w,h*.12,'#355968');b.rect(0,h*.24,w,h*.035,verde);
      for(const i of [.08,.53,.92])b.rect(w*i,h*.26,s*.15,h*.48,'#687d80');
      if(id==='estacion'){for(let i=0;i<4;i++){const x=w*(.28+i*.13);b.rect(x,h*.63,s*.20,h*.13,metal);vehiculo(c,'bici','lado',x,h*.72,s*.77,{persona:false});}
        b.rect(w*.09,h*.42,s*.68,s*1.9,tinta);b.rect(w*.10,h*.45,s*.44,s*.32,'#90bbac');}
      else {b.rect(w*.14,h*.58,w*.72,s*.25,'#d6ad7c');for(const i of [.18,.78])b.rect(w*i,h*.61,s*.28,h*.19,tinta);
        vehiculo(c,'bici','lado',w*.48,h*.57,s*1.4,{persona:false});}
    } else if(['bodega','monitoreo','atencion'].includes(id)){
      b.rect(0,0,w,h*.66,'#456273');b.rect(0,h*.66,w,h*.34,'#344c58');
      if(id==='bodega'){for(let n=0;n<3;n++){const y=h*(.15+n*.19);b.rect(w*.08,y+h*.14,w*.84,h*.025,'#d1ac78');
        for(let i=0;i<6;i++){const x=w*(.10+i*.135);b.rect(x,y,w*.095,h*.13,'#bc926c');b.rect(x+w*.04,y,w*.014,h*.055,'#eddab3');}}}
      if(id==='monitoreo'){for(let i=0;i<3;i++){const x=w*(.06+i*.31);b.rect(x,h*.13,w*.27,h*.40,tinta);
        b.linea([[x+w*.02,h*.45],[x+w*.08,h*.26],[x+w*.15,h*.37],[x+w*.22,h*.21]],'#85bba4',s*.07);}
        b.rect(w*.07,h*.62,w*.86,h*.07,'#a5b4ac');}
      if(id==='atencion'){b.rect(w*.07,h*.12,w*.49,h*.44,'#aecac3');b.rect(w*.31,h*.12,s*.12,h*.44,metal);
        retrato(c,w*.76,h*.52,s*2.4,'Cata');b.rect(w*.06,h*.64,w*.88,h*.16,'#b78565');}
    } else if(id==='fragmento'){pieza(c,'poste',w*.2,h*.77,s);retrato(c,w*.37,h*.70,s*2.7,'Rosalba');pieza(c,'boleto',w*.57,h*.78,s*1.6);retrato(c,w*.72,h*.68,s*2.5,'Cata');}
    else {pieza(c,'casa',w*.18,h*.70,s*.57,noche);pieza(c,'arbol',w*.80,h*.73,s*.66);vehiculo(c,'bici','lado',w*.49,h*.81,s*1.60);if(id==='resultado')pieza(c,'hoja',w*.65,h*.61,s*1.8);}
  }
  return {medidas,vehiculo,horizonte,pieza,retrato,escena};
})();
