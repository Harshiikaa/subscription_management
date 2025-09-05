import Card from "./ui/Card";
import Button from "./ui/Button";

const PlanCard = ({ name, price, features = [], onSelect, highlight = false, badge = "" }) => (
  <Card className={`p-6 relative ${highlight ? "border-indigo-400 shadow-md" : ""}`}>
    {badge ? (
      <span className="absolute right-3 top-3 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
        {badge}
      </span>
    ) : null}
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="mt-2 text-3xl font-bold">{price}</p>
    <ul className="mt-4 space-y-2 text-sm text-gray-600">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <Button className={`mt-6 w-full ${highlight ? "bg-indigo-700 hover:bg-indigo-800" : ""}`} onClick={onSelect}>
      Choose {name}
    </Button>
  </Card>
);

export default PlanCard;
