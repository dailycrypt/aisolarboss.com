/* AI SOLAR BOSS — WebGL hero: shader-displaced sun + particle corona.
   Loaded as an ES module only on the home page. Degrades to CSS fallback
   (`.hero.no-webgl .sun-fallback`) when WebGL or motion isn't available. */

const hero = document.querySelector('.hero');
const canvas = document.getElementById('sun-canvas');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const webglOK = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
})();

if (!canvas || reduced || !webglOK) {
  if (hero) hero.classList.add('no-webgl');
} else {
  init().catch(() => hero.classList.add('no-webgl'));
}

async function init() {
  const THREE = await import('three');

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 60);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight);

  /* ---- Sun core: noise-displaced icosphere ---- */
  const NOISE = /* glsl */`
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }`;

  const sunUniforms = {
    uTime:   { value: 0 },
    uScroll: { value: 0 },
    uAmp:    { value: 0.22 },
    uColorA: { value: new THREE.Color('#FFD873') },
    uColorB: { value: new THREE.Color('#FFB300') },
    uColorC: { value: new THREE.Color('#FF5C1F') },
  };

  const sunMat = new THREE.ShaderMaterial({
    uniforms: sunUniforms,
    vertexShader: NOISE + /* glsl */`
      uniform float uTime; uniform float uAmp; uniform float uScroll;
      varying float vNoise; varying vec3 vNormalW; varying vec3 vPosW;
      void main(){
        float n = snoise(normal * 1.6 + uTime * 0.22);
        n += 0.45 * snoise(normal * 4.2 - uTime * 0.34);
        vNoise = n;
        vec3 displaced = position + normal * n * (uAmp + uScroll * 0.25);
        vec4 world = modelMatrix * vec4(displaced, 1.0);
        vPosW = world.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
      uniform float uScroll;
      varying float vNoise; varying vec3 vNormalW; varying vec3 vPosW;
      void main(){
        vec3 viewDir = normalize(cameraPosition - vPosW);
        float fresnel = pow(1.0 - clamp(dot(viewDir, vNormalW), 0.0, 1.0), 2.2);
        float t = clamp(vNoise * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(uColorB, uColorA, t);           /* amber -> pale gold on ridges */
        col = mix(col, uColorC, fresnel * 0.9);        /* ember rim */
        col = mix(col, uColorC, uScroll * 0.55);       /* sunset shift on scroll */
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

  const sun = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, isMobile ? 48 : 72), sunMat);
  scene.add(sun);

  /* Halo (backside glow shell) */
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#FF8A1E') } },
    vertexShader: `varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz;
      gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vP;
      void main(){ vec3 v = normalize(cameraPosition - vP);
      float glow = pow(1.0 - abs(dot(v, vN)), 3.0);
      gl_FragColor = vec4(uColor, glow * 0.55); }`,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.05, 24), haloMat));

  /* ---- Particle corona ---- */
  const COUNT = isMobile ? 700 : 1600;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 2.2 + Math.pow(Math.random(), 1.6) * 4.2;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    pos[i*3+1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
    pos[i*3+2] = r * Math.cos(ph);
    seed[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const pUniforms = { uTime: { value: 0 }, uDPR: { value: DPR } };
  const pMat = new THREE.ShaderMaterial({
    uniforms: pUniforms,
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uDPR; varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * (0.12 + aSeed * 0.22);
        p.xz = mat2(cos(t), -sin(t), sin(t), cos(t)) * p.xz;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float tw = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 40.0);
        vA = tw * smoothstep(8.0, 3.2, length(p));
        gl_PointSize = (aSeed * 2.6 + 1.1) * uDPR * (7.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d) * vA;
        gl_FragColor = vec4(1.0, 0.72, 0.25, a * 0.8);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.Points(pGeo, pMat));

  /* Composition: sun sits right-of-centre on desktop, centred-high on mobile */
  const group = new THREE.Group();
  scene.children.forEach(c => group.add(c));
  scene.add(group);
  const placeGroup = () => {
    const mob = window.matchMedia('(max-width: 768px)').matches;
    group.position.set(mob ? 0 : 2.1, mob ? 1.5 : 0.7, 0);
    group.scale.setScalar(mob ? 0.72 : 1);
  };
  placeGroup();

  /* ---- Interaction ---- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  let scrollN = 0;
  const onScroll = () => { scrollN = Math.min(scrollY / innerHeight, 1); };
  addEventListener('scroll', onScroll, { passive: true });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    placeGroup();
  });

  /* Pause rendering when hero is off-screen */
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(hero);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    sunUniforms.uTime.value = t;
    sunUniforms.uScroll.value = scrollN;
    pUniforms.uTime.value = t;

    sun.rotation.y = t * 0.07 + scrollN * 1.2;
    group.rotation.x = mouse.y * 0.12;
    group.rotation.y = mouse.x * 0.18;
    group.position.y = (window.matchMedia('(max-width:768px)').matches ? 1.5 : 0.7) + scrollN * 1.6;

    renderer.render(scene, camera);
  });
}
