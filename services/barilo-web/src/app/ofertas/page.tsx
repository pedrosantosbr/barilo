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
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <OffersTemplate circulars={circulars} />
          </div>
          <div className="col-span-5">
            <div className="text-3xl font-extrabold">Ofertas</div>
            <ul className="flex text-sm pt-16 p-4 flex-wrap">
              <li className="flex items-center justify-between border rounded-md px-2 shadow-sm whitespace-nowrap mr-2 mb-2">
                <div className="mr-4">Banana</div>
                <div className="font-medium">2.99</div>
              </li>
              <li className="flex items-center justify-between border rounded-md px-2 shadow-sm whitespace-nowrap mr-2 mb-2">
                <div className="mr-4">Arroz Palmares 5kg tipo 1</div>
                <div className="font-medium">4.99</div>
              </li>
              <li className="flex items-center justify-between border rounded-md px-2 shadow-sm whitespace-nowrap mr-2 mb-2">
                <div className="mr-4">Carne bovina p/ churrasco</div>
                <div className="font-medium">4.99</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
