import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import Loading from "../components/Loading";
import PlanEditorModal from "../components/PlanEditorModal";
import ToggleSwitch from "../components/ui/ToggleSwitch";
import { useToast } from "../context/ToastContext";
import { subscriptionService } from "../services/subscriptionService";
import { adminService } from "../services/adminService";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    try {
      const [plansRes, usersRes, paymentsRes] = await Promise.all([
        subscriptionService.listPlans(),
        adminService.listUsers(),
        adminService.payments(),
      ]);
      setPlans(plansRes?.data?.data || []);
      setUsers(usersRes?.data?.data || []);
      setPayments(paymentsRes?.data?.data || []);
    } catch (_) {
      setPlans([]);
      setUsers([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPlan = async () => {
    try {
      await subscriptionService.createPlan({ name, price });
      setName("");
      setPrice("");
      addToast("Plan created", { type: "success" });
      load();
    } catch {
      addToast("Failed to create plan", { type: "error" });
    }
  };

  const changeRole = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, role);
      addToast("Role updated", { type: "success" });
      load();
    } catch {
      addToast("Failed to update role", { type: "error" });
    }
  };

  const onSavePlan = async (payload) => {
    try {
      await subscriptionService.updatePlan(editPlan.id, payload);
      setEditPlan(null);
      addToast("Plan updated", { type: "success" });
      load();
    } catch {
      addToast("Failed to update plan", { type: "error" });
    }
  };

  if (loading) return <div className="p-6"><Loading label="Loading admin data..." /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold">Admin dashboard</h2>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Plans</h3>
              <div className="mt-4 space-y-3">
                {plans.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-600">{p.price}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        label="Active"
                        checked={p.isActive !== false}
                        onChange={async (val) => {
                          try {
                            await subscriptionService.updatePlan(p.id, { isActive: val });
                            addToast("Plan visibility updated", { type: "success" });
                            load();
                          } catch {
                            addToast("Failed to update plan", { type: "error" });
                          }
                        }}
                      />
                      <Button variant="secondary" onClick={() => setEditPlan(p)}>Edit</Button>
                      <Button variant="danger" onClick={async () => { try { await subscriptionService.deletePlan(p.id); addToast("Plan deleted", { type: "success" }); load(); } catch { addToast("Failed to delete plan", { type: "error" }); } }}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md border p-4">
                <div className="mb-2 text-sm font-medium">Create plan</div>
                <input className="mb-2 w-full rounded-md border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="mb-3 w-full rounded-md border px-3 py-2" placeholder="Price (e.g. NPR 999/mo)" value={price} onChange={(e) => setPrice(e.target.value)} />
                <Button onClick={createPlan}>Create</Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Users</h3>
              <div className="mt-4 overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Role</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-2">{u.name}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.role}</td>
                        <td className="px-4 py-2">
                          <select
                            className="rounded-md border border-gray-300 px-2 py-1"
                            value={u.role}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="mt-10 font-semibold">Recent payments</h3>
              <div className="mt-4 overflow-x-auto rounded-md border">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">User</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Gateway</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2">{p.date}</td>
                        <td className="px-4 py-2">{p.userEmail}</td>
                        <td className="px-4 py-2">{p.gateway}</td>
                        <td className="px-4 py-2">{p.amount}</td>
                        <td className="px-4 py-2">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <PlanEditorModal open={!!editPlan} onClose={() => setEditPlan(null)} plan={editPlan} onSave={onSavePlan} />
    </div>
  );
};

export default AdminDashboard;
