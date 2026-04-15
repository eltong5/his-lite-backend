import { AgencyRecord } from "@/features/agencies/agencyModel";

const STORAGE_KEY = "crm-current-agency";

const defaultAgency: AgencyRecord = {
  id: "agency-demo-001",
  name: "Agencia Seguros Andinos",
  slug: "seguros-andinos",
  city: "Bogota",
  country: "Colombia",
  plan: "Starter",
  teamSize: 4,
};

export class LocalStorageAgencyStore {
  getCurrent(): AgencyRecord {
    if (typeof window === "undefined") {
      return defaultAgency;
    }

    const storedAgency = window.localStorage.getItem(STORAGE_KEY);
    if (!storedAgency) {
      return defaultAgency;
    }

    try {
      return JSON.parse(storedAgency) as AgencyRecord;
    } catch {
      return defaultAgency;
    }
  }

  saveCurrent(agency: AgencyRecord): AgencyRecord {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(agency));
    }

    return agency;
  }
}
