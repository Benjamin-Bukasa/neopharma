import { connectSocket } from "./socket";
import useToastStore from "../stores/toastStore";
import useRealtimeStore from "../stores/realtimeStore";

let initialized = false;

const getLabel = (payload, fallback) => payload?.code || payload?.id || fallback;

const notify = (title, message, variant = "info") => {
  const { showToast } = useToastStore.getState();
  showToast({ title, message, variant });
};

export const initRealtimeListeners = () => {
  if (initialized) return;
  const token = window.localStorage.getItem("token");
  if (!token) return;

  initialized = true;
  const socket = connectSocket();
  const realtime = useRealtimeStore.getState();

  socket.on("connect_error", (error) => {
    notify("Socket error", error?.message || "Connection failed", "warning");
  });

  socket.on("notification:new", (payload) => {
    realtime.addNotification(payload);
    notify(payload?.title || "Notification", payload?.message || "");
  });

  socket.on("message:new", (payload) => {
    realtime.addMessage(payload);
    notify(payload?.title || "Message", payload?.message || "");
  });

  socket.on("order:created", (payload) => {
    realtime.incrementCounter("orders");
    realtime.addEvent({
      title: "New order",
      message: `Order ${getLabel(payload, "")}`.trim(),
      payload,
    });
    notify("New order", `Order ${getLabel(payload, "")}`.trim(), "success");
  });

  socket.on("sale:created", (payload) => {
    realtime.incrementCounter("sales");
    realtime.addEvent({
      title: "New sale",
      message: `Sale ${getLabel(payload, "")}`.trim(),
      payload,
    });
    notify("New sale", `Sale ${getLabel(payload, "")}`.trim(), "success");
  });

  socket.on("stock:entry:created", (payload) => {
    realtime.incrementCounter("stockEntries");
    realtime.addEvent({
      title: "Stock entry created",
      message: `Entry ${getLabel(payload, "")}`.trim(),
      payload,
    });
    notify("Stock entry created", `Entry ${getLabel(payload, "")}`.trim());
  });

  socket.on("stock:entry:approved", (payload) => {
    realtime.addEvent({
      title: "Stock entry approved",
      message: `Entry ${getLabel(payload, "")}`.trim(),
      payload,
    });
    notify("Stock entry approved", `Entry ${getLabel(payload, "")}`.trim());
  });

  socket.on("stock:entry:posted", (payload) => {
    realtime.addEvent({
      title: "Stock entry posted",
      message: `Entry ${getLabel(payload, "")}`.trim(),
      payload,
    });
    notify("Stock entry posted", `Entry ${getLabel(payload, "")}`.trim());
  });

  socket.on("supply:request:created", (payload) => {
    realtime.incrementCounter("supplyRequests");
    realtime.addEvent({
      title: "Supply request created",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Supply request created", payload?.title || getLabel(payload, ""));
  });

  socket.on("supply:request:submitted", (payload) => {
    realtime.addEvent({
      title: "Supply request submitted",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Supply request submitted", payload?.title || getLabel(payload, ""));
  });

  socket.on("supply:request:approved", (payload) => {
    realtime.addEvent({
      title: "Supply request approved",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Supply request approved", payload?.title || getLabel(payload, ""));
  });

  socket.on("supply:request:rejected", (payload) => {
    realtime.addEvent({
      title: "Supply request rejected",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Supply request rejected", payload?.title || getLabel(payload, ""), "warning");
  });

  socket.on("purchase:request:created", (payload) => {
    realtime.incrementCounter("purchaseRequests");
    realtime.addEvent({
      title: "Purchase request created",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Purchase request created", payload?.title || getLabel(payload, ""));
  });

  socket.on("purchase:request:submitted", (payload) => {
    realtime.addEvent({
      title: "Purchase request submitted",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Purchase request submitted", payload?.title || getLabel(payload, ""));
  });

  socket.on("purchase:request:approved", (payload) => {
    realtime.addEvent({
      title: "Purchase request approved",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Purchase request approved", payload?.title || getLabel(payload, ""));
  });

  socket.on("purchase:request:rejected", (payload) => {
    realtime.addEvent({
      title: "Purchase request rejected",
      message: payload?.title || getLabel(payload, ""),
      payload,
    });
    notify("Purchase request rejected", payload?.title || getLabel(payload, ""), "warning");
  });

  socket.on("purchase:order:created", (payload) => {
    realtime.incrementCounter("purchaseOrders");
    realtime.addEvent({
      title: "Purchase order created",
      message: getLabel(payload, ""),
      payload,
    });
    notify("Purchase order created", getLabel(payload, ""));
  });

  socket.on("purchase:order:sent", (payload) => {
    realtime.addEvent({
      title: "Purchase order sent",
      message: getLabel(payload, ""),
      payload,
    });
    notify("Purchase order sent", getLabel(payload, ""));
  });

  socket.on("delivery:note:created", (payload) => {
    realtime.incrementCounter("deliveryNotes");
    realtime.addEvent({
      title: "Delivery note created",
      message: getLabel(payload, ""),
      payload,
    });
    notify("Delivery note created", getLabel(payload, ""));
  });

  socket.on("delivery:note:received", (payload) => {
    realtime.addEvent({
      title: "Delivery note received",
      message: getLabel(payload, ""),
      payload,
    });
    notify("Delivery note received", getLabel(payload, ""));
  });

  socket.on("transfer:created", (payload) => {
    realtime.incrementCounter("transfers");
    realtime.addEvent({
      title: "Transfer created",
      message: getLabel(payload, ""),
      payload,
    });
    notify("Transfer created", getLabel(payload, ""));
  });

  socket.on("transfer:completed", (payload) => {
    realtime.addEvent({
      title: "Transfer completed",
      message: getLabel(payload, ""),
      payload,
    });
    notify("Transfer completed", getLabel(payload, ""));
  });
};
