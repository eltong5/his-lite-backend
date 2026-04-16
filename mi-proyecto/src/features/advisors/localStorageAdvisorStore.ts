import { AdvisorRecord } from "@/features/advisors/advisorModel";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";

const STORAGE_KEY = "crm-advisors";
const agencyStore = new LocalStorageAgencyStore();

const defaultAdvisors: AdvisorRecord[] = [
  {
    id: "advisor-admin",
    fullName: "Administrador",
    email: "admin@prueba.com",
    role: "Admin",
    agencyId: "agency-test-001",
    active: true,
  },
];

export class LocalStorageAdvisorStore {
  private getCurrentAgencyId() {
    return getCurrentAgency(agencyStore).id;
  }

  list(): AdvisorRecord[] {
    const currentAgencyId = this.getCurrentAgencyId();

    if (typeof window === "undefined") {
      return defaultAdvisors.filter((advisor) => advisor.agencyId === currentAgencyId);
    }

    const storedAdvisors = window.localStorage.getItem(STORAGE_KEY);
    if (!storedAdvisors) {
      return defaultAdvisors.filter((advisor) => advisor.agencyId === currentAgencyId);
    }

    try {
      const parsedAdvisors = JSON.parse(storedAdvisors) as AdvisorRecord[];
      const agencyAdvisors = parsedAdvisors.filter((advisor) => advisor.agencyId === currentAgencyId);
      return agencyAdvisors.length > 0 ? agencyAdvisors : defaultAdvisors.filter((advisor) => advisor.agencyId === currentAgencyId);
    } catch {
      return defaultAdvisors.filter((advisor) => advisor.agencyId === currentAgencyId);
    }
  }

  saveAll(advisors: AdvisorRecord[]): AdvisorRecord[] {
    if (typeof window !== "undefined") {
      const storedAdvisors = window.localStorage.getItem(STORAGE_KEY);
      const allAdvisors = storedAdvisors ? (JSON.parse(storedAdvisors) as AdvisorRecord[]) : [];
      const currentAgencyId = this.getCurrentAgencyId();
      const otherAgencyAdvisors = allAdvisors.filter((advisor) => advisor.agencyId !== currentAgencyId);

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherAgencyAdvisors, ...advisors]));
    }

    return advisors;
  }

  create(advisor: AdvisorRecord): AdvisorRecord[] {
    return this.saveAll([advisor, ...this.list()]);
  }
}
