import React, { useState, useEffect } from 'react';
import { schedulesAPI, binsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiCheckCircle
} from 'react-icons/fi';

const Schedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [bins, setBins] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    bin_id: '',
    collector_id: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    route: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchSchedules();
    fetchBins();
    if (user?.role === 'admin') {
      fetchCollectors();
    }
  }, [filterStatus]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await schedulesAPI.getAll(params);
      setSchedules(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBins = async () => {
    try {
      const response = await binsAPI.getAll();
      setBins(response.data.data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  const fetchCollectors = async () => {
    try {
      const response = await usersAPI.getAll();
      const collectorUsers = response.data.data.filter(u => u.role === 'collector');
      setCollectors(collectorUsers);
    } catch (error) {
      console.error('Error fetching collectors:', error);
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
    try {
      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule.id, formData);
        toast.success('Schedule updated successfully');
      } else {
        await schedulesAPI.create(formData);
        toast.success('Schedule created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      toast.error(editingSchedule ? 'Failed to update schedule' : 'Failed to create schedule');
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      bin_id: schedule.bin_id,
      collector_id: schedule.collector_id || '',
      scheduled_date: schedule.scheduled_date.split('T')[0],
      scheduled_time: schedule.scheduled_time.substring(0, 5),
      route: schedule.route || '',
      status: schedule.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await schedulesAPI.delete(id);
        toast.success('Schedule deleted successfully');
        fetchSchedules();
      } catch (error) {
        toast.error('Failed to delete schedule');
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      await schedulesAPI.update(id, updateData);
      toast.success('Status updated successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      bin_id: '',
      collector_id: '',
      scheduled_date: '',
      scheduled_time: '09:00',
      route: '',
      status: 'pending'
    });
    setEditingSchedule(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collection Schedules</h1>
          <p className="text-gray-600 mt-1">Manage waste collection schedules</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <FiPlus />
            <span>Add Schedule</span>
          </button>
        )}
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
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setFilterStatus('')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Schedule Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <FiCalendar className="text-primary-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {schedule.bin_location || 'Unknown Location'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-gray-400" />
                          <span>{formatDate(schedule.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiClock className="text-gray-400" />
                          <span>{schedule.scheduled_time}</span>
                        </div>
                        {schedule.collector_name && (
                          <div className="flex items-center space-x-2">
                            <FiUser className="text-gray-400" />
                            <span>{schedule.collector_name}</span>
                          </div>
                        )}
                        {schedule.route && (
                          <div className="flex items-center space-x-2">
                            <FiMapPin className="text-gray-400" />
                            <span>{schedule.route}</span>
                          </div>
                        )}
                        {schedule.completed_at && (
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle className="text-green-500" />
                            <span>Completed: {formatDate(schedule.completed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Change Buttons */}
                  {user?.role === 'collector' && schedule.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(schedule.id, 'in_progress')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Start
                    </button>
                  )}
                  {user?.role === 'collector' && schedule.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Complete
                    </button>
                  )}

                  {/* Edit Button */}
                  {(user?.role === 'admin' || user?.role === 'collector') && schedule.status !== 'completed' && (
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      <FiEdit2 size={14} />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(schedule.id)}
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

      {schedules.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FiCalendar className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600">No schedules found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Bin</option>
                      {bins.map((bin) => (
                        <option key={bin.id} value={bin.id}>
                          {bin.location} - {bin.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {user?.role === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Collector
                      </label>
                      <select
                        name="collector_id"
                        value={formData.collector_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Assign Later</option>
                        {collectors.map((collector) => (
                          <option key={collector.id} value={collector.id}>
                            {collector.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      name="scheduled_date"
                      value={formData.scheduled_date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      name="scheduled_time"
                      value={formData.scheduled_time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

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
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route Description
                    </label>
                    <textarea
                      name="route"
                      value={formData.route}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter route details..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
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

export default Schedules;