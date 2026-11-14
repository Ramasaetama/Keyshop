import { englishLabel } from "@/lib/english";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Shop } from "@/components/shop/Shop";
import { getHomeCatalog } from "@/lib/catalog.functions";

const homeQuery = queryOptions({ queryKey: ["home-catalog"], queryFn: () => getHomeCatalog() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KEYSHOP — Electronics, Gadgets & Accessories" },
      { name: "description", content: "Shop laptops, headphones, smartwatches, gaming gear and more at KEYSHOP — today's featured deals and trending electronics." },
      { property: "og:title", content: "KEYSHOP — Electronics, Gadgets & Accessories" },
      { property: "og:description", content: "Shop laptops, headphones, smartwatches, gaming gear and more at KEYSHOP — today's featured deals and trending electronics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
  errorComponent: ({ error }) => <div className="p-10 text-center">Unable to load store: {englishLabel((error as Error).message)}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found.</div>,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  return <Shop products={data.products} />;
}
