import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { config } from "./config";

// Describe the initial data
const initialData = {};

// Save the data to your database
const save = (data) => {};

// Render Puck editor
export function Editor() {
  return <Puck config={config} data={initialData} onPublish={save} />;
}
