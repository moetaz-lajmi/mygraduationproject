import { Link } from "react-router-dom"
import { Bell, FileText, ShieldAlert } from "lucide-react"
import Layout from "../components/Layout"

const cards = [
  {
    title: "Contracts",
    value: "12",
    description: "Active insurance contracts",
    icon: FileText,
    color: "bg-blue-500",
    link: "/contracts"
  },
  {
    title: "Claims",
    value: "4",
    description: "Claims in progress",
    icon: ShieldAlert,
    color: "bg-amber-500",
    link: "/claims"
  },
  {
    title: "Notifications",
    value: "9",
    description: "Unread updates and alerts",
    icon: Bell,
    color: "bg-emerald-500",
    link: "/messages"
  }
]

export default function Dashboard() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-r from-[#0f2744] to-[#1d4ed8] p-8 text-white shadow-xl sm:p-10">
            <h1 className="text-3xl font-bold sm:text-4xl">Dashboard Overview</h1>
            <p className="mt-3 text-base text-blue-100 sm:text-lg">
              Manage contracts, claims, and notifications from a single workspace.
            </p>
          </div>

          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color} shadow-sm`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-slate-800">{card.value}</span>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-blue-700 transition-colors group-hover:text-blue-500">
                    Open {card.title}
                  </span>
                </Link>
              )
            })}
          </section>
        </div>
      </div>
    </Layout>
  )
}
