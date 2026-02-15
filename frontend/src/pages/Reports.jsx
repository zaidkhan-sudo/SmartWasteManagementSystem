import React, { useState, useEffect } from 'react';
import { reportsAPI, binsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiX,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    byIssueType: {
      overflow: 0,
      damage: 0,
      missing: 0,
      odor: 0,
      other: 0
    }
  });

  const [formData, setFormData] = useState({
    bin_id: '',
    issue_type: 'overflow',
    description: '',
    priority: 'medium',
    status: 'pending',
    resolution_notes: ''
  });

  useEffect(() => {
    fetchReports();
    fetchBins();
  }, [filterStatus, filterPriority]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;

      const response = await reportsAPI.getAll(params);
      const reportsData = response.data.data;
      setReports(reportsData);
      
      // Calculate statistics
      calculateStatistics(reportsData);
    } catch (error) {
      toast.error('Failed to fetch reports');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (reportsData) => {
    const stats = {
      total: reportsData.length,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byIssueType: {
        overflow: 0,
        damage: 0,
        missing: 0,
        odor: 0,
        other: 0
      }
    };

    reportsData.forEach(report => {
      // Count by status
      if (report.status === 'pending') stats.pending++;
      else if (report.status === 'in_progress') stats.in_progress++;
      else if (report.status === 'resolved') stats.resolved++;
      else if (report.status === 'rejected') stats.rejected++;

      // Count by priority
      if (stats.byPriority.hasOwnProperty(report.priority)) {
        stats.byPriority[report.priority]++;
      }

      // Count by issue type
      if (stats.byIssueType.hasOwnProperty(report.issue_type)) {
        stats.byIssueType[report.issue_type]++;
      }
    });

    setStatistics(stats);
  };

  const fetchBins = async () => {
    try {
      const response = await binsAPI.getAll();
      setBins(response.data.data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.bin_id) {
      toast.error('Please select a bin location');
      return;
    }
    
    if (!formData.issue_type) {
      toast.error('Please select an issue type');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    try {
      if (editingReport) {
        const response = await reportsAPI.update(editingReport.id, formData);
        if (response.data.success) {
          toast.success('Report updated successfully');
        } else {
          toast.error(response.data.message || 'Failed to update report');
          return;
        }
      } else {
        const response = await reportsAPI.create(formData);
        if (response.data.success) {
          toast.success('Report submitted successfully');
        } else {
          toast.error(response.data.message || 'Failed to submit report');
          return;
        }
      }
      setShowModal(false);
      resetForm();
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
      
      // Handle different types of errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error('You are not authorized to perform this action');
      } else if (error.response?.status === 403) {
        toast.error('Access denied');
      } else if (error.response?.status === 400) {
        toast.error('Invalid data provided');
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(editingReport ? 'Failed to update report' : 'Failed to submit report');
      }
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      bin_id: report.bin_id,
      issue_type: report.issue_type,
      description: report.description,
      priority: report.priority,
      status: report.status,
      resolution_notes: report.resolution_notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsAPI.delete(id);
        toast.success('Report deleted successfully');
        fetchReports();
      } catch (error) {
        toast.error('Failed to delete report');
        console.error('Error deleting report:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bin_id: '',
      issue_type: 'overflow',
      description: '',
      priority: 'medium',
      status: 'pending',
      resolution_notes: ''
    });
    setEditingReport(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issue Reports</h1>
          <p className="text-gray-600 mt-1">Report and track waste management issues</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiPlus />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Reports</h3>
            <FiActivity className="text-blue-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <FiClock className="text-yellow-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{statistics.pending}</p>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.total > 0 ? ((statistics.pending / statistics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">In Progress</h3>
            <FiTrendingUp className="text-blue-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{statistics.in_progress}</p>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.total > 0 ? ((statistics.in_progress / statistics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Resolved</h3>
            <FiCheckCircle className="text-green-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-green-600">{statistics.resolved}</p>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.total > 0 ? ((statistics.resolved / statistics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
            <FiX className="text-red-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-red-600">{statistics.rejected}</p>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.total > 0 ? ((statistics.rejected / statistics.total) * 100).toFixed(1) : 0}% of total
          </p>
        </div>
      </div>

      {/* Priority & Issue Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Priority</h3>
          <div className="space-y-3">
            {Object.entries(statistics.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPriorityColor(priority)}`}
                      style={{ width: `${statistics.total > 0 ? (count / statistics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Type Breakdown */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Issue Type</h3>
          <div className="space-y-3">
            {Object.entries(statistics.byIssueType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiAlertCircle className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${statistics.total > 0 ? (count / statistics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <button
            onClick={() => {
              setFilterStatus('');
              setFilterPriority('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                {/* Report Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FiAlertCircle className="text-red-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {report.issue_type.replace('_', ' ')}
                        </h3>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(report.priority)}`}></div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                          {report.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{report.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Location:</span> {report.bin_location}
                        </div>
                        <div>
                          <span className="font-medium">Reporter:</span> {report.reporter_name}
                        </div>
                        <div>
                          <span className="font-medium">Reported:</span> {formatDate(report.created_at)}
                        </div>
                        {report.resolved_at && (
                          <div>
                            <span className="font-medium">Resolved:</span> {formatDate(report.resolved_at)}
                          </div>
                        )}
                      </div>

                      {report.resolution_notes && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">Resolution Notes:</p>
                          <p className="text-sm text-green-700">{report.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {(user?.role === 'admin' || user?.role === 'collector' || report.user_id === user?.id) && (
                    <button
                      onClick={() => handleEdit(report)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <FiEdit2 size={14} />
                      <span>Edit</span>
                    </button>
                  )}

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reports.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FiAlertCircle className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600">No reports found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingReport ? 'Edit Report' : 'Report New Issue'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bin Location *
                    </label>
                    <select
                      name="bin_id"
                      value={formData.bin_id}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingReport && user?.role === 'citizen'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Bin</option>
                      {bins.map((bin) => (
                        <option key={bin.id} value={bin.id}>
                          {bin.location} - {bin.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <select
                      name="issue_type"
                      value={formData.issue_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="overflow">Overflow</option>
                      <option value="damage">Damage</option>
                      <option value="missing">Missing</option>
                      <option value="odor">Odor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {(user?.role === 'admin' || user?.role === 'collector') && editingReport && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>

                  {(user?.role === 'admin' || user?.role === 'collector') && editingReport && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Notes
                      </label>
                      <textarea
                        name="resolution_notes"
                        value={formData.resolution_notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Add resolution notes..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    {editingReport ? 'Update Report' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;