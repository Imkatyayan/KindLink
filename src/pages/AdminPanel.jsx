import { useEffect, useState } from 'react';
import { Shield, Users, Clock, DollarSign, FileText } from 'lucide-react';
import { USER_STATUS } from '../constants/areas';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPanel() {
  const { refreshUsers, refreshPendingUsers, refreshTransactions, refreshAdminStats, verifyUser, transactions, adminStats } = useData();
  const { success } = useToast();
  const [tab, setTab] = useState('pending');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [pending, users] = await Promise.all([
      refreshPendingUsers(),
      refreshUsers(),
      refreshTransactions(),
      refreshAdminStats(),
    ]);
    setPendingUsers(pending);
    setAllUsers(users);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (userId, status) => {
    await verifyUser(userId, status);
    success(`User ${status} successfully.`);
    load();
  };

  if (loading) return <LoadingSpinner text="Loading admin panel..." />;

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <h1><Shield size={28} className="inline-icon" /> Admin Panel</h1>
          <p>Verify registrations and monitor platform activity.</p>
        </div>
      </div>

      {adminStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-role"><Users size={20} /></div>
            <div><span>Total Users</span><strong>{adminStats.totalUsers}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-pending"><Clock size={20} /></div>
            <div><span>Pending</span><strong>{adminStats.pendingUsers}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-posts"><FileText size={20} /></div>
            <div><span>Posts</span><strong>{adminStats.totalPosts}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-matches"><DollarSign size={20} /></div>
            <div><span>Volume</span><strong>${Number(adminStats.totalVolume).toLocaleString()}</strong></div>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button type="button" className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>
          Pending ({pendingUsers.length})
        </button>
        <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          All Users
        </button>
        <button type="button" className={tab === 'transactions' ? 'active' : ''} onClick={() => setTab('transactions')}>
          Transactions
        </button>
      </div>

      {tab === 'pending' && (
        <div className="table-wrap card">
          {pendingUsers.length === 0 ? (
            <p className="empty-state">No pending verifications.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>ID Proof</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td>{u.phone}</td>
                    <td>{u.idProof}</td>
                    <td className="table-actions">
                      <button type="button" className="btn btn-primary btn-sm"
                        onClick={() => handleVerify(u.id, USER_STATUS.APPROVED)}>Approve</button>
                      <button type="button" className="btn btn-danger btn-sm"
                        onClick={() => handleVerify(u.id, USER_STATUS.BLOCKED)}>Block</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Registered</th></tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td><span className={`status-pill status-${u.status}`}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="table-wrap card">
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Donor</th><th>Receiver</th><th>Amount</th><th>Ref</th><th>Status</th></tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td>{tx.donor?.fullName}</td>
                    <td>{tx.receiver?.fullName}</td>
                    <td>${Number(tx.amount).toLocaleString()}</td>
                    <td><code>{tx.gatewayRef}</code></td>
                    <td><span className={`status-pill status-${tx.status}`}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
