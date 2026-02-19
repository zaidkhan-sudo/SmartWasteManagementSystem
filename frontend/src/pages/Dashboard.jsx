import React, { useState, useEffect } from 'react';
import { analyticsAPI, binsAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiTrash2,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiTrendingUp
} from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBins, setRecentBins] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, binsResponse, reportsResponse] = await Promise.all([
        analyticsAPI.getDashboard(user?.token),
        binsAPI.getAll({ limit: 5, token: user?.token }),
        reportsAPI.getAll({ limit: 5, token: user?.token })
      ]);

      setStats(statsResponse.data.data);
      setRecentBins(binsResponse.data.data);
      setRecentReports(reportsResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100">
          Here's what's happening with waste management today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bins */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiTrash2 className="text-blue-600 text-2xl" />
            </div>
            <span className="text-sm text-gray-500">Total Bins</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats?.bins.total || 0}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.bins.highPriority || 0} need attention
          </p>
        </div>

        {/* Total Schedules */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCalendar className="text-green-600 text-2xl" />
            </div>
            <span className="text-sm text-gray-500">Schedules</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats?.schedules.total || 0}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.schedules.recentCollections || 0} completed this week
          </p>
        </div>

        {/* Total Reports */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiAlertCircle className="text-yellow-600 text-2xl" />
            </div>
            <span className="text-sm text-gray-500">Reports</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{stats?.reports.total || 0}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.reports.byStatus?.find(s => s.status === 'pending')?.count || 0} pending
          </p>
        </div>

        {/* Efficiency */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiTrendingUp className="text-purple-600 text-2xl" />
            </div>
            <span className="text-sm text-gray-500">Efficiency</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">
            {stats?.schedules.total > 0
              ? Math.round((stats?.schedules.recentCollections / stats?.schedules.total) * 100)
              : 0}%
          </h3>
          <p className="text-sm text-gray-500 mt-2">Collection rate</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bin Types Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bin Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.bins.byType || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="type"
              >
                {stats?.bins.byType?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Schedule Status */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.schedules.byStatus || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Bins */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">High Priority Bins</h3>
          <div className="space-y-3">
            {recentBins
              .filter(bin => bin.fill_level > 70)
              .slice(0, 5)
              .map((bin) => (
                <div key={bin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${bin.fill_level > 90 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{bin.location}</p>
                      <p className="text-sm text-gray-500 capitalize">{bin.type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{bin.fill_level}%</span>
                </div>
              ))}
            {recentBins.filter(bin => bin.fill_level > 70).length === 0 && (
              <p className="text-gray-500 text-center py-4">All bins are in good condition</p>
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {recentReports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className={`mt-1 ${
                    report.priority === 'critical' ? 'text-red-500' :
                    report.priority === 'high' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{report.issue_type}</p>
                    <p className="text-sm text-gray-500">{report.bin_location}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
            ))}
            {recentReports.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent reports</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
