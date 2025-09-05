import React from "react";
import Button from "./ui/Button";

const Backdrop = ({ onClose }) => (
  <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
);

const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="w-full max-w-lg rounded-md border bg-white p-4 shadow-lg">
      {children}
    </div>
  </div>
);

const PlanEditorModal = ({ open, onClose, plan, onSave }) => {
  const [name, setName] = React.useState(plan?.name || "");
  const [price, setPrice] = React.useState(plan?.price || "");
  const [features, setFeatures] = React.useState((plan?.features || []).join("\n"));

  React.useEffect(() => {
    setName(plan?.name || "");
    setPrice(plan?.price || "");
    setFeatures((plan?.features || []).join("\n"));
  }, [plan]);

  const save = () => {
    const cleaned = features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ name, price, features: cleaned });
  };

  if (!open) return null;

  return (
    <>
      <Backdrop onClose={onClose} />
      <Modal>
        <h3 className="text-lg font-semibold">Edit plan</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Price</label>
            <input className="w-full rounded-md border px-3 py-2" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Features (one per line)</label>
            <textarea className="h-32 w-full rounded-md border px-3 py-2" value={features} onChange={(e) => setFeatures(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>
    </>
  );
};

export default PlanEditorModal;
