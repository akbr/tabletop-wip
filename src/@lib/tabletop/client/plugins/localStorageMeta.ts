import { Spec, Client } from "../../";

export function attachLocalStorageMeta<S extends Spec>(client: Client<S>) {
  client.emitter.subscribe((state) => {
    const isLobby = !state && room;

    if (isLobby) {
      const meta = room.seats[room.player]!;
      const receivedMeta = JSON.stringify(meta);
      const storedMeta = localStorage.getItem("meta");

      if (!storedMeta) {
        localStorage.setItem("meta", receivedMeta);
        return;
      }

      if (receivedMeta === storedMeta) return;

      if (receivedMeta === `{}`) {
        client.actions.server.setMeta(JSON.parse(storedMeta));
      } else {
        localStorage.setItem("meta", JSON.stringify(meta));
      }
    }
  });
}

export default attachLocalStorageMeta;
