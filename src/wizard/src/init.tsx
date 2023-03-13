import { bundle, isDev } from "./bundle";
import viewInputs from "./views";

const {
  view: { render },
  client: { serverActions },
} = bundle;

render(viewInputs);

if (isDev()) {
  const { join, addBot, start, leave } = serverActions;
  join({ id: "DEVV" });
}
