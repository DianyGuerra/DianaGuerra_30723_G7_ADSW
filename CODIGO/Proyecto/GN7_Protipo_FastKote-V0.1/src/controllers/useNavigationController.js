import { useState } from "react";
import { menuItems } from "../constants/menuItems";

export function useNavigationController() {
  const [logged, setLogged] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeItem = menuItems.find((item) => item.id === active) || menuItems[0];

  return {
    logged,
    login: () => setLogged(true),
    active,
    setActive,
    sidebarOpen,
    setSidebarOpen,
    activeItem,
  };
}
