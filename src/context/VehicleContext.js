"use client";

import { createContext, useContext, useState, useEffect } from "react";

const VehicleContext = createContext();

export const useVehicle = () => {
  return useContext(VehicleContext);
};

export const VehicleProvider = ({ children }) => {
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

  //   useEffect(() => {
  //     console.log("Vehicle State Updated:", vehicle);
  //   }, [vehicle]);

  return (
    <VehicleContext.Provider value={{ vehicle, updateVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};
