"use client";
import { usePowerSync } from "@powersync/react";
import { createContext, useContext, useState, useEffect } from "react";

const VehicleContext = createContext();

export const useVehicle = () => {
  return useContext(VehicleContext);
};

// Hardcoded ID used for testing.
const vehicleId = "67e58d5f672b23090e57d478";

// Check if PowerSync is configured
const isPowerSyncEnabled = () => {
  const powersyncUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_POWERSYNC_URL
      : undefined;
  const backendBaseUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL
      : undefined;

  if (!powersyncUrl || !backendBaseUrl) {
    console.warn(
      "PowerSync is disabled: Missing environment variables NEXT_PUBLIC_POWERSYNC_URL or NEXT_PUBLIC_BACKEND_BASE_URL"
    );
    return false;
  }
  return true;
};

export const VehicleProvider = ({ children }) => {
  // Check if PowerSync is enabled before using the hook
  const powerSyncEnabled = isPowerSyncEnabled();

  // Only use the PowerSync hook if it's enabled
  const powersync = powerSyncEnabled ? usePowerSync() : null;
  const [vehicle, setVehicle] = useState({
    VehicleIdentification: {
      VIN: "1HGCM82633A004352",
    },
    Speed: 0.0,
    TraveledDistance: 0.0,
    CurrentLocation: {
      Timestamp: "2020-01-01T00:00:00Z",
      Latitude: 0.0,
      Longitude: 0.0,
      Altitude: 0.0,
    },
    Acceleration: {
      Lateral: 0.0,
      Longitudinal: 0.0,
      Vertical: 0.0,
    },
    Diagnostics: {
      DTCCount: 0,
      DTCList: [],
    },
  });

  const updateVehicle = (newState) => {
    setVehicle((prevState) => {
      const updatedVehicle = {
        ...prevState,
        ...newState,
        Diagnostics: {
          ...prevState.Diagnostics,
          ...newState.Diagnostics,
          DTCList:
            newState.Diagnostics?.DTCList ?? prevState.Diagnostics.DTCList,
        },
      };

      updatedVehicle.Diagnostics.DTCCount =
        updatedVehicle.Diagnostics.DTCList.length;

      return updatedVehicle;
    });
  };

  useEffect(() => {
    console.log("Vehicle State Updated:", vehicle);

    // Only sync with PowerSync if it's enabled
    if (powerSyncEnabled && powersync) {
      // Stringify the objects and write to the database.
      // The backend API will write them as arrays/objects
      // back to the source database.
      const acceleration = JSON.stringify(vehicle.Acceleration);
      const currentLocation = JSON.stringify(vehicle.CurrentLocation);
      const diagnostics = JSON.stringify(vehicle.Diagnostics);

      try {
        // Write changes to the database.
        powersync.execute(
          `
            UPDATE vehicleData 
            SET Acceleration = ?, 
                CurrentLocation = ?, 
                Diagnostics = ?, 
                Speed = ?, 
                TraveledDistance = ?  
            WHERE id = ?`,
          [
            acceleration,
            currentLocation,
            diagnostics,
            vehicle.Speed,
            vehicle.TraveledDistance,
            vehicleId,
          ]
        );
      } catch (error) {
        console.warn(
          "Failed to sync vehicle data with PowerSync:",
          error.message
        );
      }
    }
  }, [vehicle, powerSyncEnabled, powersync]);

  return (
    <VehicleContext.Provider value={{ vehicle, updateVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};
