/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    activeUsers: 0,
    aiAnalyses: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiLogs, setApiLogs] = useState([]);

  // Add API call logging
  const logApiCall = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [...prev.slice(-9), { timestamp, message, data }]);
    console.log(`[${timestamp}] ${message}`, data);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    logApiCall('🔄 Starting dashboard data fetch...');

    try {
      logApiCall('📡 Making API call to admin dashboard...');

      // Fetch main dashboard data using adminService
      const data = await adminService.getAdminDashboard();
      logApiCall('✅ Dashboard data received:', data);

      // Fetch user stats using adminService
      let userStats = null;
      try {
        userStats = await adminService.getUserStats();
        logApiCall('✅ User stats received:', userStats);
      } catch (userError) {
        logApiCall('⚠️ User stats failed:', userError.message);
      }

      // Update stats with real data
      if (data && (data.status === 'success' || data.success)) {
        const dashData = data.data || {};
        const userData = userStats?.data || {};
        
        const newStats = {
          totalUsers: userData.totalUsers || dashData.users?.total || 0,
          totalDoctors: userData.doctorCount || 0,
          totalAppointments: dashData.appointments?.total || 0,
          activeUsers: userData.activeUsers || dashData.users?.active || 0,
          aiAnalyses: dashData.ai?.totalInteractions || 0
        };

        setStats(newStats);
        logApiCall('📊 Stats updated:', newStats);
        setError(null);
      } else {
        throw new Error('Invalid data format received from API');
      }

    } catch (err) {
      const errorMsg = `Failed to fetch dashboard data: ${err.message}`;
      setError(errorMsg);
      logApiCall('❌ Error occurred:', errorMsg);
      
      // Set fallback data to show something
      setStats({
        totalUsers: 11,
        totalDoctors: 5,
        totalAppointments: 5,
        activeUsers: 10,
        aiAnalyses: 5
      });
    } finally {
      setLoading(false);
      logApiCall('🏁 Dashboard fetch completed');
    }
  };

  useEffect(() => {
    logApiCall('🚀 AdminDashboard component mounted');
    fetchDashboardData();
  }, []);

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading Admin Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Healthcare System Management Panel</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Warning: {error}</p>
              <p className="text-sm text-red-600 mt-1">Showing fallback data below. Check browser console for details.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={UsersIcon}
          color="text-blue-600"
          description="All registered users"
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.totalDoctors} 
          icon={UserGroupIcon}
          color="text-green-600"
          description="Registered healthcare providers"
        />
        <StatCard 
          title="Total Appointments" 
          value={stats.totalAppointments} 
          icon={CalendarIcon}
          color="text-purple-600"
          description="All scheduled appointments"
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={CheckCircleIcon}
          color="text-orange-600"
          description="Currently active accounts"
        />
        <StatCard 
          title="AI Analyses" 
          value={stats.aiAnalyses} 
          icon={CpuChipIcon}
          color="text-red-600"
          description="AI interactions completed"
        />
      </div>



      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          <ActivityItem message={`${stats.totalUsers} users are registered in the system`} time="Current" />
          <ActivityItem message={`${stats.totalDoctors} doctors are registered in the system`} time="Total count" />
          <ActivityItem message={`${stats.totalAppointments} appointments have been scheduled`} time="Total count" />
          <ActivityItem message={`${stats.aiAnalyses} AI analyses have been completed`} time="All time" />
          <ActivityItem message="Sample data successfully loaded into database" time="System initialized" />
        </div>
      </motion.div>


    </div>
  );
};

// Modern StatCard component with Tailwind CSS
const StatCard = ({ title, value, icon: Icon, color, description }) => {
  const getIconBackground = (colorClass) => {
    const colorMap = {
      'text-blue-600': 'bg-blue-100',
      'text-green-600': 'bg-green-100',
      'text-purple-600': 'bg-purple-100',
      'text-orange-600': 'bg-orange-100',
      'text-red-600': 'bg-red-100'
    };
    return colorMap[colorClass] || 'bg-gray-100';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
    >
      <div className={`w-12 h-12 ${getIconBackground(color)} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${color} mb-1`}>{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  );
};

// Modern ActivityItem component with Tailwind CSS
const ActivityItem = ({ message, time }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-500 hover:bg-gray-100 transition-colors duration-200"
  >
    <div className="text-sm text-gray-800 font-medium">{message}</div>
    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
      <ClockIcon className="h-3 w-3" />
      {time}
    </div>
  </motion.div>
);

export default AdminDashboard;