const Claim = require("../models/Claim");
const User = require("../models/User");

exports.createClaim = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("role");
  if (currentUser?.role === "gestionnaire") {
    return res.status(403).json({ message: "Le gestionnaire ne peut pas créer de déclaration." });
  }

  const claim = new Claim({
    ...req.body,
    userId: req.user.id
  });

  await claim.save();
  res.json(claim);
};

exports.getClaims = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("role");
  const canSeeAll = ["admin", "gestionnaire"].includes(currentUser?.role);
  const query = canSeeAll ? {} : { userId: req.user.id };
  const claims = await Claim.find(query).populate("userId", "name email role");
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    if (!["admin", "gestionnaire"].includes(currentUser?.role)) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const { status } = req.body;
    const allowedStatus = ["en attente", "accepté", "refusé"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updated = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email role");

    if (!updated) {
      return res.status(404).json({ message: "Déclaration non trouvée" });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    if (!["admin", "gestionnaire"].includes(currentUser?.role)) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const deleted = await Claim.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Déclaration non trouvée" });
    }
    return res.json({ message: "Déclaration supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};