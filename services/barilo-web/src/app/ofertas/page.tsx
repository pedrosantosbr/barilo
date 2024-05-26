import { OffersTemplate } from "@/components/offers/offers-template";
import { CircularListResponseSchema } from "@/entities/store";

async function fetchCirculars() {
  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/circulars/search/"
    );
    const parsedData = CircularListResponseSchema.parse(await response.json());
    return parsedData;
  } catch (error) {
    console.error("Failed to fetch data", error);
    throw error;
  }
}

export default async function Offers() {
  const circulars = await fetchCirculars();

  return (
    <main className="flex min-h-screen overflow-y-auto flex-col items-center pt-10 pb-40">
      <div className="container space-y-10">
        <div className="grid grid-cols-12">
          <div className="col-span-4">
            <div className="text-3xl font-extrabold">Ofertas</div>
          </div>
          <div className="col-span-8">
            <OffersTemplate circulars={circulars} />
          </div>
        </div>
      </div>
    </main>
  );
}
