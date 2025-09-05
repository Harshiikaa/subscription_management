const ToggleSwitch = ({ checked, onChange, label = "" }) => (
  <label className="inline-flex cursor-pointer items-center gap-2">
    {label && <span className="text-sm text-gray-700">{label}</span>}
    <span className="relative inline-block h-5 w-9">
      <input
        type="checkbox"
        className="peer absolute h-0 w-0 opacity-0"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-indigo-600" />
      <span className="absolute left-0 top-0 h-5 w-5 translate-x-0 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
    </span>
  </label>
);

export default ToggleSwitch;
