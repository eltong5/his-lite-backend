import { AgencyRecord } from "@/features/agencies/agencyModel";

const STORAGE_KEY = "crm-current-agency";
const LIST_STORAGE_KEY = "crm-agencies";

const defaultAgency: AgencyRecord = {
  id: "agency-demo-001",
  name: "Agencia Seguros Andinos",
  slug: "seguros-andinos",
  city: "Bogota",
  country: "Colombia",
  plan: "Starter",
  teamSize: 4,
};

const defaultAgencies: AgencyRecord[] = [
  defaultAgency,
  {
    id: "agency-demo-002",
    name: "Broker Norte Seguros",
    slug: "broker-norte-seguros",
    city: "Medellin",
    country: "Colombia",
    plan: "Growth",
    teamSize: 6,
  },
];

export class LocalStorageAgencyStore {
  list(): AgencyRecord[] {
    if (typeof window === "undefined") {
      return defaultAgencies;
    }

    const storedAgencies = window.localStorage.getItem(LIST_STORAGE_KEY);
    if (!storedAgencies) {
      return defaultAgencies;
    }

    try {
      const parsedAgencies = JSON.parse(storedAgencies) as AgencyRecord[];
      return parsedAgencies.length > 0 ? parsedAgencies : defaultAgencies;
    } catch {
      return defaultAgencies;
    }
  }

  getCurrent(): AgencyRecord {
    const agencies = this.list();

    if (typeof window === "undefined") {
      return agencies[0] ?? defaultAgency;
    }

    const storedAgency = window.localStorage.getItem(STORAGE_KEY);
    if (!storedAgency) {
      return agencies[0] ?? defaultAgency;
    }

    try {
      const currentAgency = JSON.parse(storedAgency) as AgencyRecord;
      return agencies.find((agency) => agency.id === currentAgency.id) ?? agencies[0] ?? defaultAgency;
    } catch {
      return agencies[0] ?? defaultAgency;
    }
  }

  saveCurrent(agency: AgencyRecord): AgencyRecord {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(agency));
    }

    return agency;
  }

  saveAll(agencies: AgencyRecord[]): AgencyRecord[] {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(agencies));
    }

    return agencies;
  }
}
