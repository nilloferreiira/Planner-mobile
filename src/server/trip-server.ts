import { api } from "./api";

export interface TripDetails {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
}

interface TripCreate extends Omit<TripDetails, "id" | "is_confirmed"> {
  emails_to_invite: string[];
}

async function getById(id: string) {
  try {
    const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);

    return data.trip;
  } catch (e) {
    throw e;
  }
}

async function create({
  destination,
  ends_at,
  starts_at,
  emails_to_invite,
}: TripCreate) {
  try {
    const { data } = await api.post<{ tripId: string }>("/trips", {
      destination,
      starts_at,
      ends_at,
      emails_to_invite,
      owner_name: "Danillo",
      owner_email: "nilloferreiira@gmail.com",
    });

    return data;
  } catch (e) {
    throw e;
  }
}

async function update({
  id,
  destination,
  ends_at,
  starts_at,
}: Omit<TripDetails, "is_confirmed">) {
  try {
    await api.put(`/trips/${id}`, {
      destination,
      starts_at,
      ends_at,
    });
  } catch (e) {
    throw e;
  }
}

export const tripServer = { getById, create, update };
