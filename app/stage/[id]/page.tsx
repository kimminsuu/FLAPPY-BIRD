import StageGameClient from "./StageGameClient";

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1) }));
}

export default function StageGameRoute() {
  return <StageGameClient />;
}
