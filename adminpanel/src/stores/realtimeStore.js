import { create } from "zustand";

const defaultNotifications = [
  {
    id: "notif-1",
    title: "Alerte stock",
    message: "12 articles sont sous le seuil minimum.",
  },
];

const defaultMessages = [
  {
    id: "msg-1",
    title: "Direction",
    message: "Verifier les transferts en attente avant 18h.",
  },
];

const useRealtimeStore = create((set) => ({
  notifications: defaultNotifications,
  messages: defaultMessages,
  clearNotifications: () => set({ notifications: [] }),
  clearMessages: () => set({ messages: [] }),
}));

export default useRealtimeStore;
