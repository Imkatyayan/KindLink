import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getUserById } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Transactions() {
  const { user } = useAuth();
  const { getUserTransactions } = useData();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState({});

  useEffect(() => {
    getUserTransactions()
      .then(async (txs) => {
        setTransactions(txs);
        const ids = new Set();
        txs.forEach((t) => {
          ids.add(t.donorId === user.id ? t.receiverId : t.donorId);
        });
        const map = {};
        await Promise.all([...ids].map(async (id) => {
          map[id] = await getUserById(id);
        }));
        setPartners(map);
      })
      .finally(() => setLoading(false));
  }, [getUserTransactions, user.id]);

  if (loading) return <LoadingSpinner text="Loading transactions..." />;

  return (
    <div className="page container">
      <div className="page-header">
        <h1>Transaction History</h1>
        <p>All payments monitored through the payment gateway.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-panel card"><p>No transactions yet.</p></div>
      ) : (
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Gateway Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isDonor = tx.donorId === user.id;
                const cpId = isDonor ? tx.receiverId : tx.donorId;
                return (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`tx-type ${isDonor ? 'sent' : 'received'}`}>
                        {isDonor ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {isDonor ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td>{partners[cpId]?.fullName || 'Unknown'}</td>
                    <td className="tx-amount">${Number(tx.amount).toLocaleString()}</td>
                    <td><code>{tx.gatewayRef}</code></td>
                    <td><span className={`status-pill status-${tx.status}`}>{tx.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
