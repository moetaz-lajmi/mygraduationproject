const Document = require("../models/Document");
const User = require("../models/User");

exports.uploadDocument = async (req, res) => {
  const doc = new Document({
    userId: req.user.id,
    fileUrl: req.file.path,
    type: req.body.type
  });

  await doc.save();
  res.json(doc);
};

exports.getDocuments = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("role");
  const canSeeAll = ["admin", "gestionnaire"].includes(currentUser?.role);
  const query = canSeeAll ? {} : { userId: req.user.id };
  const docs = await Document.find(query).populate("userId", "name email role");
  res.json(docs);
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    const currentUser = await User.findById(req.user.id).select("role");
    const canDeleteAny = ["admin", "gestionnaire"].includes(currentUser?.role);

    if (!canDeleteAny && doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Document supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};