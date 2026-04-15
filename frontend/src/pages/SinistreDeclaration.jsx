import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getSinistreTypeLabel } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { Building2, Car, HeartPulse, Plane, ClipboardList, ArrowRight } from "lucide-react";

const SINISTRE_TYPES = [
  {
    id: "sante",
    label: "Santé",
    description: "Frais médicaux, hospitalisation, soins",
    icon: HeartPulse,
    accent: "from-rose-500/15 to-rose-600/5 border-rose-500/30",
    iconClass: "text-rose-600 bg-rose-100"
  },
  {
    id: "voyage",
    label: "Voyage",
    description: "Bagages, annulation, assistance à l'étranger",
    icon: Plane,
    accent: "from-sky-500/15 to-sky-600/5 border-sky-500/30",
    iconClass: "text-sky-600 bg-sky-100"
  },
  {
    id: "auto",
    label: "Auto",
    description: "Accident, bris de glace, vol du véhicule",
    icon: Car,
    accent: "from-amber-500/15 to-amber-600/5 border-amber-500/30",
    iconClass: "text-amber-600 bg-amber-100"
  },
  {
    id: "batiment",
    label: "Bâtiment",
    description: "Incendie, dégâts des eaux, catastrophes",
    icon: Building2,
    accent: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/30",
    iconClass: "text-emerald-600 bg-emerald-100"
  }
];

export default function SinistreDeclaration() {
  const { user } = useContext(AuthContext);
  const isGestionnaire = user?.role === "gestionnaire";
  const [contracts, setContracts] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contractId: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [contractsRes, claimsRes] = await Promise.all([
          API.get("/contracts"),
          API.get("/claims")
        ]);
        setContracts(contractsRes.data || []);
        setClaims(claimsRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Veuillez choisir un type de sinistre.");
      return;
    }
    if (!formData.contractId || !formData.description.trim()) {
      alert("Veuillez remplir le contrat et la description.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await API.post("/claims", {
        ...formData,
        sinistreType: selectedType
      });
      const createdClaim = res.data;
      if (createdClaim?._id) {
        setClaims((prev) => [createdClaim, ...prev]);
      }
      alert("Déclaration enregistrée avec succès.");
      setFormData({
        contractId: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
      setSelectedType(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de la déclaration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a67e]" />
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#00a67e] text-sm font-semibold mb-2">
              <ClipboardList className="w-4 h-4" />
              Déclaration en ligne
            </div>
            <h1 className="text-3xl font-bold text-[#1a365d]">Déclaration de sinistre</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Sélectionnez le type de sinistre (santé, voyage, auto ou bâtiment), puis renseignez les informations
              pour transmettre votre déclaration à BNA Assurances.
            </p>
          </div>
          <Link
            to="/mon-sinistre"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a67e] hover:text-[#008c6a]"
          >
            Voir mon sinistre
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!isGestionnaire && (
          <section>
            <h2 className="text-lg font-semibold text-[#1a365d] mb-4">Type de sinistre</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {SINISTRE_TYPES.map((t) => {
                const Icon = t.icon;
                const active = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`
                      text-left rounded-2xl border-2 p-5 transition-all bg-gradient-to-br shadow-sm
                      ${t.accent}
                      ${active
                        ? "ring-2 ring-[#00a67e] border-[#00a67e] shadow-md scale-[1.02]"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${t.iconClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#1a365d]">{t.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {isGestionnaire && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            Le gestionnaire ne peut pas déclarer de sinistre. Vous pouvez consulter, modifier le statut et gérer les dossiers utilisateurs depuis <strong>Mon sinistre</strong>.
          </div>
        )}

        {!isGestionnaire && selectedType && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-3xl">
            <h2 className="text-lg font-semibold text-[#1a365d] mb-1">Détails de la déclaration</h2>
            <p className="text-sm text-slate-500 mb-6">
              Type sélectionné :{" "}
              <span className="font-semibold text-[#00a67e]">{getSinistreTypeLabel(selectedType)}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Contrat concerné *</label>
                <select
                  required
                  value={formData.contractId}
                  onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                >
                  <option value="">— Choisir un contrat —</option>
                  {contracts
                    .filter((c) => c.status === "actif")
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.type} — actif jusqu&apos;au {formatDate(c.endDate)}
                      </option>
                    ))}
                </select>
                {contracts.filter((c) => c.status === "actif").length === 0 && (
                  <p className="text-sm text-amber-700 mt-2">
                    Aucun contrat actif.{" "}
                    <Link to="/contracts" className="underline font-medium">
                      Consultez vos contrats
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Date du sinistre</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Description *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Décrivez les circonstances, les dommages et toute information utile pour traiter votre dossier..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#00a67e] hover:bg-[#008c6a] disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                >
                  {submitting ? "Envoi..." : "Envoyer la déclaration"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Changer de type
                </button>
              </div>
            </form>
          </section>
        )}

        {!isGestionnaire && !selectedType && (
          <p className="text-sm text-slate-500">
            Après avoir choisi un type, le formulaire de déclaration s&apos;affichera ici.
          </p>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-[#1a365d]">Mes sinistres déclarés</h2>
            <Link
              to="/mon-sinistre"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a67e] hover:text-[#008c6a]"
            >
              Voir mon sinistre
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {claims.length === 0 ? (
            <p className="text-sm text-slate-500 mt-3">
              Vous n&apos;avez pas encore déclaré de sinistre.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {claims.slice(0, 3).map((claim) => (
                <div
                  key={claim._id}
                  className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-[#1a365d]">
                      Sinistre #{claim._id.slice(-6)}
                    </p>
                    <span className="text-xs font-medium text-slate-600">
                      {formatDate(claim.date)}
                    </span>
                  </div>
                  <p className="text-sm text-[#00a67e] mt-1">
                    {getSinistreTypeLabel(claim.sinistreType) || "Type non spécifié"}
                  </p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {claim.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
