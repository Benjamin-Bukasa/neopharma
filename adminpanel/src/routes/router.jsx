import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRightLeft,
  ArrowUpFromLine,
  BadgeDollarSign,
  Boxes,
  ClipboardList,
  FileBadge,
  FileCog,
  FilePlus2,
  FileSearch,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  Package,
  PackageCheck,
  PackageOpen,
  Pill,
  ReceiptText,
  RotateCcw,
  Scale,
  ScanSearch,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tags,
  TestTube2,
  Undo2,
  Users,
  UserPlus,
  WalletCards,
  Warehouse
} from "lucide-react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import AdminResourcePage from "../pages/AdminResourcePage";
import AdminCreatePage from "../pages/AdminCreatePage";
import AdminDetailPage from "../pages/AdminDetailPage";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";

const leaf = ({
  id,
  name,
  path,
  link,
  icon,
  summary,
  sectionLabel,
  parentLabel,
  parentPath,
}) => ({
  id,
  name,
  path,
  link,
  icon,
  summary,
  sectionLabel,
  breadcrumbs: parentLabel
    ? [
        { label: parentLabel, path: parentPath },
        { label: name, path },
      ]
    : [{ label: name, path }],
});

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    : "--";
};

const formatPerson = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
  person?.email ||
  "--";

const formatBoolean = (value) => (value ? "Oui" : "Non");
const formatCount = (items) => (Array.isArray(items) ? items.length : 0);
const statusLabels = {
  DRAFT: "Non valide",
  SUBMITTED: "En cours",
  APPROVED: "Valide",
  SENT: "Valide",
  ORDERED: "Commande creee",
};

const pillTone = (value = "") => {
  const normalized = String(value).toUpperCase();

  if (
    [
      "APPROVED",
      "PAID",
      "RECEIVED",
      "POSTED",
      "COMPLETED",
      "ACTIVE",
      "TRUE",
    ].includes(normalized)
  ) {
    return "bg-success/10 text-success";
  }

  if (["PENDING", "DRAFT", "SUBMITTED", "SENT"].includes(normalized)) {
    return "bg-warning/10 text-warning";
  }

  if (["REJECTED", "INACTIVE", "FALSE"].includes(normalized)) {
    return "bg-danger/10 text-danger";
  }

  return "bg-header/20 text-text-secondary";
};

