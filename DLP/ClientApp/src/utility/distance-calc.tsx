export interface Address {
    countryId?: string;
    city?: string;
    companyAddress?: string;
    postalCode?: string;
  }

export const getDistanceInKm = async (
    pickup: Address,
    delivery: Address
  ): Promise<string | null> => {
    // const apiKey = "V5SsQgPJtXM0EDwTWjWWAV7sHUpHCKJs0iWGYv5I3Z26CiRhe4tai1rCDuZ0QKBy"; // 🔹 replace with your distancematrix.ai key
    const apiKey = process.env.REACT_APP_LOCATION_API_URL as string; // 🔹 replace with your distancematrix.ai key
    const origins = `${pickup.companyAddress}, ${pickup.city}, ${pickup.postalCode || ""}, ${pickup.countryId || ""}`;
    const destinations = `${delivery.companyAddress}, ${delivery.city}, ${delivery.postalCode || ""}, ${delivery.countryId || ""}`;
  
    try {
      const response = await fetch(
        `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${encodeURIComponent(
          origins
        )}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`
      );
      const data = await response.json();
  
      console.log("📦 DistanceMatrix response:", data);
  
      const element = data?.rows?.[0]?.elements?.[0];
      if (element?.status !== "OK") {
        return "Invalid Address";
      }
  
      const distanceText = element.distance?.text;
      return distanceText || null;
    } catch (error) {
      return "Error calculating distance";
    }
  };