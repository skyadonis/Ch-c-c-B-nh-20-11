import './music.js';
/* ===== Khởi tạo Scene, UnrealBloomPass, State Machine (BOOK ↔ BOAT) & vòng lặp Render ===== */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG } from './config.js';
import { buildGeometry, resolveTarget } from './geometries.js';
import { makeGlowTexture, glowMaterial, makePoints, createSky, createButterflies, createLanterns } from './entities.js';
import { createControls } from './controls.js';

const { N, MORPH, BLOOM } = CONFIG;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ---------- Scene, camera, renderer + hậu kỳ Bloom ---------- */
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight); container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
(() => {                                                          // nền radial-gradient vũ trụ sâu
  const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'), gr = x.createRadialGradient(256, 230, 0, 256, 230, 380);
      gr.addColorStop(0, '#0b1330'); gr.addColorStop(1, '#03050c'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
        })();
        const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 400);

        const composer = new EffectComposer(renderer);
        composer.setPixelRatio(DPR); composer.setSize(innerWidth, innerHeight);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), BLOOM.strength, BLOOM.radius, BLOOM.threshold));
        composer.addPass(new OutputPass());

        /* ---------- Thực thể ---------- */
        const tex = makeGlowTexture();
        const data = buildGeometry();
        const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
        col.set(data.cB);
        const cloud = makePoints(scene, pos, col, glowMaterial(tex, { size: CONFIG.PARTICLE_SIZE * DPR, opacity: 0.85 }));
        const sky = createSky(scene, tex, DPR);
        const butterflies = createButterflies(scene, tex, DPR);
        const lanterns = createLanterns(scene, tex, DPR);

        /* ---------- HUD & tâm thư ---------- */
        const titleEl = document.getElementById('scene-title'), statusEl = document.getElementById('status'), letter = document.getElementById('letter');
        const TITLES = ['Cuốn Sách Ngân Hà', 'Bến Đò Tri Ân'];
        let T = 0;
        function openLetter() { letter.classList.add('open'); letter.setAttribute('aria-hidden', 'false'); lanterns.launch(T); }
        function closeLetter() { letter.classList.remove('open'); letter.setAttribute('aria-hidden', 'true'); }
        document.getElementById('x').onclick = closeLetter;
        letter.addEventListener('pointerdown', e => { if (e.target === letter) closeLetter(); });    // bấm ra ngoài thiệp để đóng
        addEventListener('keydown', e => { if (e.key === 'Escape') closeLetter(); });

        /* ---------- State machine: BOOK(0) ↔ BOAT(1) ---------- */
        let state = 0, from = 0, morphing = false, m0 = 0;
        function startMorph() {
          if (morphing) return;
            from = state; state = 1 - state; morphing = true; m0 = T;
              statusEl.classList.add('show'); titleEl.classList.add('swap');
                setTimeout(() => { titleEl.textContent = TITLES[state]; titleEl.classList.remove('swap'); }, 700);
                }
                const controls = createControls(container, camera, { onTap: startMorph, onDoubleTap: openLetter });

                const A = [0, 0, 0], B = [0, 0, 0], colors = [data.cB, data.cT];
                function updateParticles() {
                  if (!morphing) {
                      for (let i = 0; i < N; i++) { resolveTarget(data, state, i, T, B); const k = i * 3; pos[k] = B[0]; pos[k + 1] = B[1]; pos[k + 2] = B[2]; }
                        } else {
                            const p = clamp((T - m0) / MORPH.duration, 0, 1), e = p * p * (3 - 2 * p), tb = Math.sin(Math.PI * p);
                                const ca = colors[from], cb = colors[state], [aMin, aMax] = MORPH.turbulence;
                                    for (let i = 0; i < N; i++) {
                                          resolveTarget(data, from, i, T, A); resolveTarget(data, state, i, T, B);
                                                const k = i * 3, ph = data.phase[i], amp = tb * (aMin + (aMax - aMin) * ph / (Math.PI * 2));
                                                      let x = A[0] + (B[0] - A[0]) * e, y = A[1] + (B[1] - A[1]) * e, z = A[2] + (B[2] - A[2]) * e;
                                                            x += (Math.sin(y * 1.3 + T * 2 + ph) + Math.cos(z * 1.7 - T * 1.5)) * amp;        // nhiễu xoáy kiểu curl
                                                                  y += (Math.sin(z * 1.1 + T * 1.7) + Math.cos(x * 1.5 + ph)) * amp * 0.8;
                                                                        z += (Math.sin(x * 1.2 - T * 1.9) + Math.cos(y * 1.6 + ph)) * amp;
                                                                              pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
                                                                                    col[k] = ca[k] + (cb[k] - ca[k]) * e; col[k + 1] = ca[k + 1] + (cb[k + 1] - ca[k + 1]) * e; col[k + 2] = ca[k + 2] + (cb[k + 2] - ca[k + 2]) * e;
                                                                                        }
                                                                                            cloud.geometry.attributes.color.needsUpdate = true;
                                                                                                if (p >= 1) { morphing = false; col.set(colors[state]); statusEl.classList.remove('show'); }
                                                                                                  }
                                                                                                    cloud.geometry.attributes.position.needsUpdate = true;
                                                                                                    }

                                                                                                    /* ---------- Vòng lặp ---------- */
                                                                                                    addEventListener('resize', () => {
                                                                                                      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
                                                                                                        renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
                                                                                                        });
                                                                                                        const clock = new THREE.Clock();
                                                                                                        renderer.setAnimationLoop(() => {
                                                                                                          const dt = Math.min(clock.getDelta(), 0.05); T += dt;
                                                                                                            controls.update(dt); updateParticles(); sky.update(T); butterflies.update(T); lanterns.update(T);
                                                                                                              composer.render();
                                                                                                              });