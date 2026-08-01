import ShadowingPlayer from "@/components/ShadowingPlayer";
import { getToday } from "@/lib/data";

// Render per request so the page always reflects the current KST day's content,
// not whatever was in the DB at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getToday();
  return <ShadowingPlayer date={data.date} dialogues={data.dialogues} />;
}
