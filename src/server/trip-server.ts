import { api } from "./api";

export interface TripDetails {
  id: string;
  destination: string;
  starts_at: string;
  end_at: string;
  is_confirmed: boolean;
}

interface TripCreate extends Omit<TripDetails, 'id' | 'is_confirmed'>{
    emails_to_invite: string[]
}

async function getById(id: string) {
  try {
    const { data } = await api.get<{ trip: TripDetails }>(`/trips/${id}`);

    return data.trip;
  } catch (e) {
    throw e;
  }
}

async function create({destination, end_at, starts_at, emails_to_invite}: TripCreate) {
    try{
        const { data } = await api.post<{tripId: string}>('/trips', {
            destination,
            starts_at,
            end_at,
            emails_to_invite,
            owner_name: "Danillo",
            owner_email: "nilloferreiira@gmail.com",
        })

        return data.tripId
    }
    catch(e) {
        throw (e)
    }
}

export const tripServer = { getById }