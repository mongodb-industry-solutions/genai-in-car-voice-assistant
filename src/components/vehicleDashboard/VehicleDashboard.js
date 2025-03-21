import WarningLight from "@/components/warningLight/WarningLight";
import styles from "./vehicleDashboard.module.css";
import { warningLights } from "@/lib/const";

const VehicleDashboard = ({ isPlaying }) => {
  return (
    <div className={styles.dashboard}>
      {warningLights.map((light) => (
        <WarningLight key={light.name} {...light} isPlaying={isPlaying} />
      ))}
    </div>
  );
};

export default VehicleDashboard;
