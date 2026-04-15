import { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getStatusBadgeColor, truncateText, getSinistreTypeLabel } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";

export default function MonSinistre() {
  const { user } = useContext(AuthContext);
  const canManage = ["admin", "gestionnaire"].includes(user?.role);
  const [sinistres, setSinistres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSinistre, setSelectedSinistre] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  useEffect(() => {
    fetchSinistres();
  }, []);

  const fetchSinistres = async () => {
    try {
      const res = await API.get("/claims");
      const onlySinistres = (res.data || []).filter((item) => !!item.sinistreType);
      setSinistres(onlySinistres);
    } catch (error) {
      console.error("Error fetching sinistres:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSinistres = sinistres.filter((sinistre) => {
    const matchesSearch =
      sinistre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistre._id.toString().includes(searchTerm);
    const matchesFilter = filterStatus === "all" || sinistre.status === filterStatus;
    const sinistreUserId = typeof sinistre.userId === "object" ? sinistre.userId._id : sinistre.userId;
    const matchesUser = filterUser === "all" || sinistreUserId === filterUser;
    return matchesSearch && matchesFilter && matchesUser;
  });
  const uniqueUsers = [...new Map(
    sinistres
      .filter((s) => s.userId && typeof s.userId === "object")
      .map((s) => [s.userId._id, s.userId])
  ).values()];

  const handleStatusUpdate = async (sinistreId, status) => {
    try {
      const res = await API.patch(`/claims/${sinistreId}/status`, { status });
      setSinistres((prev) => prev.map((s) => (s._id === sinistreId ? res.data : s)));
      if (selectedSinistre?._id === sinistreId) {
        setSelectedSinistre(res.data);
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut: " + error.response?.data?.message);
    }
  };

  const handleDeleteSinistre = async (sinistreId) => {
    if (!window.confirm("Supprimer ce sinistre ?")) return;
    try {
      await API.delete(`/claims/${sinistreId}`);
      setSinistres((prev) => prev.filter((s) => s._id !== sinistreId));
      if (selectedSinistre?._id === sinistreId) {
        setSelectedSinistre(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      alert("Erreur lors de la suppression: " + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Chargement des sinistres...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Sinistre</h1>
            <p className="text-gray-600 mt-1">Suivez vos sinistres déclarés</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Rechercher par description ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="en attente">En attente</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
            {canManage && (
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Tous les utilisateurs</option>
                {uniqueUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredSinistres.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucun sinistre trouvé</p>
            </div>
          ) : (
            filteredSinistres.map((sinistre) => (
              <div
                key={sinistre._id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-red-500 hover:shadow-lg cursor-pointer transition-all"
                onClick={() => {
                  setSelectedSinistre(sinistre);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">Sinistre #{sinistre._id.slice(-6)}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f7f2] text-[#00664d]">
                        {getSinistreTypeLabel(sinistre.sinistreType)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(sinistre.status)}`}>
                        {sinistre.status === "en attente" ? "En attente" :
                          sinistre.status === "accepté" ? "Accepté" : "Refusé"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{truncateText(sinistre.description, 80)}</p>
                    {canManage && sinistre.userId && typeof sinistre.userId === "object" && (
                      <p className="text-xs text-[#1a365d] mb-1">
                        Utilisateur: {sinistre.userId.name} ({sinistre.userId.email})
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Soumis le {formatDate(sinistre.date)}</p>
                    {canManage && (
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={sinistre.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(sinistre._id, e.target.value);
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="en attente">En attente</option>
                          <option value="accepté">Accepté</option>
                          <option value="refusé">Refusé</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSinistre(sinistre._id);
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-3xl">🚨</div>
                </div>
              </div>
            ))
          )}
        </div>

        {showDetailModal && selectedSinistre && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails du sinistre</h2>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">ID du sinistre</p>
                  <p className="font-semibold text-gray-900">{selectedSinistre._id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Type de sinistre</p>
                  <p className="font-semibold text-gray-900">{getSinistreTypeLabel(selectedSinistre.sinistreType)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="font-semibold text-gray-900">{selectedSinistre.description}</p>
                </div>
                {canManage && selectedSinistre.userId && typeof selectedSinistre.userId === "object" && (
                  <div>
                    <p className="text-gray-600 text-sm">Utilisateur</p>
                    <p className="font-semibold text-gray-900">
                      {selectedSinistre.userId.name} ({selectedSinistre.userId.email})
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 text-sm">Statut</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedSinistre.status)}`}>
                    {selectedSinistre.status === "en attente" ? "En attente" :
                      selectedSinistre.status === "accepté" ? "Accepté" : "Refusé"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date de soumission</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedSinistre.date)}</p>
                </div>
              </div>

              {canManage && (
                <div className="flex gap-2">
                  <select
                    value={selectedSinistre.status}
                    onChange={(e) => handleStatusUpdate(selectedSinistre._id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en attente">En attente</option>
                    <option value="accepté">Accepté</option>
                    <option value="refusé">Refusé</option>
                  </select>
                  <button
                    onClick={() => handleDeleteSinistre(selectedSinistre._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSinistre(null);
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
