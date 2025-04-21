import { listController } from "./modules/mvc/listController.js";

document.addEventListener("DOMContentLoaded", async () => {
    await listController.init();
});
