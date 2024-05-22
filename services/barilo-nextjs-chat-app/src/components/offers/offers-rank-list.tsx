import { OffersGroupedByProductNameAndWeight } from "@/data/offers-samples";
import { FC } from "react";

export type OffersRankListProps = {
  offers: OffersGroupedByProductNameAndWeight[];
};

export const OffersRankList: FC<OffersRankListProps> = ({ offers }) => {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-3 gap-8">
        {offers.map((offer, idx) => (
          <div key={idx}>
            <h3 className="text-lg font-semibold">{offer.title}</h3>
            <div className="space-y-2 mt-4">
              {offer.offers
                .sort((a, b) => (a.price < b.price ? -1 : 1))
                .map((offer, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between">
                      <div className="text-sm">{offer.store}</div>
                      <kbd className="price-promo">
                        {offer.price.toFixed(2)}
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
