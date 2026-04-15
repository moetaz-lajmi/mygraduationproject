const express = require("express");
const router = express.Router();
const { createClaim, getClaims, updateClaimStatus, deleteClaim } = require("../controllers/claimController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createClaim);
router.get("/", auth, getClaims);
router.patch("/:id/status", auth, updateClaimStatus);
router.delete("/:id", auth, deleteClaim);

module.exports = router;