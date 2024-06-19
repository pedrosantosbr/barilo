import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SelectDistancePreference = () => {
  return (
    <>
      <div className="text-sm">Filtrar por distância:</div>
      <Select>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="0km" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0-10">Entre 0 e 10km</SelectItem>
          <SelectItem value="20-30">Entre 20km e 30km</SelectItem>
          <SelectItem value="40-50">Entre 40km e 50km</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
};
