const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    sinistreType: {
        type: String,
        enum: ["sante", "voyage", "auto", "batiment"],
        required: false
    },
    description: { type: String, required: true },
    status: { type: String, enum: ["en attente", "accepté", "refusé"], default: "en attente" },
    date: { type: Date, default: Date.now }
});

const Claim = mongoose.model("Claim", ClaimSchema);

module.exports = Claim;