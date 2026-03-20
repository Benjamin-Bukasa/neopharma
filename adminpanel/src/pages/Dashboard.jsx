import { Link } from "react-router-dom";
import { sidebarSections } from "../routes/router";
import StatCard from "../components/ui/StatCard";

const countLeaves = (items) =>
  items.reduce(
    (total, item) => total + (item.children?.length ? item.children.length : 1),
    0,
  );

function Dashboard() {
  const exploitationCount = countLeaves(sidebarSections[0].items);
  const configurationCount = countLeaves(sidebarSections[1].items);

  return (
    <div className="layoutSection flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-header/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
              Vue centrale
            </span>
            <h2 className="mt-3 text-2xl font-semibold text-text-primary">
              Dashboard administration centrale
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Cette base reprend le style du front principal avec un navbar,
              une sidebar retractable et un routeur React Router pilote depuis
              `router.jsx`.
            </p>
          </div>
          <Link
            to="/commande/demande-achat"
            className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white"
          >
            Ouvrir les commandes
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Exploitation" tone="green" value={exploitationCount} />
        <StatCard label="Configurations" tone="amber" value={configurationCount} />
        <StatCard label="Groupes sidebar" tone="blue" value={sidebarSections.length} />
        <StatCard label="Routeur" tone="slate" value="React Router" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-text-primary">Commande et mouvement</h3>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
              Operationnel
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            Les ecrans de commande, mouvements, etats de stock et inventaire sont
            raccordes aux routes et prets pour les tableaux metier.
          </p>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-text-primary">Configurations</h3>
            <span className="rounded-full bg-header/20 px-3 py-1 text-xs font-medium text-text-secondary">
              Toujours visible
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            Les sections Articles, Parametres et Utilisateur restent directement
            accessibles depuis la sidebar.
          </p>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
