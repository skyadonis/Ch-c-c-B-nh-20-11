/* ===== Nhạc nền: phát file MP3 cục bộ + nút Bật/Tắt ===== */
const AUDIO_SRC = 'nhac.mp3';            // đặt file MP3 (đã đổi tên) cùng thư mục với index.html
const btn = document.getElementById('music-btn');

const audio = new Audio(AUDIO_SRC);
audio.loop = true; audio.volume = 0.75; audio.preload = 'auto';
let userMuted = false;

function updateBtn() {
  if (!btn) return;
    const playing = !audio.paused;
      btn.textContent = playing ? '♫ Đang phát' : '♪ Bật nhạc';
        btn.classList.toggle('playing', playing);
        }
        audio.addEventListener('play', updateBtn);
        audio.addEventListener('pause', updateBtn);
        audio.addEventListener('error', () => { if (btn) btn.textContent = '♪ Không tìm thấy nhạc'; });

        // Nút bật / tắt thủ công
        btn?.addEventListener('click', e => {
          e.stopPropagation();
            if (audio.paused) { userMuted = false; audio.play().catch(() => {}); }
              else { userMuted = true; audio.pause(); }
              });

              // Tự phát ở lần chạm/kéo đầu tiên (trình duyệt chỉ cho phép sau tương tác); bỏ qua khi bấm đúng nút nhạc
              const unlockAudio = e => {
                if (e.target?.closest?.('#music-btn')) return;
                  if (audio.paused && !userMuted) audio.play().catch(() => {});
                  };
                  window.addEventListener('pointerdown', unlockAudio, { once: true });
                  window.addEventListener('keydown', unlockAudio, { once: true });