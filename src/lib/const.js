export const SAMPLE_CONVERSATION = [
  {
    sender: "assistant",
    text: "Hi, I'm Leafy. How can I help you today?",
  },
  { sender: "user", text: "Hey, what’s this red light on my dashboard?" },
  { sender: "assistant", tool: "fetchDTCCodes" },
  {
    sender: "assistant",
    text: "That’s the engine oil pressure warning. It means your oil level might be low. Want me to guide you on what to do?",
  },
  { sender: "user", text: "Yes, please." },
  { sender: "assistant", tool: "consultManual" },
  {
    sender: "assistant",
    text: "First, pull over safely and turn off the engine. Then, check the oil level and top it up if needed. If the light stays on, you should get the car checked. Want me to add the nearest service station to your route?",
  },
  { sender: "user", text: "Yes, that’d be great!" },
  { sender: "assistant", tool: "recalculateRoute" },
  {
    sender: "assistant",
    text: "Done! I’ve set your route to the closest service station. Drive safely! Is there anything else I can assist you with today?",
  },
  {
    sender: "user",
    text: "No, that's all. Thanks!",
  },
  { sender: "assistant", tool: "closeChat" },
];

export const DEFAULT_GREETINGS = {
  sender: "assistant",
  text: "Hi! I'm leafy how can I help you today?",
};

export const warningLights = [
  {
    name: "Engine Oil",
    iconOn: "/dashboardLights/engine-oil-on.png",
    iconOff: "/dashboardLights/engine-oil-off.png",
    dtcCodes: ["P0524", "P0521", "P0522", "P0523", "P0520"],
  },
  {
    name: "Low Tire Pressure",
    iconOn: "/dashboardLights/low-tire-pressure-on.png",
    iconOff: "/dashboardLights/low-tire-pressure-off.png",
    dtcCodes: ["C0750", "C0755", "C0760", "C0765"],
  },
  {
    name: "Brake System",
    iconOn: "/dashboardLights/brake-system-on.png",
    iconOff: "/dashboardLights/brake-system-off.png",
    dtcCodes: ["C1221", "C1223", "C1246", "C1252"],
  },
  {
    name: "Battery",
    iconOn: "/dashboardLights/battery-on.png",
    iconOff: "/dashboardLights/battery-off.png",
    dtcCodes: ["P0560", "P0562", "P0563"],
  },
];

export const dtcCodesDictionary = [
  {
    code: "P0520",
    description: "Engine Oil Pressure Sensor/Switch Circuit",
  },
  {
    code: "P0521",
    description: "Engine Oil Pressure Sensor/Switch Range/Performance",
  },
  {
    code: "P0522",
    description: "Engine Oil Pressure Sensor/Switch Low",
  },
  {
    code: "P0523",
    description: "Engine Oil Pressure Sensor/Switch High",
  },
  {
    code: "P0524",
    description: "Engine Oil Pressure Too Low",
  },
  {
    code: "C0750",
    description: "Left Front Low Tire Pressure Sensor",
  },
  {
    code: "C0755",
    description: "Right Front Low Tire Pressure Sensor",
  },
  {
    code: "C0760",
    description: "Left Rear Low Tire Pressure Sensor",
  },
  {
    code: "C0765",
    description: "Right Rear Low Tire Pressure Sensor",
  },
  {
    code: "C1221",
    description: "Lamp ABS Warning Output Circuit Short To Ground",
  },
  {
    code: "C1223",
    description: "Lamp Brake Warning Output Circuit Failure",
  },
  {
    code: "C1246",
    description: "ABS Outlet Valve Coil RR Circuit Failure",
  },
  {
    code: "C1252",
    description: "ABS Inlet Valve Coil LR Circuit Short To Battery",
  },
  {
    code: "P0560",
    description: "System Voltage Malfunction",
  },
  {
    code: "P0562",
    description: "Charging System Voltage Low",
  },
  {
    code: "P0563",
    description: "System Voltage High",
  },
];
