import { Car, Home, Heart, Briefcase, Plane, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Car,
    type: "auto",
    title: "Assurance Auto",
    description: "Protection complète pour votre véhicule avec des garanties adaptées à vos besoins et un accompagnement personnalisé."
  },
  {
    icon: Home,
    type: "home",
    title: "Assurance Habitation",
    description: "Sécurisez votre logement et vos biens contre tous les risques avec nos formules flexibles."
  },
  {
    icon: Heart,
    type: "health",
    title: "Assurance Santé",
    description: "Des couvertures santé complètes pour vous et votre famille, avec un accès aux meilleurs soins."
  },
  {
    icon: Briefcase,
    title: "Assurance Professionnelle",
    description: "Solutions sur mesure pour protéger votre activité professionnelle et vos employés."
  },
  {
    icon: Plane,
    title: "Assurance Voyage",
    description: "Voyagez l'esprit tranquille avec une protection mondiale contre les imprévus."
  },
  {
    icon: Building2,
    title: "Assurance Entreprise",
    description: "Protégez votre entreprise avec des couvertures adaptées à votre secteur d'activité."
  }
]

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 md:py-32 bg-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#00a67e] font-semibold text-sm uppercase tracking-wider">Nos Services</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a365d] mt-3 mb-4">
            Des solutions pour chaque besoin
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez notre gamme complète de produits d'assurance conçus pour vous offrir 
            une protection optimale à chaque étape de votre vie.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index} 
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#00a67e]/50"
            >
              <div className="w-14 h-14 rounded-xl bg-[#00a67e]/10 flex items-center justify-center mb-4 group-hover:bg-[#00a67e]/20 transition-colors">
                <service.icon className="h-7 w-7 text-[#00a67e]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a365d] mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
              {service.type && (
                <Link
                  to={`/services/${service.type}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00a67e] hover:text-[#008c6a]"
                >
                  Voir les details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}