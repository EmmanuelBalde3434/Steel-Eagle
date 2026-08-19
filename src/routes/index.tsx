import { createFileRoute } from "@tanstack/react-router";
import { TankGame } from "@/components/TankGame";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <TankGame />;
}
