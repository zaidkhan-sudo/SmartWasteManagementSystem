import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiCalendar } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'collector':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your profile information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-12">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <FiUser className="text-primary-600 text-5xl" />
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">{user?.name}</h2>
              <p className="text-primary-100 mt-1">{user?.email}</p>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)} bg-opacity-90`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiUser className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiMail className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-lg font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiPhone className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">
                  {user?.phone || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiShield className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-lg font-medium text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4 md:col-span-2">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiMapPin className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-lg font-medium text-gray-900">
                  {user?.address || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiCalendar className="text-gray-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-medium text-gray-900">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Description */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-3">
          {user?.role === 'admin' && (
            <>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Full access to all system features</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Manage bins, schedules, and reports</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Access analytics and system insights</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Manage user accounts and permissions</span>
              </div>
            </>
          )}

          {user?.role === 'collector' && (
            <>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>View and update collection schedules</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Update bin status and fill levels</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>Manage and resolve reports</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>View assigned routes and tasks</span>
              </div>
            </>
          )}

          {user?.role === 'citizen' && (
            <>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>View waste bin locations and status</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Report issues with bins</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>View collection schedules</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Track your submitted reports</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Statistics Card (Optional) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Account Status</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">Active</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Profile Complete</p>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {user?.phone && user?.address ? '100%' : '75%'}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Role Level</p>
            <p className="text-2xl font-bold text-purple-900 mt-2 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;