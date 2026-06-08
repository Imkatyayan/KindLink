import { createContext, useCallback, useContext, useState } from 'react';
import * as api from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  const refreshPosts = useCallback(async (filters) => {
    const data = await api.getAllPosts(filters);
    setPosts(data);
    return data;
  }, []);

  const refreshUsers = useCallback(async () => {
    const data = await api.getAllUsers();
    setUsers(data);
    return data;
  }, []);

  const refreshPendingUsers = useCallback(async () => {
    return api.getPendingUsers();
  }, []);

  const refreshTransactions = useCallback(async () => {
    const data = await api.getAllTransactions();
    setTransactions(data);
    return data;
  }, []);

  const refreshAdminStats = useCallback(async () => {
    const stats = await api.getAdminStats();
    setAdminStats(stats);
    return stats;
  }, []);

  const addPost = useCallback(async (postData) => {
    const post = await api.createPost(postData);
    await refreshPosts();
    return post;
  }, [refreshPosts]);

  const getMatches = useCallback(async () => api.getMatchingPosts(), []);

  const getUserPosts = useCallback(async () => api.getMyPosts(), []);

  const verifyUser = useCallback(async (userId, status) => {
    const updated = await api.updateUserStatus(userId, status);
    await refreshUsers();
    return updated;
  }, [refreshUsers]);

  const getConversation = useCallback(async (partnerId) => api.getMessages(partnerId), []);

  const postMessage = useCallback(async (receiverId, content) => {
    return api.sendMessage(receiverId, content);
  }, []);

  const getConversations = useCallback(async () => api.getConversations(), []);

  const makePayment = useCallback(async (paymentData) => {
    const transaction = await api.processPayment(paymentData);
    return transaction;
  }, []);

  const getUserTransactions = useCallback(async () => api.getMyTransactions(), []);

  return (
    <DataContext.Provider
      value={{
        posts,
        users,
        transactions,
        adminStats,
        refreshPosts,
        refreshUsers,
        refreshPendingUsers,
        refreshTransactions,
        refreshAdminStats,
        addPost,
        getMatches,
        getUserPosts,
        verifyUser,
        getConversation,
        postMessage,
        getConversations,
        makePayment,
        getUserTransactions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
