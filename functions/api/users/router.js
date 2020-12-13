const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth");
const {
  getAll,
  getById,
  create,
  update,
  deleteById,
} = require("./controllers");

router.use(authMiddleware);

router.get("/users", getAll);
router.get("/users/:id", getById);
router.post("/users", create);
router.put("/users/:id", update);
router.delete("/users/:id", deleteById);

module.exports = router;
