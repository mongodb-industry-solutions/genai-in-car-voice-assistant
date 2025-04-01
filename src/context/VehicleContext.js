"use client";
import { usePowerSync } from '@powersync/react';
import { createContext, useContext, useState, useEffect } from "react";

const VehicleContext = createContext();

export const useVehicle = () => {
  return useContext(VehicleContext);
};

// Hardcoded ID used for testing.
const vehicleId = "67e58d5f672b23090e57d478";

export const VehicleProvider = ({ children }) => {
  const powersync = usePowerSync();
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

      // Stringify the objects and write to the database.
      // The backend API will write them as arrays/objects
      // back to the source database.
      const acceleration = JSON.stringify(vehicle.Acceleration);
      const currentLocation = JSON.stringify(vehicle.CurrentLocation);
      const diagnostics = JSON.stringify(vehicle.Diagnostics);

      // Write changes to the database.
      powersync.execute(`
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
            vehicleId
          ]);
    }, [vehicle]);

  return (
    <VehicleContext.Provider value={{ vehicle, updateVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};
