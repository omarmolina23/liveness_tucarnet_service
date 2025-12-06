import "dotenv/config";  // 👈 Debe ser la PRIMERA LÍNEA del proyecto

import app from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Liveness service running on port ${PORT}`);
});