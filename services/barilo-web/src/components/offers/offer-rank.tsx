import { OffersGroupedByProductNameAndWeight } from "@/data/offers-samples";
import { cn } from "@/lib/utils";
import { StarIcon } from "@radix-ui/react-icons";
import { StarsIcon } from "lucide-react";
import { FC } from "react";

export type OfferRankProps = {
  offers: OffersGroupedByProductNameAndWeight[];
};

export const OfferRank: FC<OfferRankProps> = ({ offers }) => {
  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {offers
          .filter((item) => item.offers.length > 1)
          .map((offer, idx) => (
            <div
              key={idx}
              className="bg-background p-4 border rounded shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{offer.title}</h3>
                <StarsIcon className="text-amber-500 !fill-amber-400 w-10" />
              </div>
              <div className="space-y-2 mt-4">
                {offer.offers
                  .sort((a, b) => (a.price < b.price ? -1 : 1))
                  .map((offer, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <div
                          className={cn(
                            "text-sm text-gray-500",
                            idx == 0 && "text-amber-600"
                          )}
                        >
                          {offer.store}
                        </div>
                        <kbd
                          className={cn(
                            "price-promo",
                            idx == 0 && "!bg-amber-500 !text-white"
                          )}
                        >
                          R$ {offer.price.toFixed(2)}
                        </kbd>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
