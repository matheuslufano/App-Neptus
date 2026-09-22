import { ApiUserProperty } from "@/types/user-api-type";

interface UserPropertyItemProps {
  property: ApiUserProperty;
}

const UserPropertyItem = ({ property }: UserPropertyItemProps) => {
  return (
    <div className="flex px-4 py-3 items-center gap-2 border bg-muted rounded-md">
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium">{property.nome}</p>
      </div>
    </div>
  );
};

export default UserPropertyItem;
