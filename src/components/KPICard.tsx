
interface KPICardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

export const KPICard = ({ title, value, icon }: KPICardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
        {icon && <div className="mr-4">{icon}</div>}
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};
