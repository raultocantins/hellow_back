import express from "express";
import isAuth from "../middleware/isAuth";

import * as ProfileController from "../controllers/ProfileController";

const profileRoutes = express.Router();

profileRoutes.get("/profiles", isAuth, ProfileController.index);

profileRoutes.post("/profiles", isAuth, ProfileController.store);

profileRoutes.put("/profiles/:profileId", isAuth, ProfileController.update);

profileRoutes.get("/profiles/:profileId", isAuth, ProfileController.show);

profileRoutes.delete("/profiles/:profileId", isAuth, ProfileController.remove);

export default profileRoutes;
