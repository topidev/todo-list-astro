// src/components/toDo/GeneralBoardApp.tsx
import { AuthProvider } from "../auth/AuthProvider";
import GeneralDashboard from "./GeneralDashboard";

export default function GeneralBoardApp() {
  return (
    <AuthProvider>
      <GeneralDashboard />
    </AuthProvider>
  );
}