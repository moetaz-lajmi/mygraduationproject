const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // auto, santé...
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["actif", "expiré"], default: "actif" }
});

const Contract = mongoose.model("Contract", ContractSchema);

module.exports = Contract;