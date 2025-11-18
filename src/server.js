import app from "./app.js";

const PORT = process.env.PORT || 4000;

// 👇 Importante: escuchar en todas las interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Liveness service running on port ${PORT}`);
});
