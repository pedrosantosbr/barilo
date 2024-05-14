import { OffersTemplate } from "@/components/offers/OffersTemplate";

export default function Offers() {
  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pt-10  pb-40">
      <div className="container space-y-10">
        <div className="text-center text-5xl font-bold">Ofertas do dia</div>
        <OffersTemplate />
      </div>
    </main>
  );
}
