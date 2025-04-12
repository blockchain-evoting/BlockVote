import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userType: 'admin' | 'voter';
  details: string;
  status: 'success' | 'failed' | 'warning';
  blockchainTxId?: string;
}

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    userType: '',
    status: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // TODO: Integrate with blockchain service
      // const logs = await blockchainService.getAuditLogs();
      
      // Mock data
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'VOTE_CAST',
          userId: 'voter123',
          userType: 'voter',
          details: 'Vote cast for Presidential Election 2025',
          status: 'success',
          blockchainTxId: '0x123...abc',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: 'VOTER_VERIFICATION',
          userId: 'voter456',
          userType: 'voter',
          details: 'Voter identity verified',
          status: 'success',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          action: 'ELECTION_CREATED',
          userId: 'admin789',
          userType: 'admin',
          details: 'Created new election: Local Council Election',
          status: 'success',
        },
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Timestamp,Action,User ID,User Type,Details,Status,Blockchain TX ID\n' +
      logs.map(log => [
        log.timestamp,
        log.action,
        log.userId,
        log.userType,
        log.details,
        log.status,
        log.blockchainTxId || ''
      ].join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters =
      (!filters.startDate || new Date(log.timestamp) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(log.timestamp) <= new Date(filters.endDate)) &&
      (!filters.action || log.action === filters.action) &&
      (!filters.userType || log.userType === filters.userType) &&
      (!filters.status || log.status === filters.status);

    return matchesSearch && matchesFilters;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Actions</option>
                <option value="VOTE_CAST">Vote Cast</option>
                <option value="VOTER_VERIFICATION">Voter Verification</option>
                <option value="ELECTION_CREATED">Election Created</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                name="userType"
                value={filters.userType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Users</option>
                <option value="admin">Admin</option>
                <option value="voter">Voter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blockchain TX
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.userId}
                        <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100">
                          {log.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className="ml-2 text-sm capitalize">{log.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.blockchainTxId ? (
                          <a
                            href={`https://explorer.example.com/tx/${log.blockchainTxId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {log.blockchainTxId.slice(0, 8)}...
                            {log.blockchainTxId.slice(-6)}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
