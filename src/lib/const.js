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

export const TALK_TRACK = [
  {
    heading: "Solution Overview",
    content: [
      {
        heading: "Automotive innovation is accelerating",
        body: [
          "The industry is undergoing rapid transformation with electric vehicles, autonomous driving, and advanced safety features.",
          "These advancements have created a demand for more sophisticated and intelligent in-car systems.",
        ],
      },
      {
        heading: "Current voice assistants are underutilized",
        body: [
          "Most vehicles come equipped with voice assistants, and drivers use them regularly.",
          "However, today’s assistants are limited to basic task like navigation, in-vehicle controls, and calls.",
        ],
      },
      {
        heading: "GenAI: The future of in-car assistants",
        body: [
          "Generative AI is shifting voice assistants from basic command-response to dynamic, interactive experiences.",
          "These assistants will understand driver needs, provide more relevant insights, and enhance overall user experience.",
        ],
      },
      {
        image: {
          src: "/stats.svg",
          alt: "Solution Overview",
        },
      },
    ],
  },
  {
    heading: "How to Demo",
    content: [
      {
        heading: " ",
        body: "This demo showcases a GenAI-powered in-car assistant that helps diagnose issues and provide navigation support. It can run in two modes: Simulation Mode (default), which follows a pre-set scenario without using resources or credits, and Execution Mode, where you can freely interact with the assistant using actual system resources. To switch modes, click the Options button (bottom-left icon) and select the desired mode. If switching to Execution Mode, you will be prompted to select a microphone. Since this is a voice assistant demo, ensure your sound is on to hear responses. If sound is unavailable, you can still read them in the chat.",
      },
      {
        image: {
          src: "/menu-guide.png",
          alt: "Menu Guide",
        },
      },
      {
        heading: "Simulation Mode",
        body: [
          "Press 'Start Navigation' to begin; the car will enter navigation mode.",
          "After a few seconds, the 'Low Engine Oil Pressure' warning light will turn on.",
          "Open the assistant by pressing the mic icon; the leafy assistant will greet you.",
          "Click suggested replies or press Enter to continue the conversation.",
          "The assistant will analyze the warning light, diagnose the issue, and inform you.",
          "If you confirm you want guidance, the assistant will check the manual and provide instructions.",
          "If a service station visit is required and confirmed, the assistant will recalculate your route.",
          "Once resolved, the assistant will ask if you need further help; confirming you're done will close the chat and return to navigation.",
        ],
      },
      {
        heading: "Execution Mode",
        body: [
          "Press 'Start Navigation' to begin; the car will enter navigation mode.",
          "The 'Low Engine Oil Pressure' warning light will turn on automatically.",
          "Optionally, you can manually toggle other warning lights by clicking on them.",
          "Open the assistant by pressing the mic icon; the leafy assistant will greet you.",
          "Speak directly to the assistant, which will recognize your voice and respond.",
          "The assistant can fetch diagnostic codes, check the manual, recalculate routes, and close the chat as needed.",
          "Ask about active warning lights or any car-related issue, and the assistant will provide information and suggest next steps.",
        ],
      },
    ],
  },
  {
    heading: "Behind the Scenes",
    content: [
      {
        image: {
          src: "/high-level-architecture.png",
          alt: "High Level Architecture",
        },
      },
      {
        heading: " ",
        body: "This solution combines Google Cloud with MongoDB Atlas to power an in-car voice assistant. GCP Speech-to-Text transcribes user input, and MongoDB Atlas Vector Search retrieves relevant sections of the car manual. The retrieved data is then fed into an LLM through Vertex AI, enabling the assistant to generate accurate, context-aware responses. The assistant perception is enhanced by providing access to the vehicle signal data, which is kept in sync with the MongoDB Atlas via PowerSync's native connector.",
      },
    ],
  },
  {
    heading: "Why MongoDB?",
    content: [
      {
        heading: "Leaders in the NoSQL Data Space",
        body: "MongoDB document model is intuitive, flexible and can handle the most complex requirements in a cost-effective way.",
      },
      {
        heading: "Vector Store at Scale",
        body: "MongoDB excels at storing operational, metadata, and vector data together at scale.",
      },
      {
        heading: "Automotive Industry Presence",
        body: "Trusted by top auto manufacturers, MongoDB is well-positioned to help automakers scale and optimize data solutions.",
      },
      {
        heading: "Accelerated Development",
        body: "The fully managed developer data platform, MongoDB Atlas, streamlines development, and reduces operational complexity.",
      },
    ],
  },
];
