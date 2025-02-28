export const SAMPLE_CONVERSATION = [
  {
    sender: "assistant",
    text: "Hi, I'm Leafy. How can I help you today?",
  },
  { sender: "user", text: "Hey, what’s this red light on my dashboard?" },
  {
    sender: "assistant",
    text: "That’s the engine oil pressure warning. It means your oil level might be low. Want me to guide you on what to do?",
  },
  { sender: "user", text: "Yes, please." },
  {
    sender: "assistant",
    text: "First, pull over safely and turn off the engine. Then, check the oil level and top it up if needed. If the light stays on, you should get the car checked.",
  },
  {
    sender: "assistant",
    text: "Want me to add the nearest service station to your route?",
  },
  { sender: "user", text: "Yes, that’d be great!" },
  { sender: "assistant", tool: "recalculateRoute" },
  {
    sender: "assistant",
    text: "Done! I’ve set your route to the closest service station. Drive safely! 🚗💨",
  },
  {
    sender: "assistant",
    text: "Is there anything else I can assist you with today?",
  },
  {
    sender: "user",
    text: "No, that's all. Thanks!",
  },
  { sender: "assistant", tool: "closeChat" },
];