const renderPill = (value) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${pillTone(
      value,
    )}`}
  >
    {statusLabels[value] || value || "--"}
  </span>
);

const column = (header, accessor, options = {}) => ({
  header,
  accessor,
  key: options.key || String(header),
  render: options.render,
  sortBy: options.sortBy,
  className: options.className,
  headerClassName: options.headerClassName,
});

const createResource = ({
  endpoint,
  columns,
  defaultQuery,
  tableTitle,
  tableDescription,
  emptyMessage,
  description,
  staticRows,
  searchEnabled,
  pageSize,
  transformRows,
  rowActions,
}) => ({
  endpoint,
  columns,
  defaultQuery,
  tableTitle,
  tableDescription,
  emptyMessage,
  description,
  staticRows,
  searchEnabled,
  pageSize,
  transformRows,
  rowActions,
});

const compactValue = (value) =>
  value === "" || value === null || value === undefined ? undefined : value;

const numericValue = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
};

const mapItems = (items = [], mapper) =>
  items
    .map((item, index) => mapper(item, index))
    .filter((item) => item && Object.values(item).some((value) => value !== undefined));

const repeaterRow = (fields = [], index = 0) =>
  fields.reduce((accumulator, field) => {
    const value =
      typeof field.initialValue === "function"
        ? field.initialValue(index)
        : field.initialValue;

    return {
      ...accumulator,
      [field.name]:
        value !== undefined ? value : field.type === "checkbox" ? false : "",
    };
  }, {});

const createForm = ({
  createPath,
  title,
  description,
  endpoint,
  method,
  fields,
  repeaters,
  buildRequest,
  buildRequests,
  submitLabel,
  successMessage,
  unavailableMessage,
  ...rest
}) => ({
  createPath,
  title,
  description,
  endpoint,
  method,
  fields,
  repeaters,
  buildRequest,
  buildRequests,
  submitLabel,
  successMessage,
  unavailableMessage,
  ...rest,
});

export const dashboardMeta = leaf({
  id: "dashboard",
  name: "Dashboard",
  path: "/dashboard",
  link: "dashboard",
  icon: LayoutDashboard,
  summary: "Pilotage global de l'administration centrale.",
  sectionLabel: "Exploitation",
});

export const sidebarSections = [
  {
    id: "exploitation",
    title: "Exploitation",
    items: [
      dashboardMeta,
      {
        id: "commande",
        name: "Commande",
        path: "/commande",
        link: "commande",
        icon: ShoppingCart,
        children: [
          leaf({
            id: "commande-demande-achat",
            name: "Demande d'achat",
            path: "/commande/demande-achat",
            link: "commande-demande-achat",
            icon: FilePlus2,
            summary: "Preparation et validation des demandes d'achat.",
            sectionLabel: "Commande",
            parentLabel: "Commande",
            parentPath: "/commande",
          }),
          leaf({
            id: "commande-requisitions",
            name: "Requisitions",
            path: "/commande/requisitions",
            link: "commande-requisitions",
            icon: ClipboardList,
            summary: "Suivi des demandes des boutiques et des services.",
            sectionLabel: "Commande",
            parentLabel: "Commande",
            parentPath: "/commande",
          }),
          leaf({
            id: "commande-commande",
            name: "Commande",
            path: "/commande/commande",
            link: "commande-commande",
            icon: ReceiptText,
            summary: "Creation et approbation des commandes fournisseur.",
            sectionLabel: "Commande",
            parentLabel: "Commande",
            parentPath: "/commande",
          }),
          leaf({
            id: "commande-liste-commande",
            name: "Liste de commande",
            path: "/commande/liste-commande",
            link: "commande-liste-commande",
            icon: ListChecks,
            summary: "Journal central de toutes les commandes emises.",
            sectionLabel: "Commande",
            parentLabel: "Commande",
            parentPath: "/commande",
          }),
        ],
      },
      {
        id: "mouvement",
        name: "Mouvement",
        path: "/mouvement",
        link: "mouvement",
        icon: ArrowLeftRight,
        children: [
          leaf({
            id: "mouvement-entree-stock",
            name: "Entree stock",
            path: "/mouvement/entree-stock",
            link: "mouvement-entree-stock",
            icon: ArrowDownToLine,
            summary: "Enregistrement des receptions et integrations au stock.",
            sectionLabel: "Mouvement",
            parentLabel: "Mouvement",
            parentPath: "/mouvement",
          }),
          leaf({
            id: "mouvement-sortie-stock",
            name: "Sortie stock",
            path: "/mouvement/sortie-stock",
            link: "mouvement-sortie-stock",
            icon: ArrowUpFromLine,
            summary: "Suivi des sorties vers boutiques, services ou pertes.",
            sectionLabel: "Mouvement",
            parentLabel: "Mouvement",
            parentPath: "/mouvement",
          }),
          leaf({
            id: "mouvement-retour-stock",
            name: "Retour stock",
            path: "/mouvement/retour-stock",
            link: "mouvement-retour-stock",
            icon: Undo2,
            summary: "Retour interne des articles vers la zone de stockage.",
            sectionLabel: "Mouvement",
            parentLabel: "Mouvement",
            parentPath: "/mouvement",
          }),
          leaf({
            id: "mouvement-transfert",
            name: "Transfert",
            path: "/mouvement/transfert",
            link: "mouvement-transfert",
            icon: ArrowRightLeft,
            summary: "Transfert de stock entre zones et points de vente.",
            sectionLabel: "Mouvement",
            parentLabel: "Mouvement",
            parentPath: "/mouvement",
          }),
          leaf({
            id: "mouvement-retour-fournisseur",
            name: "Retour fournisseur",
            path: "/mouvement/retour-fournisseur",
            link: "mouvement-retour-fournisseur",
            icon: RotateCcw,
            summary: "Gestion des retours sur lots defectueux ou non conformes.",
            sectionLabel: "Mouvement",
            parentLabel: "Mouvement",
            parentPath: "/mouvement",
          }),
          leaf({
            id: "mouvement-historique-mouvements",
            name: "Historique de mouvements",
            path: "/mouvement/historique-mouvements",
            link: "mouvement-historique-mouvements",
            icon: ScrollText,
            summary: "Trace complete des mouvements de stock et ajustements.",
            sectionLabel: "Mouvement",
            parentLabel: "Mouvement",
            parentPath: "/mouvement",
          }),
        ],
      },
      leaf({
        id: "etat-stock",
        name: "Etat de stock",
        path: "/etat-stock",
        link: "etat-stock",
        icon: ScanSearch,
        summary: "Niveau, couverture et alertes sur les quantites disponibles.",
        sectionLabel: "Exploitation",
      }),
      leaf({
        id: "etat-consommation",
        name: "Etat de consommation",
        path: "/etat-consommation",
        link: "etat-consommation",
        icon: BadgeDollarSign,
        summary: "Analyse des sorties et tendances de consommation.",
        sectionLabel: "Exploitation",
      }),
      {
        id: "inventaire",
        name: "Inventaire",
        path: "/inventaire",
        link: "inventaire",
        icon: Boxes,
        children: [
          leaf({
            id: "inventaire-inventaire",
            name: "Inventaire",
            path: "/inventaire/inventaire",
            link: "inventaire-inventaire",
            icon: PackageOpen,
            summary: "Preparation et execution des campagnes d'inventaire.",
            sectionLabel: "Inventaire",
            parentLabel: "Inventaire",
            parentPath: "/inventaire",
          }),
          leaf({
            id: "inventaire-etat",
            name: "Etat d'inventaire",
            path: "/inventaire/etat-inventaire",
            link: "inventaire-etat-inventaire",
            icon: Scale,
            summary: "Ecarts, valorisation et statut des inventaires en cours.",
            sectionLabel: "Inventaire",
            parentLabel: "Inventaire",
            parentPath: "/inventaire",
          }),
        ],
      },
    ],
  },
  {
    id: "configurations",
    title: "Configurations",
    items: [
      {
        id: "articles",
        name: "Articles",
        path: "/configurations/articles",
        link: "articles",
        icon: Pill,
        children: [
          leaf({
            id: "articles-produits",
            name: "Produits",
            path: "/configurations/articles/produits",
            link: "articles-produits",
            icon: Package,
            summary: "Catalogue principal des produits stockes.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
          leaf({
            id: "articles-articles",
            name: "Articles",
            path: "/configurations/articles/articles",
            link: "articles-articles",
            icon: FileSearch,
            summary: "Referentiel des articles et references internes.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
          leaf({
            id: "articles-familles",
            name: "Familles",
            path: "/configurations/articles/familles",
            link: "articles-familles",
            icon: FolderTree,
            summary: "Structuration des familles d'articles.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
          leaf({
            id: "articles-sous-familles",
            name: "Sous-familles",
            path: "/configurations/articles/sous-familles",
            link: "articles-sous-familles",
            icon: FolderTree,
            summary: "Decoupage detaille des sous-familles.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
          leaf({
            id: "articles-produits-vente",
            name: "Produits de vente",
            path: "/configurations/articles/produits-vente",
            link: "articles-produits-vente",
            icon: PackageCheck,
            summary: "Produits exposes aux boutiques et a la caisse.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
          leaf({
            id: "articles-fiche-technique",
            name: "Fiche technique",
            path: "/configurations/articles/fiche-technique",
            link: "articles-fiche-technique",
            icon: FileCog,
            summary: "Informations techniques, dosage, forme et conditions.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
          leaf({
            id: "articles-categorie",
            name: "Categorie",
            path: "/configurations/articles/categorie",
            link: "articles-categorie",
            icon: Tags,
            summary: "Categories operationnelles et analytiques des produits.",
            sectionLabel: "Configurations",
            parentLabel: "Articles",
            parentPath: "/configurations/articles",
          }),
        ],
      },
      {
        id: "parametres",
        name: "Parametres",
        path: "/configurations/parametres",
        link: "parametres",
        icon: Settings2,
        children: [
          leaf({
            id: "parametres-unite",
            name: "Unite",
            path: "/configurations/parametres/unite",
            link: "parametres-unite",
            icon: TestTube2,
            summary: "Unites de conditionnement, vente et stockage.",
            sectionLabel: "Configurations",
            parentLabel: "Parametres",
            parentPath: "/configurations/parametres",
          }),
          leaf({
            id: "parametres-tva",
            name: "TVA",
            path: "/configurations/parametres/tva",
            link: "parametres-tva",
            icon: WalletCards,
            summary: "Taux de taxe applicables selon le contexte de vente.",
            sectionLabel: "Configurations",
            parentLabel: "Parametres",
            parentPath: "/configurations/parametres",
          }),
          leaf({
            id: "parametres-devise",
            name: "Devise",
            path: "/configurations/parametres/devise",
            link: "parametres-devise",
            icon: BadgeDollarSign,
            summary: "Monnaies de travail et de valorisation du stock.",
            sectionLabel: "Configurations",
            parentLabel: "Parametres",
            parentPath: "/configurations/parametres",
          }),
          leaf({
            id: "parametres-locale-vente",
            name: "Locale de vente",
            path: "/configurations/parametres/locale-vente",
            link: "parametres-locale-vente",
            icon: Store,
            summary: "Points de vente, comptoirs et affectations commerciales.",
            sectionLabel: "Configurations",
            parentLabel: "Parametres",
            parentPath: "/configurations/parametres",
          }),
          leaf({
            id: "parametres-zone-stockage",
            name: "Zone de stockage",
            path: "/configurations/parametres/zone-stockage",
            link: "parametres-zone-stockage",
            icon: Warehouse,
            summary: "Zones, rayons et emplacements de conservation.",
            sectionLabel: "Configurations",
            parentLabel: "Parametres",
            parentPath: "/configurations/parametres",
          }),
          leaf({
            id: "parametres-niveau-validation",
            name: "Niveau de validation",
            path: "/configurations/parametres/niveau-validation",
            link: "parametres-niveau-validation",
            icon: ShieldCheck,
            summary: "Circuit d'approbation des demandes et commandes.",
            sectionLabel: "Configurations",
            parentLabel: "Parametres",
            parentPath: "/configurations/parametres",
          }),
        ],
      },
      {
        id: "utilisateur",
        name: "Utilisateur",
        path: "/configurations/utilisateur",
        link: "utilisateur",
        icon: Users,
        children: [
          leaf({
            id: "utilisateur-liste",
            name: "Liste d'utilisateurs",
            path: "/configurations/utilisateur/liste-utilisateurs",
            link: "utilisateur-liste-utilisateurs",
            icon: Users,
            summary: "Annuaire des comptes et rattachements organisationnels.",
            sectionLabel: "Configurations",
            parentLabel: "Utilisateur",
            parentPath: "/configurations/utilisateur",
          }),
          leaf({
            id: "utilisateur-creer",
            name: "Creer",
            path: "/configurations/utilisateur/creer",
            link: "utilisateur-creer",
            icon: UserPlus,
            summary: "Creation rapide des utilisateurs et invitations.",
            sectionLabel: "Configurations",
            parentLabel: "Utilisateur",
            parentPath: "/configurations/utilisateur",
          }),
          leaf({
            id: "utilisateur-roles",
            name: "Role et permission",
            path: "/configurations/utilisateur/roles-permissions",
            link: "utilisateur-roles-permissions",
            icon: FileBadge,
            summary: "Grille des roles, droits et perimetres d'acces.",
            sectionLabel: "Configurations",
            parentLabel: "Utilisateur",
            parentPath: "/configurations/utilisateur",
          }),
        ],
      },
    ],
  },
];

export const sidebarItems = sidebarSections.flatMap((section) => section.items);

export const allRouteMeta = [
  dashboardMeta,
  ...sidebarSections.flatMap((section) =>
    section.items.flatMap((item) => (item.children?.length ? item.children : [item])),
  ),
].filter((item, index, array) => array.findIndex((entry) => entry.path === item.path) === index);

let createRouteMeta = [];

const normalizePath = (path = "") =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path || "/dashboard";

export const findRouteByPath = (path) =>
  [...allRouteMeta, ...createRouteMeta].find(
    (item) => item.path === normalizePath(path),
  ) || dashboardMeta;

export const getBreadcrumbItems = (path) => {
  const route = findRouteByPath(path);
  return [{ label: "Accueil", path: "/dashboard" }, ...route.breadcrumbs];
};

const purchaseRequestColumns = [
  column("Titre", "title"),
  column("Statut", "status", { render: (row) => renderPill(row.status) }),
  column("Boutique", "store.name"),
  column("Demandeur", (row) => formatPerson(row.requestedBy)),
  column("Articles", (row) => formatCount(row.items), {
    className: "text-center",
  }),
  column("Cree le", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const purchaseOrderColumns = [
  column("Code", (row) => row.code || "--", { sortBy: "code" }),
  column("Statut", "status", { render: (row) => renderPill(row.status) }),
  column("Fournisseur", "supplier.name"),
  column("Boutique", "store.name"),
  column("Articles", (row) => formatCount(row.items), {
    className: "text-center",
  }),
  column("Date commande", (row) => formatDate(row.orderDate || row.createdAt), {
    sortBy: "orderDate",
  }),
];

const stockEntryColumns = [
  column("Source", "sourceType"),
  column("Statut", "status", { render: (row) => renderPill(row.status) }),
  column("Boutique", "store.name"),
  column("Zone", "storageZone.name"),
  column("Articles", (row) => formatCount(row.items), {
    className: "text-center",
  }),
  column("Cree par", (row) => formatPerson(row.createdBy)),
  column("Cree le", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const inventoryMovementColumns = [
  column("Type", "movementType", {
    render: (row) => renderPill(row.movementType),
  }),
  column("Source", (row) => row.sourceType || "--"),
  column("Produit", "product.name"),
  column("Boutique", (row) => row.storageZone?.store?.name || "--"),
  column("Zone", "storageZone.name"),
  column("Quantite", (row) => row.quantity || "0", { sortBy: "quantity" }),
  column("Cree par", (row) => formatPerson(row.createdBy)),
  column("Date", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const transferColumns = [
  column("Statut", "status", { render: (row) => renderPill(row.status) }),
  column("Boutique source", "fromStore.name"),
  column("Boutique cible", "toStore.name"),
  column("Zone source", "fromZone.name"),
  column("Zone cible", "toZone.name"),
  column("Articles", (row) => formatCount(row.items), {
    className: "text-center",
  }),
  column("Date", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const deliveryNoteColumns = [
  column("Code", (row) => row.code || "--", { sortBy: "code" }),
  column("Statut", "status", { render: (row) => renderPill(row.status) }),
  column("Fournisseur", "supplier.name"),
  column("Commande", (row) => row.purchaseOrder?.code || "--"),
  column("Articles", (row) => formatCount(row.items), {
    className: "text-center",
  }),
  column("Reception", (row) => formatDate(row.receivedAt || row.createdAt), {
    sortBy: "receivedAt",
  }),
];

const inventoryColumns = [
  column("Produit", "product.name"),
  column("Boutique", "store.name"),
  column("Zone", "storageZone.name"),
  column("Quantite", (row) => row.quantity || 0, { sortBy: "quantity" }),
  column("Seuil min", (row) => row.minLevel ?? 0),
  column("MAJ", (row) => formatDate(row.updatedAt), { sortBy: "updatedAt" }),
];

const orderColumns = [
  column("Statut", "status", { render: (row) => renderPill(row.status) }),
  column("Boutique", "store.name"),
  column("Client", (row) => formatPerson(row.customer)),
  column("Articles", (row) => formatCount(row.items), {
    className: "text-center",
  }),
  column("Total", (row) => formatMoney(row.total), { sortBy: "total" }),
  column("Date", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const productColumns = [
  column("Produit", "name"),
  column("SKU", (row) => row.sku || "--", { sortBy: "sku" }),
  column("Categorie", "category.name"),
  column("Famille", "family.name"),
  column("Prix", (row) => formatMoney(row.unitPrice), { sortBy: "unitPrice" }),
  column("Actif", (row) => renderPill(row.isActive ? "ACTIVE" : "INACTIVE")),
];

const articleColumns = [
  column("Reference", (row) => row.sku || row.id),
  column("Libelle", "name"),
  column("Description", (row) => row.description || "--"),
  column("Categorie", "category.name"),
  column("Famille", "family.name"),
];

const technicalColumns = [
  column("Produit", "name"),
  column("Unite vente", (row) => row.saleUnit?.name || "--"),
  column("Unite stock", (row) => row.stockUnit?.name || "--"),
  column("Unite dosage", (row) => row.dosageUnit?.name || "--"),
  column("Description", (row) => row.description || "--"),
];

const familyColumns = [
  column("Nom", "name"),
  column("Cree le", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const unitColumns = [
  column("Nom", "name"),
  column("Type", "type", { render: (row) => renderPill(row.type) }),
  column("Symbole", (row) => row.symbol || "--", { sortBy: "symbol" }),
  column("Cree le", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const storeColumns = [
  column("Nom", "name"),
  column("Code", (row) => row.code || "--", { sortBy: "code" }),
  column("Commune", (row) => row.commune || "--"),
  column("Ville", (row) => row.city || "--"),
  column("Pays", (row) => row.country || "--"),
  column("Creation", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const zoneColumns = [
  column("Nom", "name"),
  column("Code", (row) => row.code || "--", { sortBy: "code" }),
  column("Type", "zoneType", {
    render: (row) => renderPill(row.zoneType || "STANDARD"),
  }),
  column("Boutique", "store.name"),
  column("Creation", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const flowColumns = [
  column("Code", "code"),
  column("Nom", "name"),
  column("Etapes", (row) => formatCount(row.steps), {
    className: "text-center",
  }),
  column("Creation", (row) => formatDate(row.createdAt), { sortBy: "createdAt" }),
];

const userColumns = [
  column("Nom", (row) => formatPerson(row)),
  column("Role", "role", { render: (row) => renderPill(row.role) }),
  column("Email", (row) => row.email || "--"),
  column("Telephone", (row) => row.phone || "--"),
  column("Boutique", (row) => row.store?.name || row.storeName || "--"),
  column("Actif", (row) => renderPill(row.isActive ? "ACTIVE" : "INACTIVE")),
];

const approvalActions = (resourcePath) => [
  {
    id: `${resourcePath}-approve`,
    label: "Valider",
    method: "POST",
    endpoint: (row) => `${resourcePath}/${row.id}/approve`,
    visible: (row) => ["DRAFT", "SUBMITTED"].includes(row.status),
    tone: "success",
  },
  {
    id: `${resourcePath}-reject`,
    label: "Rejeter",
    method: "POST",
    endpoint: (row) => `${resourcePath}/${row.id}/reject`,
    visible: (row) => ["DRAFT", "SUBMITTED"].includes(row.status),
    tone: "danger",
  },
];

const stockEntryRowActions = [
  {
    id: "stock-entry-approve",
    label: "Valider",
    method: "POST",
    endpoint: (row) => `/api/stock-entries/${row.id}/approve`,
    visible: (row) => row.sourceType === "DIRECT" && row.status === "PENDING",
    tone: "success",
  },
  {
    id: "stock-entry-post",
    label: "Poster",
    method: "POST",
    endpoint: (row) => `/api/stock-entries/${row.id}/post`,
    visible: (row) => row.status === "APPROVED",
    tone: "primary",
  },
];

export const resourceCatalog = {
  "/commande/demande-achat": createResource({
    endpoint: "/api/purchase-requests",
    columns: purchaseRequestColumns,
    rowActions: [],
    tableTitle: "Demandes d'achat",
    tableDescription:
      "Demandes d'achat emises par les boutiques et services.",
    emptyMessage: "Aucune demande d'achat enregistree.",
  }),
  "/commande/requisitions": createResource({
    endpoint: "/api/supply-requests",
    columns: purchaseRequestColumns,
    rowActions: [],
    tableTitle: "Requisitions",
    tableDescription: "Demandes internes de stock et d'approvisionnement.",
    emptyMessage: "Aucune requisition disponible.",
  }),
  "/commande/commande": createResource({
    endpoint: "/api/purchase-orders",
    defaultQuery: { status: "DRAFT" },
    columns: purchaseOrderColumns,
    rowActions: [],
    tableTitle: "Commandes en preparation",
    tableDescription:
      "Commandes fournisseur en cours de construction ou validation.",
    emptyMessage: "Aucune commande en brouillon.",
  }),
  "/commande/liste-commande": createResource({
    endpoint: "/api/purchase-orders",
    columns: purchaseOrderColumns,
    rowActions: [],
    tableTitle: "Liste de commande",
    tableDescription: "Journal complet des commandes fournisseur.",
    emptyMessage: "Aucune commande disponible.",
  }),
  "/mouvement/entree-stock": createResource({
    endpoint: "/api/stock-entries",
    columns: stockEntryColumns,
    rowActions: [],
    tableTitle: "Entrees de stock",
    tableDescription:
      "Receptions et integrations au stock central et boutique.",
    emptyMessage: "Aucune entree de stock trouvee.",
  }),
  "/mouvement/sortie-stock": createResource({
    endpoint: "/api/inventory-movements",
    defaultQuery: { movementType: "OUT" },
    columns: inventoryMovementColumns,
    tableTitle: "Sorties de stock",
    tableDescription: "Mouvements de sortie identifies dans l'inventaire.",
    emptyMessage: "Aucune sortie de stock tracee.",
  }),
  "/mouvement/retour-stock": createResource({
    endpoint: "/api/inventory-movements",
    defaultQuery: { movementType: "ADJUSTMENT" },
    columns: inventoryMovementColumns,
    tableTitle: "Retours de stock",
    tableDescription:
      "Ajustements et retours internes reperes dans l'inventaire.",
    emptyMessage: "Aucun retour de stock disponible.",
  }),
  "/mouvement/transfert": createResource({
    endpoint: "/api/transfers",
    columns: transferColumns,
    rowActions: [
      {
        id: "transfer-complete",
        label: "Finaliser",
        method: "POST",
        endpoint: (row) => `/api/transfers/${row.id}/complete`,
        visible: (row) => row.status !== "COMPLETED" && row.status !== "CANCELED",
        tone: "primary",
      },
    ],
    tableTitle: "Transferts",
    tableDescription: "Transferts inter-boutiques et inter-zones.",
    emptyMessage: "Aucun transfert enregistre.",
  }),
  "/mouvement/retour-fournisseur": createResource({
    columns: [
      column("Reference", "reference"),
      column("Fournisseur", "supplier"),
      column("Statut", "status", { render: (row) => renderPill(row.status) }),
      column("Date", (row) => formatDate(row.createdAt)),
    ],
    staticRows: [],
    searchEnabled: false,
    tableTitle: "Retours fournisseur",
    tableDescription:
      "Aucune ressource serveur dediee n'est encore exposee pour ce module.",
    emptyMessage: "Aucun retour fournisseur disponible pour le moment.",
    description:
      "Cette page est prete mais attend encore l'API metier de retour fournisseur.",
  }),
  "/mouvement/historique-mouvements": createResource({
    endpoint: "/api/inventory-movements",
    columns: inventoryMovementColumns,
    tableTitle: "Historique de mouvements",
    tableDescription:
      "Historique des mouvements d'inventaire remontes par le serveur.",
    emptyMessage: "Aucun mouvement d'inventaire trace.",
  }),
  "/etat-stock": createResource({
    endpoint: "/api/inventory",
    columns: inventoryColumns,
    tableTitle: "Etat de stock",
    tableDescription:
      "Niveaux de stock actuels par produit, boutique et zone.",
    emptyMessage: "Aucune ligne d'inventaire disponible.",
  }),
  "/etat-consommation": createResource({
    endpoint: "/api/orders",
    defaultQuery: { status: "PAID" },
    columns: orderColumns,
    tableTitle: "Etat de consommation",
    tableDescription: "Lecture des ventes payees comme signal de consommation.",
    emptyMessage: "Aucune vente payee disponible.",
  }),
  "/inventaire/inventaire": createResource({
    endpoint: "/api/inventory",
    columns: inventoryColumns,
    tableTitle: "Inventaire",
    tableDescription: "Stock physique consolide par produit et zone.",
    emptyMessage: "Aucune donnee d'inventaire disponible.",
  }),
  "/inventaire/etat-inventaire": createResource({
    endpoint: "/api/inventory-movements",
    defaultQuery: { movementType: "ADJUSTMENT" },
    columns: inventoryMovementColumns,
    tableTitle: "Etat d'inventaire",
    tableDescription:
      "Mouvements d'ajustement lies aux inventaires et corrections.",
    emptyMessage: "Aucun ajustement d'inventaire disponible.",
  }),
  "/configurations/articles/produits": createResource({
    endpoint: "/api/products",
    columns: productColumns,
    tableTitle: "Produits",
    tableDescription: "Catalogue principal des produits stockes.",
    emptyMessage: "Aucun produit disponible.",
  }),
  "/configurations/articles/articles": createResource({
    endpoint: "/api/products",
    columns: articleColumns,
    tableTitle: "Articles",
    tableDescription: "Referentiel des articles et references internes.",
    emptyMessage: "Aucun article disponible.",
  }),
  "/configurations/articles/familles": createResource({
    endpoint: "/api/product-families",
    columns: familyColumns,
    tableTitle: "Familles",
    tableDescription: "Familles d'articles definies dans le tenant.",
    emptyMessage: "Aucune famille disponible.",
  }),
  "/configurations/articles/sous-familles": createResource({
    endpoint: "/api/product-families",
    columns: familyColumns,
    tableTitle: "Sous-familles",
    tableDescription:
      "En attente d'un modele distinct; cette vue reutilise les familles existantes.",
    emptyMessage: "Aucune sous-famille disponible.",
  }),
  "/configurations/articles/produits-vente": createResource({
    endpoint: "/api/products",
    defaultQuery: { isActive: true },
    columns: productColumns,
    tableTitle: "Produits de vente",
    tableDescription:
      "Produits actifs exposes aux boutiques et a la caisse.",
    emptyMessage: "Aucun produit de vente disponible.",
  }),
  "/configurations/articles/fiche-technique": createResource({
    endpoint: "/api/products",
    columns: technicalColumns,
    tableTitle: "Fiches techniques",
    tableDescription: "Informations techniques disponibles par produit.",
    emptyMessage: "Aucune fiche technique disponible.",
  }),
  "/configurations/articles/categorie": createResource({
    endpoint: "/api/product-categories",
    columns: familyColumns,
    tableTitle: "Categories",
    tableDescription: "Categories produits definies dans le tenant.",
    emptyMessage: "Aucune categorie disponible.",
  }),
  "/configurations/parametres/unite": createResource({
    endpoint: "/api/units",
    columns: unitColumns,
    tableTitle: "Unites",
    tableDescription: "Unites de mesure, vente et stockage.",
    emptyMessage: "Aucune unite disponible.",
  }),
  "/configurations/parametres/tva": createResource({
    columns: [
      column("Code", "code"),
      column("Taux", "rate"),
      column("Statut", "status", { render: (row) => renderPill(row.status) }),
    ],
    staticRows: [],
    searchEnabled: false,
    tableTitle: "TVA",
    tableDescription:
      "Aucune ressource serveur dediee n'est encore exposee pour les taux de TVA.",
    emptyMessage: "Aucune TVA configuree via API.",
    description: "Cette vue est prete pour recevoir la future ressource TVA.",
  }),
  "/configurations/parametres/devise": createResource({
    columns: [
      column("Code", "code"),
      column("Libelle", "label"),
      column("Defaut", (row) => renderPill(formatBoolean(row.default))),
    ],
    staticRows: [
      { id: "usd", code: "USD", label: "Dollar americain", default: true },
      { id: "cdf", code: "CDF", label: "Franc congolais", default: false },
    ],
    searchEnabled: false,
    tableTitle: "Devises",
    tableDescription:
      "Table technique locale en attendant une ressource serveur dediee.",
    emptyMessage: "Aucune devise disponible.",
  }),
  "/configurations/parametres/locale-vente": createResource({
    endpoint: "/api/stores",
    columns: storeColumns,
    tableTitle: "Locales de vente",
    tableDescription: "Boutiques et points de vente connus du tenant.",
    emptyMessage: "Aucune boutique disponible.",
  }),
  "/configurations/parametres/zone-stockage": createResource({
    endpoint: "/api/storage-zones",
    columns: zoneColumns,
    tableTitle: "Zones de stockage",
    tableDescription: "Zones et emplacements de stockage par boutique.",
    emptyMessage: "Aucune zone de stockage disponible.",
  }),
  "/configurations/parametres/niveau-validation": createResource({
    endpoint: "/api/approval-flows",
    columns: flowColumns,
    tableTitle: "Niveaux de validation",
    tableDescription: "Circuits de validation definis pour les workflows.",
    emptyMessage: "Aucun flow de validation disponible.",
  }),
  "/configurations/utilisateur/liste-utilisateurs": createResource({
    endpoint: "/api/users",
    columns: userColumns,
    tableTitle: "Liste d'utilisateurs",
    tableDescription: "Comptes utilisateur actuellement enregistres.",
    emptyMessage: "Aucun utilisateur disponible.",
  }),
  "/configurations/utilisateur/creer": createResource({
    endpoint: "/api/users",
    columns: userColumns,
    tableTitle: "Preparation creation utilisateur",
    tableDescription:
      "Vue des utilisateurs existants avant creation de nouveaux comptes.",
    emptyMessage: "Aucun utilisateur disponible.",
  }),
  "/configurations/utilisateur/roles-permissions": createResource({
    endpoint: "/api/users",
    columns: userColumns,
    tableTitle: "Roles et permissions",
    tableDescription:
      "Lecture des comptes par role; la gestion fine des permissions peut ensuite etre branchee.",
    emptyMessage: "Aucun utilisateur disponible.",
  }),
};

const sourceOptions = [
  { value: "DIRECT", label: "Direct" },
  { value: "PURCHASE_ORDER", label: "Commande fournisseur" },
  { value: "TRANSFER", label: "Transfert" },
];

const unitTypeOptions = [
  { value: "SALE", label: "Vente" },
  { value: "STOCK", label: "Stock" },
  { value: "DOSAGE", label: "Dosage" },
];

const zoneTypeOptions = [
  { value: "WAREHOUSE", label: "Depot" },
  { value: "STORE", label: "Boutique" },
  { value: "COUNTER", label: "Comptoir" },
];

const userRoleOptions = [
  { value: "SUPERADMIN", label: "Superadmin" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "Utilisateur" },
];

const sendViaOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const productLabel = (item) =>
  [item?.name, item?.sku ? `(${item.sku})` : null].filter(Boolean).join(" ");

const unitLabel = (item) =>
  [item?.name, item?.symbol ? `(${item.symbol})` : null].filter(Boolean).join(" ");

const zoneLabel = (item) =>
  [item?.name, item?.store?.name ? `- ${item.store.name}` : null]
    .filter(Boolean)
    .join(" ");

const productLineFields = (extraFields = []) => [
  {
    name: "productId",
    label: "Produit",
    type: "select",
    required: true,
    optionsEndpoint: "/api/products",
    optionValue: "id",
    optionLabel: productLabel,
  },
  {
    name: "unitId",
    label: "Unite",
    type: "select",
    required: true,
    optionsEndpoint: "/api/units",
    optionValue: "id",
    optionLabel: unitLabel,
  },
  {
    name: "quantity",
    label: "Quantite",
    type: "number",
    required: true,
    min: "0.01",
    step: "0.01",
  },
  ...extraFields,
];

const inventoryLineFields = () => [
  {
    name: "productId",
    label: "Produit",
    type: "select",
    required: true,
    optionsEndpoint: "/api/products",
    optionValue: "id",
    optionLabel: productLabel,
  },
  {
    name: "quantity",
    label: "Quantite",
    type: "number",
    required: true,
    min: "0.01",
    step: "0.01",
  },
  {
    name: "note",
    label: "Note ligne",
    type: "text",
    placeholder: "Optionnel",
  },
];

const buildDocumentItems = (items, extras) =>
  mapItems(items, (item) => {
    const quantity = numericValue(item.quantity);
    if (!item.productId || quantity === undefined) return null;

    return {
      productId: item.productId,
      unitId: compactValue(item.unitId),
      quantity,
      ...extras(item),
    };
  });

const buildInventoryAdjustmentRequests = (values, mode) =>
  mapItems(values.items, (item) => {
    const quantity = numericValue(item.quantity);
    if (!values.storageZoneId || !item.productId || quantity === undefined) return null;

    return {
      endpoint: "/api/inventory/adjust",
      method: "POST",
      body: {
        storageZoneId: values.storageZoneId,
        productId: item.productId,
        quantity,
        mode,
        note: compactValue(item.note || values.note),
      },
    };
  });

const purchaseRequestForm = {
  title: "Nouvelle demande d'achat",
  description: "Prepare une demande d'achat avec plusieurs lignes produits.",
  endpoint: "/api/purchase-requests",
  submitLabel: "Creer la demande",
  successMessage: "Demande d'achat creee.",
  fields: [
    {
      name: "title",
      label: "Titre",
      type: "text",
      required: true,
      placeholder: "Ex. Reassort antibiotiques",
    },
    {
      name: "storeId",
      label: "Boutique",
      type: "select",
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Informations complementaires",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Lignes de demande",
      addLabel: "Ajouter une ligne",
      minRows: 1,
      fields: productLineFields([
        {
          name: "note",
          label: "Note ligne",
          type: "text",
          placeholder: "Optionnel",
        },
      ]),
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/purchase-requests",
    method: "POST",
    body: {
      title: values.title,
      storeId: compactValue(values.storeId),
      note: compactValue(values.note),
      items: buildDocumentItems(values.items, (item) => ({
        note: compactValue(item.note),
      })),
    },
  }),
};

const supplyRequestForm = {
  title: "Nouvelle requisition",
  description: "Cree une requisition de stock destinee a une boutique.",
  endpoint: "/api/supply-requests",
  submitLabel: "Creer la requisition",
  successMessage: "Requisition creee.",
  fields: [
    {
      name: "title",
      label: "Titre",
      type: "text",
      required: true,
      placeholder: "Ex. Requisition mensuelle",
    },
    {
      name: "storeId",
      label: "Boutique",
      type: "select",
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "storageZoneId",
      label: "Zone cible",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Informations complementaires",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Produits demandes",
      addLabel: "Ajouter un produit",
      minRows: 1,
      fields: productLineFields([
        {
          name: "note",
          label: "Note ligne",
          type: "text",
          placeholder: "Optionnel",
        },
      ]),
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/supply-requests",
    method: "POST",
    body: {
      title: values.title,
      storeId: compactValue(values.storeId),
      storageZoneId: compactValue(values.storageZoneId),
      note: compactValue(values.note),
      items: buildDocumentItems(values.items, (item) => ({
        note: compactValue(item.note),
      })),
    },
  }),
};

const purchaseOrderForm = {
  title: "Nouvelle commande fournisseur",
  description: "Construit une commande d'achat liee a un fournisseur.",
  endpoint: "/api/purchase-orders",
  submitLabel: "Creer la commande",
  successMessage: "Commande creee.",
  fields: [
    {
      name: "storeId",
      label: "Boutique",
      type: "select",
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "supplierId",
      label: "Fournisseur",
      type: "select",
      required: true,
      optionsEndpoint: "/api/suppliers",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "purchaseRequestId",
      label: "Demande d'achat source",
      type: "select",
      optionsEndpoint: "/api/purchase-requests",
      query: { status: "APPROVED" },
      optionValue: "id",
      optionLabel: "title",
    },
    {
      name: "code",
      label: "Code commande",
      type: "text",
      placeholder: "Ex. PO-2026-001",
    },
    {
      name: "orderDate",
      label: "Date commande",
      type: "date",
    },
    {
      name: "expectedDate",
      label: "Date attendue",
      type: "date",
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Instructions fournisseur",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Articles commandes",
      addLabel: "Ajouter un article",
      minRows: 1,
      fields: productLineFields([
        {
          name: "unitPrice",
          label: "Prix unitaire",
          type: "number",
          required: true,
          min: "0",
          step: "0.01",
        },
      ]),
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/purchase-orders",
    method: "POST",
    body: {
      storeId: compactValue(values.storeId),
      supplierId: values.supplierId,
      purchaseRequestId: compactValue(values.purchaseRequestId),
      code: compactValue(values.code),
      orderDate: compactValue(values.orderDate),
      expectedDate: compactValue(values.expectedDate),
      note: compactValue(values.note),
      items: buildDocumentItems(values.items, (item) => ({
        unitPrice: numericValue(item.unitPrice) ?? 0,
      })),
    },
  }),
};

const stockEntryForm = {
  title: "Nouvelle entree de stock",
  description: "Enregistre une reception ou une integration manuelle de stock.",
  endpoint: "/api/stock-entries",
  submitLabel: "Creer l'entree",
  successMessage: "Entree de stock creee.",
  fields: [
    {
      name: "sourceType",
      label: "Source",
      type: "select",
      required: true,
      options: [
        { value: "PURCHASE_ORDER", label: "Commande validee" },
        { value: "DIRECT", label: "Entree directe" },
      ],
      initialValue: "PURCHASE_ORDER",
    },
    {
      name: "sourceId",
      label: "Commande source",
      type: "select",
      optionsEndpoint: "/api/purchase-orders",
      query: { status: "SENT" },
      optionValue: "id",
      optionLabel: (item) => item.code || item.id,
    },
    {
      name: "receiptNumber",
      label: "Numero de bon de reception",
      type: "text",
      placeholder: "Ex. BR-2026-001",
    },
    {
      name: "storeId",
      label: "Boutique",
      type: "select",
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "storageZoneId",
      label: "Zone de stockage",
      type: "select",
      required: true,
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Commentaire de reception",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Articles recus",
      addLabel: "Ajouter un article",
      minRows: 1,
      fields: productLineFields([
        {
          name: "unitCost",
          label: "Cout unitaire",
          type: "number",
          min: "0",
          step: "0.01",
        },
      ]),
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/stock-entries",
    method: "POST",
    body: {
      sourceType: values.sourceType,
      sourceId: compactValue(values.sourceId),
      receiptNumber: compactValue(values.receiptNumber),
      operationType: "IN",
      storeId: compactValue(values.storeId),
      storageZoneId: values.storageZoneId,
      note: compactValue(values.note),
      items: buildDocumentItems(values.items, (item) => ({
        unitCost: numericValue(item.unitCost),
      })),
    },
  }),
};

const stockOutputForm = {
  title: "Nouvelle sortie de stock",
  description:
    "Cree une sortie depuis une requisition validee ou une sortie directe a valider par un superadmin.",
  submitLabel: "Enregistrer la sortie",
  successMessage: "Sortie de stock enregistree.",
  fields: [
    {
      name: "mode",
      label: "Mode de sortie",
      type: "select",
      required: true,
      options: [
        { value: "REQUISITION", label: "Depuis une requisition validee" },
        { value: "DIRECT", label: "Sortie directe" },
      ],
      initialValue: "REQUISITION",
    },
    {
      name: "supplyRequestId",
      label: "Requisition validee",
      type: "select",
      optionsEndpoint: "/api/supply-requests",
      query: { status: "APPROVED" },
      optionValue: "id",
      optionLabel: "title",
    },
    {
      name: "fromZoneId",
      label: "Zone source requisition",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "toZoneId",
      label: "Zone cible requisition",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "storageZoneId",
      label: "Zone de sortie directe",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "note",
      label: "Note globale",
      type: "textarea",
      placeholder: "Motif de sortie",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Lignes de sortie",
      addLabel: "Ajouter une ligne",
      minRows: 1,
      fields: inventoryLineFields(),
    },
  ],
  buildRequests: (values) => {
    if (values.mode === "DIRECT") {
      return [
        {
          endpoint: "/api/stock-entries",
          method: "POST",
          body: {
            sourceType: "DIRECT",
            operationType: "OUT",
            storageZoneId: values.storageZoneId,
            note: compactValue(values.note),
            items: buildDocumentItems(values.items, () => ({})),
          },
        },
      ];
    }

    const transferItems = buildDocumentItems(values.items, () => ({}));

    return values.supplyRequestId
      ? [
          {
            endpoint: `/api/supply-requests/${values.supplyRequestId}/transfer`,
            method: "POST",
            body: {
              fromZoneId: compactValue(values.fromZoneId),
              toZoneId: compactValue(values.toZoneId),
              note: compactValue(values.note),
              items: transferItems,
            },
          },
        ]
      : [];
  },
};

const stockReturnForm = {
  title: "Nouveau retour de stock",
  description: "Reintegre des produits dans une zone de stockage.",
  submitLabel: "Enregistrer le retour",
  successMessage: "Retour de stock enregistre.",
  fields: [
    {
      name: "storageZoneId",
      label: "Zone de stockage",
      type: "select",
      required: true,
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "note",
      label: "Note globale",
      type: "textarea",
      placeholder: "Motif du retour",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Produits retournes",
      addLabel: "Ajouter un produit",
      minRows: 1,
      fields: inventoryLineFields(),
    },
  ],
  buildRequests: (values) => buildInventoryAdjustmentRequests(values, "INCREMENT"),
};

const transferForm = {
  title: "Nouveau transfert",
  description: "Prepare un transfert entre deux boutiques ou deux zones.",
  endpoint: "/api/transfers",
  submitLabel: "Creer le transfert",
  successMessage: "Transfert cree.",
  fields: [
    {
      name: "fromStoreId",
      label: "Boutique source",
      type: "select",
      required: true,
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "toStoreId",
      label: "Boutique cible",
      type: "select",
      required: true,
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "fromZoneId",
      label: "Zone source",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "toZoneId",
      label: "Zone cible",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Instruction logistique",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Produits a transferer",
      addLabel: "Ajouter un produit",
      minRows: 1,
      fields: productLineFields(),
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/transfers",
    method: "POST",
    body: {
      fromStoreId: values.fromStoreId,
      toStoreId: values.toStoreId,
      fromZoneId: compactValue(values.fromZoneId),
      toZoneId: compactValue(values.toZoneId),
      note: compactValue(values.note),
      items: buildDocumentItems(values.items, () => ({})),
    },
  }),
};

const supplierReturnForm = {
  title: "Nouveau retour fournisseur",
  description: "Formulaire pret pour le module de retour fournisseur.",
  submitLabel: "Creation indisponible",
  unavailableMessage:
    "L'API de retour fournisseur n'est pas encore exposee par le serveur.",
  fields: [
    {
      name: "reference",
      label: "Reference",
      type: "text",
      required: true,
      placeholder: "Ex. RF-2026-001",
    },
    {
      name: "supplierId",
      label: "Fournisseur",
      type: "select",
      optionsEndpoint: "/api/suppliers",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      placeholder: "Motif du retour",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Produits retournes",
      addLabel: "Ajouter un produit",
      minRows: 1,
      fields: productLineFields([
        {
          name: "reason",
          label: "Motif",
          type: "text",
          placeholder: "Lot defectueux, casse, etc.",
        },
      ]),
    },
  ],
};

const inventoryForm = {
  title: "Nouvel ajustement d'inventaire",
  description: "Fixe ou corrige le stock theorique d'une zone.",
  submitLabel: "Enregistrer l'ajustement",
  successMessage: "Ajustement d'inventaire enregistre.",
  fields: [
    {
      name: "storageZoneId",
      label: "Zone de stockage",
      type: "select",
      required: true,
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    {
      name: "note",
      label: "Note globale",
      type: "textarea",
      placeholder: "Commentaire d'inventaire",
    },
  ],
  repeaters: [
    {
      name: "items",
      label: "Lignes d'inventaire",
      addLabel: "Ajouter une ligne",
      minRows: 1,
      fields: inventoryLineFields(),
    },
  ],
  buildRequests: (values) => buildInventoryAdjustmentRequests(values, "SET"),
};

const productForm = {
  title: "Nouveau produit",
  description: "Ajoute un produit au catalogue principal.",
  endpoint: "/api/products",
  submitLabel: "Creer le produit",
  successMessage: "Produit cree.",
  fields: [
    {
      name: "name",
      label: "Nom du produit",
      type: "text",
      required: true,
      placeholder: "Ex. Paracetamol 500mg",
    },
    {
      name: "sku",
      label: "SKU",
      type: "text",
      placeholder: "Ex. ART-0001",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Forme, dosage, indication",
    },
    {
      name: "unitPrice",
      label: "Prix unitaire",
      type: "number",
      required: true,
      min: "0",
      step: "0.01",
    },
    {
      name: "categoryId",
      label: "Categorie",
      type: "select",
      optionsEndpoint: "/api/product-categories",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "familyId",
      label: "Famille",
      type: "select",
      optionsEndpoint: "/api/product-families",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "saleUnitId",
      label: "Unite de vente",
      type: "select",
      optionsEndpoint: "/api/units",
      optionValue: "id",
      optionLabel: unitLabel,
      query: { type: "SALE" },
    },
    {
      name: "stockUnitId",
      label: "Unite de stock",
      type: "select",
      optionsEndpoint: "/api/units",
      optionValue: "id",
      optionLabel: unitLabel,
      query: { type: "STOCK" },
    },
    {
      name: "dosageUnitId",
      label: "Unite de dosage",
      type: "select",
      optionsEndpoint: "/api/units",
      optionValue: "id",
      optionLabel: unitLabel,
      query: { type: "DOSAGE" },
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/products",
    method: "POST",
    body: {
      name: values.name,
      sku: compactValue(values.sku),
      description: compactValue(values.description),
      unitPrice: numericValue(values.unitPrice) ?? 0,
      categoryId: compactValue(values.categoryId),
      familyId: compactValue(values.familyId),
      saleUnitId: compactValue(values.saleUnitId),
      stockUnitId: compactValue(values.stockUnitId),
      dosageUnitId: compactValue(values.dosageUnitId),
    },
  }),
};

const simpleNameForm = (title, description, endpoint, submitLabel, successMessage) => ({
  title,
  description,
  endpoint,
  submitLabel,
  successMessage,
  fields: [
    {
      name: "name",
      label: "Nom",
      type: "text",
      required: true,
      placeholder: "Nom",
    },
  ],
  buildRequest: (values) => ({
    endpoint,
    method: "POST",
    body: { name: values.name },
  }),
});

const unitForm = {
  title: "Nouvelle unite",
  description: "Ajoute une unite de mesure ou de vente.",
  endpoint: "/api/units",
  submitLabel: "Creer l'unite",
  successMessage: "Unite creee.",
  fields: [
    {
      name: "name",
      label: "Nom",
      type: "text",
      required: true,
      placeholder: "Ex. Boite",
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: unitTypeOptions,
      initialValue: "SALE",
    },
    {
      name: "symbol",
      label: "Symbole",
      type: "text",
      placeholder: "Ex. bx",
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/units",
    method: "POST",
    body: {
      name: values.name,
      type: values.type,
      symbol: compactValue(values.symbol),
    },
  }),
};

const storeForm = {
  title: "Nouvelle boutique",
  description: "Ajoute un point de vente ou une boutique.",
  endpoint: "/api/stores",
  submitLabel: "Creer la boutique",
  successMessage: "Boutique creee.",
  fields: [
    { name: "name", label: "Nom", type: "text", required: true, placeholder: "Ex. Pharma Centre" },
    { name: "code", label: "Code", type: "text", placeholder: "Ex. PC001" },
    { name: "addressLine", label: "Adresse", type: "text", placeholder: "Adresse complete" },
    { name: "commune", label: "Commune", type: "text", placeholder: "Commune" },
    { name: "city", label: "Ville", type: "text", placeholder: "Ville" },
    { name: "country", label: "Pays", type: "text", placeholder: "Pays" },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/stores",
    method: "POST",
    body: {
      name: values.name,
      code: compactValue(values.code),
      addressLine: compactValue(values.addressLine),
      commune: compactValue(values.commune),
      city: compactValue(values.city),
      country: compactValue(values.country),
    },
  }),
};

const zoneForm = {
  title: "Nouvelle zone de stockage",
  description: "Ajoute une zone physique rattachee a une boutique.",
  endpoint: "/api/storage-zones",
  submitLabel: "Creer la zone",
  successMessage: "Zone creee.",
  fields: [
    { name: "name", label: "Nom", type: "text", required: true, placeholder: "Ex. Depot principal" },
    { name: "code", label: "Code", type: "text", placeholder: "Ex. DEPOT-01" },
    {
      name: "storeId",
      label: "Boutique",
      type: "select",
      required: true,
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "zoneType",
      label: "Type de zone",
      type: "select",
      options: zoneTypeOptions,
      initialValue: "STORE",
    },
    { name: "note", label: "Note", type: "textarea", placeholder: "Commentaire optionnel" },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/storage-zones",
    method: "POST",
    body: {
      name: values.name,
      code: compactValue(values.code),
      storeId: values.storeId,
      zoneType: compactValue(values.zoneType),
      note: compactValue(values.note),
    },
  }),
};

const approvalFlowForm = {
  title: "Nouveau niveau de validation",
  description: "Definit un circuit d'approbation et ses etapes.",
  endpoint: "/api/approval-flows",
  submitLabel: "Creer le flow",
  successMessage: "Flow de validation cree.",
  fields: [
    { name: "code", label: "Code", type: "text", required: true, placeholder: "Ex. SUPPLY_REQUEST" },
    { name: "name", label: "Nom", type: "text", required: true, placeholder: "Ex. Validation requisition" },
  ],
  repeaters: [
    {
      name: "steps",
      label: "Etapes",
      addLabel: "Ajouter une etape",
      minRows: 1,
      createRow: (index) => ({
        stepOrder: String(index + 1),
        approverRole: "ADMIN",
        approverUserId: "",
      }),
      fields: [
        { name: "stepOrder", label: "Ordre", type: "number", required: true, min: "1", step: "1" },
        { name: "approverRole", label: "Role approbateur", type: "select", options: userRoleOptions, initialValue: "ADMIN" },
        {
          name: "approverUserId",
          label: "Utilisateur specifique",
          type: "select",
          optionsEndpoint: "/api/users",
          optionValue: "id",
          optionLabel: (item) => formatPerson(item),
        },
      ],
    },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/approval-flows",
    method: "POST",
    body: {
      code: values.code,
      name: values.name,
      steps: mapItems(values.steps, (step) => ({
        stepOrder: numericValue(step.stepOrder) ?? 1,
        approverRole: compactValue(step.approverRole),
        approverUserId: compactValue(step.approverUserId),
      })),
    },
  }),
};

const userForm = {
  title: "Nouvel utilisateur",
  description: "Cree un compte utilisateur et envoie un mot de passe temporaire.",
  endpoint: "/api/users",
  submitLabel: "Creer l'utilisateur",
  successMessage: "Utilisateur cree.",
  fields: [
    { name: "email", label: "Email", type: "email", placeholder: "utilisateur@exemple.com" },
    { name: "phone", label: "Telephone", type: "tel", placeholder: "+243..." },
    { name: "firstName", label: "Prenom", type: "text", placeholder: "Prenom" },
    { name: "lastName", label: "Nom", type: "text", placeholder: "Nom" },
    { name: "role", label: "Role", type: "select", options: userRoleOptions, initialValue: "USER" },
    {
      name: "storeId",
      label: "Boutique",
      type: "select",
      optionsEndpoint: "/api/stores",
      optionValue: "id",
      optionLabel: "name",
    },
    {
      name: "defaultStorageZoneId",
      label: "Zone par defaut",
      type: "select",
      optionsEndpoint: "/api/storage-zones",
      optionValue: "id",
      optionLabel: zoneLabel,
    },
    { name: "sendVia", label: "Envoi mot de passe", type: "select", options: sendViaOptions, initialValue: "email" },
  ],
  buildRequest: (values) => ({
    endpoint: "/api/users",
    method: "POST",
    body: {
      email: compactValue(values.email),
      phone: compactValue(values.phone),
      firstName: compactValue(values.firstName),
      lastName: compactValue(values.lastName),
      role: compactValue(values.role),
      storeId: compactValue(values.storeId),
      defaultStorageZoneId: compactValue(values.defaultStorageZoneId),
      sendVia: compactValue(values.sendVia),
    },
  }),
};

const tvaForm = {
  title: "Nouvelle TVA",
  description: "Page de creation prete en attente de l'API TVA.",
  submitLabel: "Creation indisponible",
  unavailableMessage: "L'API TVA n'est pas encore disponible.",
  fields: [
    { name: "code", label: "Code", type: "text", required: true, placeholder: "Ex. TVA16" },
    { name: "rate", label: "Taux", type: "number", required: true, min: "0", step: "0.01" },
  ],
};

const currencyForm = {
  title: "Nouvelle devise",
  description: "Page de creation prete en attente de l'API devise.",
  submitLabel: "Creation indisponible",
  unavailableMessage: "L'API devise n'est pas encore disponible.",
  fields: [
    { name: "code", label: "Code", type: "text", required: true, placeholder: "Ex. USD" },
    { name: "label", label: "Libelle", type: "text", required: true, placeholder: "Ex. Dollar americain" },
  ],
};

const rolePermissionForm = {
  title: "Nouveau role ou jeu de permissions",
  description: "Page prete en attente de l'API roles et permissions.",
  submitLabel: "Creation indisponible",
  unavailableMessage:
    "La gestion serveur des roles et permissions n'est pas encore disponible.",
  fields: [
    {
      name: "name",
      label: "Nom",
      type: "text",
      required: true,
      placeholder: "Ex. Pharmacien chef",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Perimetre fonctionnel du role",
    },
  ],
};

export const createCatalog = {
  "/commande/demande-achat": createForm({ createPath: "/commande/demande-achat/nouveau", ...purchaseRequestForm }),
  "/commande/requisitions": createForm({ createPath: "/commande/requisitions/nouveau", ...supplyRequestForm }),
  "/commande/commande": createForm({ createPath: "/commande/commande/nouveau", ...purchaseOrderForm }),
  "/commande/liste-commande": createForm({
    createPath: "/commande/liste-commande/nouveau",
    ...purchaseOrderForm,
    title: "Nouvelle commande",
  }),
  "/mouvement/entree-stock": createForm({ createPath: "/mouvement/entree-stock/nouveau", ...stockEntryForm }),
  "/mouvement/sortie-stock": createForm({ createPath: "/mouvement/sortie-stock/nouveau", ...stockOutputForm }),
  "/mouvement/retour-stock": createForm({ createPath: "/mouvement/retour-stock/nouveau", ...stockReturnForm }),
  "/mouvement/transfert": createForm({ createPath: "/mouvement/transfert/nouveau", ...transferForm }),
  "/mouvement/retour-fournisseur": createForm({ createPath: "/mouvement/retour-fournisseur/nouveau", ...supplierReturnForm }),
  "/etat-stock": createForm({
    createPath: "/etat-stock/nouveau",
    ...inventoryForm,
    title: "Nouvel ajustement de stock",
  }),
  "/inventaire/inventaire": createForm({ createPath: "/inventaire/inventaire/nouveau", ...inventoryForm }),
  "/inventaire/etat-inventaire": createForm({
    createPath: "/inventaire/etat-inventaire/nouveau",
    ...inventoryForm,
    title: "Nouvel ajustement d'etat d'inventaire",
  }),
  "/configurations/articles/produits": createForm({ createPath: "/configurations/articles/produits/nouveau", ...productForm }),
  "/configurations/articles/articles": createForm({
    createPath: "/configurations/articles/articles/nouveau",
    ...productForm,
    title: "Nouvel article",
  }),
  "/configurations/articles/familles": createForm({
    createPath: "/configurations/articles/familles/nouveau",
    ...simpleNameForm("Nouvelle famille", "Ajoute une famille d'articles.", "/api/product-families", "Creer la famille", "Famille creee."),
  }),
  "/configurations/articles/sous-familles": createForm({
    createPath: "/configurations/articles/sous-familles/nouveau",
    ...simpleNameForm("Nouvelle sous-famille", "Ajoute une sous-famille d'articles.", "/api/product-families", "Creer la sous-famille", "Sous-famille creee."),
  }),
  "/configurations/articles/produits-vente": createForm({
    createPath: "/configurations/articles/produits-vente/nouveau",
    ...productForm,
    title: "Nouveau produit de vente",
  }),
  "/configurations/articles/fiche-technique": createForm({
    createPath: "/configurations/articles/fiche-technique/nouveau",
    ...productForm,
    title: "Nouvelle fiche produit",
  }),
  "/configurations/articles/categorie": createForm({
    createPath: "/configurations/articles/categorie/nouveau",
    ...simpleNameForm("Nouvelle categorie", "Ajoute une categorie de produits.", "/api/product-categories", "Creer la categorie", "Categorie creee."),
  }),
  "/configurations/parametres/unite": createForm({ createPath: "/configurations/parametres/unite/nouveau", ...unitForm }),
  "/configurations/parametres/tva": createForm({ createPath: "/configurations/parametres/tva/nouveau", ...tvaForm }),
  "/configurations/parametres/devise": createForm({ createPath: "/configurations/parametres/devise/nouveau", ...currencyForm }),
  "/configurations/parametres/locale-vente": createForm({ createPath: "/configurations/parametres/locale-vente/nouveau", ...storeForm }),
  "/configurations/parametres/zone-stockage": createForm({ createPath: "/configurations/parametres/zone-stockage/nouveau", ...zoneForm }),
  "/configurations/parametres/niveau-validation": createForm({
    createPath: "/configurations/parametres/niveau-validation/nouveau",
    ...approvalFlowForm,
  }),
  "/configurations/utilisateur/liste-utilisateurs": createForm({
    createPath: "/configurations/utilisateur/liste-utilisateurs/nouveau",
    ...userForm,
  }),
  "/configurations/utilisateur/creer": createForm({
    createPath: "/configurations/utilisateur/creer/nouveau",
    ...userForm,
  }),
  "/configurations/utilisateur/roles-permissions": createForm({
    createPath: "/configurations/utilisateur/roles-permissions/nouveau",
    ...rolePermissionForm,
  }),
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toAmountInputValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isFinite(amount) ? String(amount) : "";
};

const documentItemsToFormValues = (items = [], extraFields = () => ({})) =>
  items.map((item) => ({
    productId: item.productId || item.product?.id || "",
    unitId: item.unitId || item.unit?.id || "",
    quantity: toAmountInputValue(item.quantity),
    ...extraFields(item),
  }));

const basePatchBuilder = (builder, endpointBuilder) => (values, id) => {
  const request = builder(values);
  return {
    ...request,
    endpoint: endpointBuilder(id),
    method: "PATCH",
  };
};

const isDraftStatus = (row) => row?.status === "DRAFT";
const isPendingStatus = (row) => row?.status === "PENDING";
const alwaysMutable = () => true;

export const editCatalog = {
  "/commande/demande-achat": {
    ...purchaseRequestForm,
    editPath: "/commande/demande-achat/modifier",
    detailPath: "/commande/demande-achat/detail",
    detailEndpoint: (id) => `/api/purchase-requests/${id}`,
    buildFormValues: (row) => ({
      title: row.title || "",
      storeId: row.storeId || row.store?.id || "",
      note: row.note || "",
      items: documentItemsToFormValues(row.items, (item) => ({
        note: item.note || "",
      })),
    }),
    buildUpdateRequest: basePatchBuilder(
      purchaseRequestForm.buildRequest,
      (id) => `/api/purchase-requests/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/purchase-requests/${id}`, method: "DELETE" }),
    pdfUrl: (row) => `/api/purchase-requests/${row.id}/pdf`,
    canEdit: isDraftStatus,
    canDelete: isDraftStatus,
    detailKind: "approval-request",
  },
  "/commande/requisitions": {
    ...supplyRequestForm,
    editPath: "/commande/requisitions/modifier",
    detailPath: "/commande/requisitions/detail",
    detailEndpoint: (id) => `/api/supply-requests/${id}`,
    buildFormValues: (row) => ({
      title: row.title || "",
      storeId: row.storeId || row.store?.id || "",
      storageZoneId: row.storageZoneId || row.storageZone?.id || "",
      note: row.note || "",
      items: documentItemsToFormValues(row.items, (item) => ({
        note: item.note || "",
      })),
    }),
    buildUpdateRequest: basePatchBuilder(
      supplyRequestForm.buildRequest,
      (id) => `/api/supply-requests/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/supply-requests/${id}`, method: "DELETE" }),
    canEdit: isDraftStatus,
    canDelete: isDraftStatus,
    pdfUrl: (row) => `/api/supply-requests/${row.id}/pdf`,
    detailKind: "approval-request",
  },
  "/commande/commande": {
    ...purchaseOrderForm,
    editPath: "/commande/commande/modifier",
    detailPath: "/commande/commande/detail",
    detailEndpoint: (id) => `/api/purchase-orders/${id}`,
    buildFormValues: (row) => ({
      storeId: row.storeId || row.store?.id || "",
      supplierId: row.supplierId || row.supplier?.id || "",
      purchaseRequestId:
        row.purchaseRequestId || row.purchaseRequest?.id || "",
      code: row.code || "",
      orderDate: toDateInputValue(row.orderDate),
      expectedDate: toDateInputValue(row.expectedDate),
      note: row.note || "",
      items: documentItemsToFormValues(row.items, (item) => ({
        unitPrice: toAmountInputValue(item.unitPrice),
      })),
    }),
    buildUpdateRequest: basePatchBuilder(
      purchaseOrderForm.buildRequest,
      (id) => `/api/purchase-orders/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/purchase-orders/${id}`, method: "DELETE" }),
    canEdit: isDraftStatus,
    canDelete: isDraftStatus,
    pdfUrl: (row) => `/api/purchase-orders/${row.id}/pdf`,
    detailKind: "purchase-order",
  },
  "/commande/liste-commande": {
    ...purchaseOrderForm,
    editPath: "/commande/liste-commande/modifier",
    detailPath: "/commande/liste-commande/detail",
    detailEndpoint: (id) => `/api/purchase-orders/${id}`,
    buildFormValues: (row) => ({
      storeId: row.storeId || row.store?.id || "",
      supplierId: row.supplierId || row.supplier?.id || "",
      purchaseRequestId:
        row.purchaseRequestId || row.purchaseRequest?.id || "",
      code: row.code || "",
      orderDate: toDateInputValue(row.orderDate),
      expectedDate: toDateInputValue(row.expectedDate),
      note: row.note || "",
      items: documentItemsToFormValues(row.items, (item) => ({
        unitPrice: toAmountInputValue(item.unitPrice),
      })),
    }),
    buildUpdateRequest: basePatchBuilder(
      purchaseOrderForm.buildRequest,
      (id) => `/api/purchase-orders/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/purchase-orders/${id}`, method: "DELETE" }),
    canEdit: isDraftStatus,
    canDelete: isDraftStatus,
    pdfUrl: (row) => `/api/purchase-orders/${row.id}/pdf`,
    detailKind: "purchase-order",
  },
  "/mouvement/entree-stock": {
    ...stockEntryForm,
    editPath: "/mouvement/entree-stock/modifier",
    detailPath: "/mouvement/entree-stock/detail",
    detailEndpoint: (id) => `/api/stock-entries/${id}`,
    buildFormValues: (row) => ({
      sourceType: row.sourceType || "DIRECT",
      sourceId: row.sourceId || "",
      receiptNumber: "",
      storeId: row.storeId || row.store?.id || "",
      storageZoneId: row.storageZoneId || row.storageZone?.id || "",
      note: row.note || "",
      items: documentItemsToFormValues(row.items, (item) => ({
        unitCost: toAmountInputValue(item.unitCost),
      })),
    }),
    buildUpdateRequest: (values, id, row) => ({
      endpoint: `/api/stock-entries/${id}`,
      method: "PATCH",
      body: {
        sourceId: compactValue(values.sourceId),
        storeId: compactValue(values.storeId),
        storageZoneId: values.storageZoneId,
        note: compactValue(values.note),
        operationType:
          row?.items?.some((item) => Number(item.quantity || 0) < 0) ? "OUT" : "IN",
        items: buildDocumentItems(values.items, (item) => ({
          unitCost: numericValue(item.unitCost),
        })),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/stock-entries/${id}`, method: "DELETE" }),
    canEdit: (row) => row?.sourceType === "DIRECT" && row?.status === "PENDING",
    canDelete: (row) => row?.sourceType === "DIRECT" && row?.status === "PENDING",
    pdfUrl: (row) => `/api/stock-entries/${row.id}/pdf`,
    detailKind: "stock-entry",
  },
  "/mouvement/transfert": {
    ...transferForm,
    editPath: "/mouvement/transfert/modifier",
    detailEndpoint: (id) => `/api/transfers/${id}`,
    buildFormValues: (row) => ({
      fromStoreId: row.fromStoreId || row.fromStore?.id || "",
      toStoreId: row.toStoreId || row.toStore?.id || "",
      fromZoneId: row.fromZoneId || row.fromZone?.id || "",
      toZoneId: row.toZoneId || row.toZone?.id || "",
      note: row.note || "",
      items: documentItemsToFormValues(row.items),
    }),
    buildUpdateRequest: basePatchBuilder(
      transferForm.buildRequest,
      (id) => `/api/transfers/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/transfers/${id}`, method: "DELETE" }),
    canEdit: isDraftStatus,
    canDelete: isDraftStatus,
  },
  "/configurations/articles/produits": {
    ...productForm,
    editPath: "/configurations/articles/produits/modifier",
    detailEndpoint: (id) => `/api/products/${id}`,
    buildFormValues: (row) => ({
      name: row.name || "",
      sku: row.sku || "",
      description: row.description || "",
      unitPrice: toAmountInputValue(row.unitPrice),
      categoryId: row.categoryId || row.category?.id || "",
      familyId: row.familyId || row.family?.id || "",
      saleUnitId: row.saleUnitId || row.saleUnit?.id || "",
      stockUnitId: row.stockUnitId || row.stockUnit?.id || "",
      dosageUnitId: row.dosageUnitId || row.dosageUnit?.id || "",
    }),
    buildUpdateRequest: basePatchBuilder(
      productForm.buildRequest,
      (id) => `/api/products/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/products/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/articles/articles": {
    ...productForm,
    editPath: "/configurations/articles/articles/modifier",
    detailEndpoint: (id) => `/api/products/${id}`,
    buildFormValues: (row) => ({
      name: row.name || "",
      sku: row.sku || "",
      description: row.description || "",
      unitPrice: toAmountInputValue(row.unitPrice),
      categoryId: row.categoryId || row.category?.id || "",
      familyId: row.familyId || row.family?.id || "",
      saleUnitId: row.saleUnitId || row.saleUnit?.id || "",
      stockUnitId: row.stockUnitId || row.stockUnit?.id || "",
      dosageUnitId: row.dosageUnitId || row.dosageUnit?.id || "",
    }),
    buildUpdateRequest: basePatchBuilder(
      productForm.buildRequest,
      (id) => `/api/products/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/products/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/articles/produits-vente": {
    ...productForm,
    editPath: "/configurations/articles/produits-vente/modifier",
    detailEndpoint: (id) => `/api/products/${id}`,
    buildFormValues: (row) => ({
      name: row.name || "",
      sku: row.sku || "",
      description: row.description || "",
      unitPrice: toAmountInputValue(row.unitPrice),
      categoryId: row.categoryId || row.category?.id || "",
      familyId: row.familyId || row.family?.id || "",
      saleUnitId: row.saleUnitId || row.saleUnit?.id || "",
      stockUnitId: row.stockUnitId || row.stockUnit?.id || "",
      dosageUnitId: row.dosageUnitId || row.dosageUnit?.id || "",
    }),
    buildUpdateRequest: basePatchBuilder(
      productForm.buildRequest,
      (id) => `/api/products/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/products/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/articles/fiche-technique": {
    ...productForm,
    editPath: "/configurations/articles/fiche-technique/modifier",
    detailEndpoint: (id) => `/api/products/${id}`,
    buildFormValues: (row) => ({
      name: row.name || "",
      sku: row.sku || "",
      description: row.description || "",
      unitPrice: toAmountInputValue(row.unitPrice),
      categoryId: row.categoryId || row.category?.id || "",
      familyId: row.familyId || row.family?.id || "",
      saleUnitId: row.saleUnitId || row.saleUnit?.id || "",
      stockUnitId: row.stockUnitId || row.stockUnit?.id || "",
      dosageUnitId: row.dosageUnitId || row.dosageUnit?.id || "",
    }),
    buildUpdateRequest: basePatchBuilder(
      productForm.buildRequest,
      (id) => `/api/products/${id}`,
    ),
    deleteRequest: (id) => ({ endpoint: `/api/products/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/articles/familles": {
    ...simpleNameForm("Modifier la famille", "Edition d'une famille.", "/api/product-families", "Enregistrer", "Famille modifiee."),
    editPath: "/configurations/articles/familles/modifier",
    buildFormValues: (row) => ({ name: row.name || "" }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/product-families/${id}`,
      method: "PATCH",
      body: { name: values.name },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/product-families/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/articles/sous-familles": {
    ...simpleNameForm("Modifier la sous-famille", "Edition d'une sous-famille.", "/api/product-families", "Enregistrer", "Sous-famille modifiee."),
    editPath: "/configurations/articles/sous-familles/modifier",
    buildFormValues: (row) => ({ name: row.name || "" }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/product-families/${id}`,
      method: "PATCH",
      body: { name: values.name },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/product-families/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/articles/categorie": {
    ...simpleNameForm("Modifier la categorie", "Edition d'une categorie.", "/api/product-categories", "Enregistrer", "Categorie modifiee."),
    editPath: "/configurations/articles/categorie/modifier",
    buildFormValues: (row) => ({ name: row.name || "" }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/product-categories/${id}`,
      method: "PATCH",
      body: { name: values.name },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/product-categories/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/parametres/unite": {
    ...unitForm,
    editPath: "/configurations/parametres/unite/modifier",
    buildFormValues: (row) => ({
      name: row.name || "",
      type: row.type || "SALE",
      symbol: row.symbol || "",
    }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/units/${id}`,
      method: "PATCH",
      body: {
        name: values.name,
        type: values.type,
        symbol: compactValue(values.symbol),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/units/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/parametres/locale-vente": {
    ...storeForm,
    editPath: "/configurations/parametres/locale-vente/modifier",
    buildFormValues: (row) => ({
      name: row.name || "",
      code: row.code || "",
      addressLine: row.addressLine || "",
      commune: row.commune || "",
      city: row.city || "",
      country: row.country || "",
    }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/stores/${id}`,
      method: "PATCH",
      body: {
        name: values.name,
        code: compactValue(values.code),
        addressLine: compactValue(values.addressLine),
        commune: compactValue(values.commune),
        city: compactValue(values.city),
        country: compactValue(values.country),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/stores/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/parametres/zone-stockage": {
    ...zoneForm,
    editPath: "/configurations/parametres/zone-stockage/modifier",
    buildFormValues: (row) => ({
      name: row.name || "",
      code: row.code || "",
      storeId: row.storeId || row.store?.id || "",
      zoneType: row.zoneType || "STORE",
      note: row.note || "",
    }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/storage-zones/${id}`,
      method: "PATCH",
      body: {
        name: values.name,
        code: compactValue(values.code),
        storeId: values.storeId,
        zoneType: compactValue(values.zoneType),
        note: compactValue(values.note),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/storage-zones/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/parametres/niveau-validation": {
    ...approvalFlowForm,
    editPath: "/configurations/parametres/niveau-validation/modifier",
    buildFormValues: (row) => ({
      code: row.code || "",
      name: row.name || "",
      steps: (row.steps || []).map((step) => ({
        stepOrder: String(step.stepOrder || ""),
        approverRole: step.approverRole || "ADMIN",
        approverUserId: step.approverUserId || step.approver?.id || "",
      })),
    }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/approval-flows/${id}`,
      method: "PATCH",
      body: {
        code: values.code,
        name: values.name,
        steps: mapItems(values.steps, (step) => ({
          stepOrder: numericValue(step.stepOrder) ?? 1,
          approverRole: compactValue(step.approverRole),
          approverUserId: compactValue(step.approverUserId),
        })),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/approval-flows/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/utilisateur/liste-utilisateurs": {
    ...userForm,
    editPath: "/configurations/utilisateur/liste-utilisateurs/modifier",
    detailEndpoint: (id) => `/api/users/${id}`,
    buildFormValues: (row) => ({
      email: row.email || "",
      phone: row.phone || "",
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      role: row.role || "USER",
      storeId: row.storeId || row.store?.id || "",
      defaultStorageZoneId: row.defaultStorageZoneId || "",
      sendVia: "email",
    }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/users/${id}`,
      method: "PATCH",
      body: {
        email: compactValue(values.email),
        phone: compactValue(values.phone),
        firstName: compactValue(values.firstName),
        lastName: compactValue(values.lastName),
        role: compactValue(values.role),
        storeId: compactValue(values.storeId),
        defaultStorageZoneId: compactValue(values.defaultStorageZoneId),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/users/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
  "/configurations/utilisateur/creer": {
    ...userForm,
    editPath: "/configurations/utilisateur/creer/modifier",
    detailEndpoint: (id) => `/api/users/${id}`,
    buildFormValues: (row) => ({
      email: row.email || "",
      phone: row.phone || "",
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      role: row.role || "USER",
      storeId: row.storeId || row.store?.id || "",
      defaultStorageZoneId: row.defaultStorageZoneId || "",
      sendVia: "email",
    }),
    buildUpdateRequest: (values, id) => ({
      endpoint: `/api/users/${id}`,
      method: "PATCH",
      body: {
        email: compactValue(values.email),
        phone: compactValue(values.phone),
        firstName: compactValue(values.firstName),
        lastName: compactValue(values.lastName),
        role: compactValue(values.role),
        storeId: compactValue(values.storeId),
        defaultStorageZoneId: compactValue(values.defaultStorageZoneId),
      },
    }),
    deleteRequest: (id) => ({ endpoint: `/api/users/${id}`, method: "DELETE" }),
    canEdit: alwaysMutable,
    canDelete: alwaysMutable,
  },
};

export const getEditConfig = (path) => editCatalog[normalizePath(path)] || null;

export const getResourceConfig = (path) => resourceCatalog[normalizePath(path)] || null;
export const getCreateConfig = (path) => createCatalog[normalizePath(path)] || null;

const createPageCatalog = Object.fromEntries(
  Object.entries(createCatalog).map(([resourcePath, config]) => [
    normalizePath(config.createPath),
    {
      ...config,
      resourcePath,
    },
  ]),
);

export const getCreatePageConfig = (path) =>
  createPageCatalog[normalizePath(path)] || null;

const editPageCatalog = Object.fromEntries(
  Object.entries(editCatalog).map(([resourcePath, config]) => [
    normalizePath(config.editPath),
    {
      ...config,
      resourcePath,
      mode: "edit",
    },
  ]),
);

export const getEditPageConfig = (path) =>
  editPageCatalog[normalizePath(path)] || null;

const detailPageCatalog = Object.fromEntries(
  Object.entries(editCatalog)
    .filter(([, config]) => config.detailPath)
    .map(([resourcePath, config]) => [
      normalizePath(config.detailPath),
      {
        ...config,
        resourcePath,
        mode: "detail",
      },
    ]),
);

export const getDetailPageConfig = (path) =>
  detailPageCatalog[normalizePath(path)] || null;

export const getTableActionConfig = (path) => {
  const resourcePath = normalizePath(path);
  const editConfig = editCatalog[resourcePath];

  return {
    editPath: editConfig?.editPath || null,
    detailPath: editConfig?.detailPath || null,
    canEdit: editConfig?.canEdit || null,
    canDelete: editConfig?.canDelete || null,
    deleteRequest: editConfig?.deleteRequest || null,
    pdfUrl: editConfig?.pdfUrl || null,
  };
};

createRouteMeta = [
  ...Object.entries(createCatalog).map(([resourcePath, config]) => {
    const resourceRoute = allRouteMeta.find((item) => item.path === resourcePath);
    const createPath = normalizePath(config.createPath);
    const label =
      config.title ||
      `Nouveau ${resourceRoute?.name?.toLowerCase() || "document"}`;

    return {
      id: `${resourceRoute?.id || createPath}-nouveau`,
      name: label,
      path: createPath,
      link: resourceRoute?.link || createPath.slice(1),
      icon: resourceRoute?.icon || FilePlus2,
      summary: config.description || resourceRoute?.summary || "",
      sectionLabel: resourceRoute?.sectionLabel || "Administration",
      breadcrumbs: [...(resourceRoute?.breadcrumbs || []), { label, path: createPath }],
    };
  }),
  ...Object.entries(editCatalog).map(([resourcePath, config]) => {
    const resourceRoute = allRouteMeta.find((item) => item.path === resourcePath);
    const editPath = normalizePath(config.editPath);
    const label = `Modifier ${resourceRoute?.name?.toLowerCase() || "element"}`;

    return {
      id: `${resourceRoute?.id || editPath}-modifier`,
      name: label,
      path: editPath,
      link: resourceRoute?.link || editPath.slice(1),
      icon: resourceRoute?.icon || FileCog,
      summary: config.description || resourceRoute?.summary || "",
      sectionLabel: resourceRoute?.sectionLabel || "Administration",
      breadcrumbs: [...(resourceRoute?.breadcrumbs || []), { label, path: editPath }],
    };
  }),
  ...Object.entries(detailPageCatalog).map(([detailPath, config]) => {
    const resourceRoute = allRouteMeta.find((item) => item.path === config.resourcePath);
    const label = `Detail ${resourceRoute?.name?.toLowerCase() || "document"}`;

    return {
      id: `${resourceRoute?.id || detailPath}-detail`,
      name: label,
      path: normalizePath(detailPath),
      link: resourceRoute?.link || normalizePath(detailPath).slice(1),
      icon: FileSearch,
      summary: config.description || resourceRoute?.summary || "",
      sectionLabel: resourceRoute?.sectionLabel || "Administration",
      breadcrumbs: [
        ...(resourceRoute?.breadcrumbs || []),
        { label, path: normalizePath(detailPath) },
      ],
    };
  }),
];

const redirectRoutes = sidebarItems
  .filter((item) => item.children?.length)
  .map((item) => ({
    path: item.path.slice(1),
    element: <Navigate to={item.children[0].path} replace />,
  }));

const workspaceRoutes = allRouteMeta
  .filter((item) => item.path !== dashboardMeta.path)
  .map((item) => ({
    path: item.path.slice(1),
    element: <AdminResourcePage />,
  }));

const createRoutes = Object.values(createPageCatalog).map((item) => ({
  path: item.createPath.slice(1),
  element: <AdminCreatePage />,
}));

const editRoutes = Object.values(editPageCatalog).map((item) => ({
  path: item.editPath.slice(1),
  element: <AdminCreatePage />,
}));

const detailRoutes = Object.values(detailPageCatalog).map((item) => ({
  path: item.detailPath.slice(1),
  element: <AdminDetailPage />,
}));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          ...redirectRoutes,
          ...workspaceRoutes,
          ...createRoutes,
          ...editRoutes,
          ...detailRoutes,
        ],
      },
    ],
  },
]);

export default router;
