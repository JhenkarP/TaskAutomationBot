// TaskAutomationBots/EmailAssistant/src/App.jsx
import { BrowserRouter } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <Tooltip.Provider delayDuration={150}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Tooltip.Provider>
  );
}
