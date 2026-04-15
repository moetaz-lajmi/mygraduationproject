const Contract = require("../models/Contract");

exports.createContract = async (req, res) => {
  const contract = new Contract({ ...req.body, userId: req.user.id });
  await contract.save();
  res.json(contract);
};

exports.getContracts = async (req, res) => {
  const contracts = await Contract.find({ userId: req.user.id });
  res.json(contracts);
};

exports.renewContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Renew for another year
    const newEndDate = new Date(contract.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    
    contract.endDate = newEndDate;
    contract.status = "actif";
    await contract.save();

    res.json({ message: "Contrat renouvelé avec succès", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    contract.status = "expiré";
    await contract.save();

    res.json({ message: "Contrat annulé avec succès", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};