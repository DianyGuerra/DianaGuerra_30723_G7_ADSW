import { Button } from "./Button";

export function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" icon="eye">Ver</Button>
      <Button variant="ghost" icon="edit">Editar</Button>
      <Button variant="ghost" icon="close">Baja</Button>
    </div>
  );
}
