import React from "react";

// Fallback local Navigator to avoid missing-module build error
// Replace or remove this fallback once ./src/navigation/navigator exists
const Navigator: React.FC = () => {
  return null;
};

export default function App() {
  return <Navigator />;
}
