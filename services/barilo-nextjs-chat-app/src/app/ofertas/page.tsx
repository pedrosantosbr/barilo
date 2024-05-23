import { OffersTemplate } from "@/components/offers/offers-template";

export default function Offers() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pt-10  pb-40">
      <div className="container space-y-10">
        <OffersTemplate />
      </div>
    </main>
  );
}
