"use client";
import { FC } from "react";

export type AdminMarketUnitListProps = {};
export const AdminMarketUnitList: FC<AdminMarketUnitListProps> = ({}) => {
  return (
    <ul className="flex flex-col">
      <li className="flex items-center border rounded-lg shadow-md">
        <div className="p-4">
          <h3 className="text-lg font-semibold">Unidade 1</h3>
          <p className="text-sm">Endereço: Rua 1, 123</p>
        </div>
      </li>
    </ul>
  );
};
