import { useState, useEffect, useCallback } from 'react';
import { getUpgradeRequestsAPI, approveUpgradeRequestAPI, rejectUpgradeRequestAPI } from '../services/admin';

/**
 * Custom hook to manage fetching and updating role upgrade requests for Admin
 * @param {number} pollingIntervalMs - Frequency of polling requests in ms (default 3000ms)
 */
export function useAdminRequests(pollingIntervalMs = 3000) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncRequests = useCallback(async () => {
    try {
      const data = await getUpgradeRequestsAPI();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch upgrade requests:", err);
      setError(err.message || "Failed to fetch upgrade requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(syncRequests, 0);

    let intervalId;
    if (pollingIntervalMs) {
      intervalId = setInterval(syncRequests, pollingIntervalMs);
    }

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [syncRequests, pollingIntervalMs]);

  const approveRequest = async (requestId) => {
    const confirmApprove = window.confirm("Are you sure you want to APPROVE this upgrade request?");
    if (!confirmApprove) return false;
    try {
      await approveUpgradeRequestAPI(requestId);
      await syncRequests();
      return true;
    } catch (err) {
      const errMsg = err.message || "Failed to approve request";
      alert(errMsg);
      return false;
    }
  };

  const rejectRequest = async (requestId) => {
    const reason = prompt("Enter the reason for rejection:");
    if (reason === null) return false; // User clicked Cancel
    try {
      await rejectUpgradeRequestAPI(requestId, reason);
      await syncRequests();
      return true;
    } catch (err) {
      const errMsg = err.message || "Failed to reject request";
      alert(errMsg);
      return false;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const resolvedRequests = requests.filter((r) => r.status !== 'PENDING');

  return {
    requests,
    pendingRequests,
    resolvedRequests,
    loading,
    error,
    syncRequests,
    approveRequest,
    rejectRequest
  };
}
