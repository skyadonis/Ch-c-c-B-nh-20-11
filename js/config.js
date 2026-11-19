/* ===== Cấu hình chung: màu, số hạt, Bloom, Morph ===== */
export const CONFIG = {
  N: 25000,                                   // tổng số hạt của khối hình biến hình
    PAL: {
        gold: '#ffd166', amber: '#ff9f1c', orange: '#f77f00', star: '#fff8e7',
            pink: '#ff9e7d', blush: '#ffb5a7',        // hồng đào & cam san hô cho đóa sen
              },
                // Dải chỉ số hạt cho từng bộ phận (BOOK và BOAT dùng chung tập hạt)
                  RANGES: {
                      pages: [0, 9000], lotus: [9000, 13500], galaxy: [13500, 21500], cover: [21500, 25000],
                          hull: [0, 7000], pen: [7000, 11000], penTip: [11000, 11700], boatman: [11700, 14700], river: [14700, 25000],
                            },
                              PARTICLE_SIZE: 0.11,
                                MORPH: { duration: 1.8, turbulence: [1.2, 3.6] },
                                  BLOOM: { strength: 0.85, radius: 0.65, threshold: 0.15 },
                                    BUTTERFLIES: 20,
                                      LANTERNS: 100,
                                        LANTERN_PARTICLES: 40,
                                          IDLE_MS: 3000,                              // sau ngần này ms không thao tác thì tự xoay
                                            DOUBLE_TAP_MS: 320,
                                            };