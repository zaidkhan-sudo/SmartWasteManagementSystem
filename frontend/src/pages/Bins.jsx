import React, { useState, useEffect } from 'react';
import { binsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiFilter,
  FiSearch
} from 'react-icons/fi';

const Bins = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    location: '',
    latitude: '',
    longitude: '',
    type: 'general',
    capacity: 100,
    fill_level: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchBins();
  }, [filterType, filterStatus]);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;

      const response = await binsAPI.getAll(params);
      setBins(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch bins');
      console.error('Error fetching bins:', error);
    } finally {
      setLoading(false);
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
      if (editingBin) {
        await binsAPI.update(editingBin.id, formData);
        toast.success('Bin updated successfully');
      } else {
        await binsAPI.create(formData);
        toast.success('Bin created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBins();
    } catch (error) {
      toast.error(editingBin ? 'Failed to update bin' : 'Failed to create bin');
      console.error('Error saving bin:', error);
    }
  };

  const handleEdit = (bin) => {
    setEditingBin(bin);
    setFormData({
      location: bin.location,
      latitude: bin.latitude,
      longitude: bin.longitude,
      type: bin.type,
      capacity: bin.capacity,
      fill_level: bin.fill_level,
      status: bin.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bin?')) {
      try {
        await binsAPI.delete(id);
        toast.success('Bin deleted successfully');
        fetchBins();
      } catch (error) {
        toast.error('Failed to delete bin');
        console.error('Error deleting bin:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      location: '',
      latitude: '',
      longitude: '',
      type: 'general',
      capacity: 100,
      fill_level: 0,
      status: 'active'
    });
    setEditingBin(null);
  };

  const getFillLevelColor = (level) => {
    if (level >= 90) return 'bg-red-500';
    if (level >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredBins = bins.filter(bin =>
    bin.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Bins</h1>
          <p className="text-gray-600 mt-1">Manage all waste bins in the system</p>
        </div>
        {(user?.role === 'admin') && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <FiPlus />
            <span>Add New Bin</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="recyclable">Recyclable</option>
            <option value="organic">Organic</option>
            <option value="hazardous">Hazardous</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterStatus('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bins Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBins.map((bin) => (
            <div key={bin.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
              {/* Bin Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <FiTrash2 className="text-primary-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bin.location}</h3>
                    <p className="text-sm text-gray-500 capitalize">{bin.type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  bin.status === 'active' ? 'bg-green-100 text-green-800' :
                  bin.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bin.status}
                </span>
              </div>

              {/* Fill Level */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fill Level</span>
                  <span className="font-semibold text-gray-900">{bin.fill_level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getFillLevelColor(bin.fill_level)}`}
                    style={{ width: `${bin.fill_level}%` }}
                  ></div>
                </div>
              </div>

              {/* Bin Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <FiMapPin className="mr-2" />
                  <span>{bin.latitude}, {bin.longitude}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Capacity: <span className="font-medium">{bin.capacity}L</span>
                </div>
              </div>

              {/* Actions */}
              {(user?.role === 'admin' || user?.role === 'collector') && (
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(bin)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <FiEdit2 size={14} />
                    <span>Edit</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(bin.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {bins.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FiTrash2 className="mx-auto text-gray-400 text-5xl mb-4" />
          <p className="text-gray-600">No bins found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingBin ? 'Edit Bin' : 'Add New Bin'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Main Street & 5th Avenue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="general">General</option>
                      <option value="recyclable">Recyclable</option>
                      <option value="organic">Organic</option>
                      <option value="hazardous">Hazardous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="40.7128"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="-74.0060"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity (L) *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fill Level (%) *
                    </label>
                    <input
                      type="number"
                      name="fill_level"
                      value={formData.fill_level}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    {editingBin ? 'Update Bin' : 'Create Bin'}
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

export default Bins;
