// Keep all conversions in one place
exports.toPaisa = (rupees) => Math.round(Number(rupees) * 100); // 12.99 → 1299 paisa
exports.fromPaisa = (paisa) => Number(paisa) / 100; // 1299 → 12.99 rupees
