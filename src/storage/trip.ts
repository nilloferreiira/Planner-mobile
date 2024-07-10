import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIP_STORAGE_KEY = "@planner:tripId";

async function save(tripId: string) {
  try {
    await AsyncStorage.setItem(TRIP_STORAGE_KEY, tripId)
  } catch (e) {
    throw e;
  }
}

async function get() {
  try {
    const tripId = await AsyncStorage.getItem(TRIP_STORAGE_KEY)
    return tripId
  } catch (e) {
    throw e;
  }
}

async function remove() {
  try {
    await AsyncStorage.removeItem(TRIP_STORAGE_KEY)
  } catch (e) {
    throw e;
  }
}

export const tripStorage = { save, get, remove }
