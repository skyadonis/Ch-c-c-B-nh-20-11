/* ===== Điều khiển camera đa nền tảng: Pointer/Touch drag, Pinch-zoom, Wheel, Damping, Auto-rotate ===== */
import { CONFIG } from './config.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function createControls(dom, camera, { onTap, onDoubleTap }) {
  // toạ độ cầu (θ, φ, R): hiện tại và đích
    let th = 0.5, ph = 1.15, rad = innerWidth < innerHeight ? 24 : 17;
      let thT = th, phT = ph, radT = rad, lastInput = performance.now();
        const ptrs = new Map();
          let dragTotal = 0, pinchD = 0, tapTimer = null, lastTap = 0;
            const dist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };

              dom.addEventListener('pointerdown', e => {
                  dom.setPointerCapture(e.pointerId);
                      if (ptrs.size === 0) dragTotal = 0;
                          ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); lastInput = performance.now();
                              if (ptrs.size === 2) { pinchD = dist(); dragTotal = 99; }
                                });
                                  dom.addEventListener('pointermove', e => {
                                      const p = ptrs.get(e.pointerId); if (!p) return;
                                          const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; lastInput = performance.now();
                                              if (ptrs.size === 1) {
                                                    dragTotal += Math.abs(dx) + Math.abs(dy);
                                                          if (dragTotal > 6) {
                                                                  document.body.classList.add('is-dragging');
                                                                          thT -= dx * 0.006; phT = clamp(phT - dy * 0.006, 0.2, 1.42);   // không chui xuống dưới mặt sông
                                                                                }
                                                                                    } else if (ptrs.size === 2) { const d = dist(); radT = clamp(radT * pinchD / d, 6, 42); pinchD = d; }
                                                                                      });
                                                                                        const end = (e, cancel) => {
                                                                                            const wasTap = !cancel && ptrs.size === 1 && dragTotal <= 6;
                                                                                                ptrs.delete(e.pointerId);
                                                                                                    if (!ptrs.size) document.body.classList.remove('is-dragging');
                                                                                                        if (!wasTap) return;
                                                                                                            const now = performance.now();                              // nhấn đơn = biến hình, nhấn đúp = tâm thư
                                                                                                                if (tapTimer && now - lastTap < CONFIG.DOUBLE_TAP_MS) { clearTimeout(tapTimer); tapTimer = null; onDoubleTap(); }
                                                                                                                    else { lastTap = now; tapTimer = setTimeout(() => { tapTimer = null; onTap(); }, CONFIG.DOUBLE_TAP_MS); }
                                                                                                                      };
                                                                                                                        dom.addEventListener('pointerup', e => end(e, false));
                                                                                                                          dom.addEventListener('pointercancel', e => end(e, true));
                                                                                                                            dom.addEventListener('wheel', e => {
                                                                                                                                e.preventDefault(); radT = clamp(radT * Math.exp(e.deltaY * 0.0012), 6, 42); lastInput = performance.now();
                                                                                                                                  }, { passive: false });

                                                                                                                                    return {
                                                                                                                                        update(dt) {
                                                                                                                                              if (performance.now() - lastInput > CONFIG.IDLE_MS) thT += dt * 0.08;   // tự xoay nhẹ khi rảnh
                                                                                                                                                    th += (thT - th) * 0.08; ph += (phT - ph) * 0.08; rad += (radT - rad) * 0.08;   // damping
                                                                                                                                                          camera.position.set(rad * Math.sin(ph) * Math.sin(th), 0.5 + rad * Math.cos(ph), rad * Math.sin(ph) * Math.cos(th));
                                                                                                                                                                camera.lookAt(0, 0.5, 0);
                                                                                                                                                                    },
                                                                                                                                                                      };
                                                                                                                                                                      }