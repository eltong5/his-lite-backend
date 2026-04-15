import { AgencyRecord } from "@/features/agencies/agencyModel";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";

export const getCurrentAgency = (store: LocalStorageAgencyStore): AgencyRecord => store.getCurrent();
