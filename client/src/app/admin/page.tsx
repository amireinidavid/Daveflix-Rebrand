"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
} from "recharts";
import {
  Users,
  Film,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  Award,
  Calendar,
  Globe,
  Clock3,
  Star,
  TrendingDown,
  AlertTriangle,
  Settings,
} from "lucide-react";

// Dummy data for charts
const monthlyUserData = [
  { name: "Jan", users: 4000 },
  { name: "Feb", users: 4200 },
  { name: "Mar", users: 5800 },
  { name: "Apr", users: 6800 },
  { name: "May", users: 7300 },
  { name: "Jun", users: 8200 },
  { name: "Jul", users: 8900 },
  { name: "Aug", users: 9600 },
  { name: "Sep", users: 10400 },
  { name: "Oct", users: 11200 },
  { name: "Nov", users: 12100 },
  { name: "Dec", users: 13500 },
];

const revenueData = [
  { name: "Jan", revenue: 15000 },
  { name: "Feb", revenue: 18000 },
  { name: "Mar", revenue: 22000 },
  { name: "Apr", revenue: 25000 },
  { name: "May", revenue: 27000 },
  { name: "Jun", revenue: 29000 },
  { name: "Jul", revenue: 32000 },
  { name: "Aug", revenue: 34000 },
  { name: "Sep", revenue: 37000 },
  { name: "Oct", revenue: 41000 },
  { name: "Nov", revenue: 45000 },
  { name: "Dec", revenue: 52000 },
];

const contentViewsData = [
  { name: "Jan", movies: 12000, series: 8000 },
  { name: "Feb", movies: 13000, series: 9000 },
  { name: "Mar", movies: 15000, series: 11000 },
  { name: "Apr", movies: 17000, series: 13000 },
  { name: "May", movies: 19000, series: 15000 },
  { name: "Jun", movies: 21000, series: 17000 },
  { name: "Jul", movies: 23000, series: 19000 },
  { name: "Aug", movies: 25000, series: 21000 },
  { name: "Sep", movies: 27000, series: 23000 },
  { name: "Oct", movies: 29000, series: 25000 },
  { name: "Nov", movies: 31000, series: 27000 },
  { name: "Dec", movies: 33000, series: 29000 },
];

const genreDistributionData = [
  { name: "Action", value: 25 },
  { name: "Drama", value: 20 },
  { name: "Comedy", value: 18 },
  { name: "Sci-Fi", value: 15 },
  { name: "Horror", value: 12 },
  { name: "Romance", value: 10 },
];

const COLORS = [
  "#e60a15",
  "#ff4d6b",
  "#ff7a8c",
  "#ff9eac",
  "#ffc2cc",
  "#ffe5e9",
];

const mostWatchedMovies = [
  { title: "Inception", views: 1250000, genre: "Sci-Fi", rating: 4.8 },
  {
    title: "The Shawshank Redemption",
    views: 980000,
    genre: "Drama",
    rating: 4.9,
  },
  { title: "The Dark Knight", views: 870000, genre: "Action", rating: 4.7 },
  { title: "Pulp Fiction", views: 760000, genre: "Crime", rating: 4.6 },
  { title: "Fight Club", views: 650000, genre: "Drama", rating: 4.5 },
];

// New dummy data
const deviceUsageData = [
  { device: "Mobile", value: 45 },
  { device: "Desktop", value: 30 },
  { device: "Smart TV", value: 20 },
  { device: "Tablet", value: 5 },
];

const watchTimeData = [
  { name: "Mon", hours: 4.2 },
  { name: "Tue", hours: 3.8 },
  { name: "Wed", hours: 4.5 },
  { name: "Thu", hours: 5.2 },
  { name: "Fri", hours: 6.8 },
  { name: "Sat", hours: 7.5 },
  { name: "Sun", hours: 7.2 },
];

const userRetentionData = [
  { month: "1", retention: 100 },
  { month: "2", retention: 80 },
  { month: "3", retention: 70 },
  { month: "4", retention: 65 },
  { month: "5", retention: 60 },
  { month: "6", retention: 58 },
  { month: "7", retention: 55 },
  { month: "8", retention: 52 },
  { month: "9", retention: 50 },
  { month: "10", retention: 48 },
  { month: "11", retention: 47 },
  { month: "12", retention: 45 },
];

const geographicDistributionData = [
  { country: "USA", users: 5200 },
  { country: "UK", users: 2100 },
  { country: "Canada", users: 1800 },
  { country: "Australia", users: 1200 },
  { country: "Germany", users: 950 },
  { country: "France", users: 850 },
  { country: "Brazil", users: 720 },
  { country: "Japan", users: 680 },
];

const contentPerformanceData = [
  { name: "Action", rating: 4.5, completion: 85, engagement: 75 },
  { name: "Comedy", rating: 4.2, completion: 80, engagement: 70 },
  { name: "Drama", rating: 4.7, completion: 90, engagement: 80 },
  { name: "Horror", rating: 3.9, completion: 75, engagement: 65 },
  { name: "Sci-Fi", rating: 4.6, completion: 88, engagement: 78 },
];

const systemAlertsData = [
  {
    id: 1,
    severity: "High",
    message: "Storage capacity reaching 85%",
    time: "2 hours ago",
    icon: <AlertTriangle className="text-red-500" size={18} />,
  },
  {
    id: 2,
    severity: "Medium",
    message: "CDN performance degraded in Asia region",
    time: "5 hours ago",
    icon: <TrendingDown className="text-yellow-500" size={18} />,
  },
  {
    id: 3,
    severity: "Low",
    message: "New content encoding queue backup",
    time: "1 day ago",
    icon: <Clock3 className="text-blue-500" size={18} />,
  },
];

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              <h3 className="text-2xl font-bold mt-1">13,500</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm font-medium">+12.5%</span>
            <span className="text-muted-foreground text-sm ml-2">
              from last month
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Content
              </p>
              <h3 className="text-2xl font-bold mt-1">2,845</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Film className="text-orange-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm font-medium">+8.2%</span>
            <span className="text-muted-foreground text-sm ml-2">
              from last month
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Subscriptions
              </p>
              <h3 className="text-2xl font-bold mt-1">9,274</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm font-medium">+5.7%</span>
            <span className="text-muted-foreground text-sm ml-2">
              from last month
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </p>
              <h3 className="text-2xl font-bold mt-1">$52,000</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-500 text-sm font-medium">+15.3%</span>
            <span className="text-muted-foreground text-sm ml-2">
              from last month
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyUserData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e60a15" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#e60a15" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#e60a15"
                  fillOpacity={1}
                  fill="url(#userGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Revenue</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Views Chart */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Content Views</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentViewsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="movies" fill="#e60a15" name="Movies" />
                <Bar dataKey="series" fill="#3b82f6" name="Series" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Distribution Chart */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Genre Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {genreDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value}%`, "Percentage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Watched Movies */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4">Most Watched Movies</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Views
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Genre
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {mostWatchedMovies.map((movie, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{movie.title}</td>
                  <td className="py-3 px-4">{movie.views.toLocaleString()}</td>
                  <td className="py-3 px-4">{movie.genre}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {movie.rating}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
              <Users size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-muted-foreground">
                John Doe - 2 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mr-4">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">New premium subscription</p>
              <p className="text-xs text-muted-foreground">
                Sarah Johnson - 3 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mr-4">
              <Film size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">New content added</p>
              <p className="text-xs text-muted-foreground">
                The Matrix Resurrections - 5 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-secondary/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mr-4">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">Content milestone reached</p>
              <p className="text-xs text-muted-foreground">
                Inception reached 1M views - 8 hours ago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Engagement Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watch Time by Day */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">
            Average Daily Watch Time
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={watchTimeData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `${value} hours`,
                    "Average Watch Time",
                  ]}
                />
                <Bar
                  dataKey="hours"
                  fill="#8884d8"
                  background={{ fill: "#444" }}
                  radius={[4, 4, 0, 0]}
                >
                  {watchTimeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`rgba(230, 10, 21, ${0.5 + index * 0.07})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Retention */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">User Retention Rate</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userRetentionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="month"
                  stroke="#888"
                  label={{
                    value: "Month",
                    position: "insideBottomRight",
                    offset: -10,
                  }}
                />
                <YAxis
                  stroke="#888"
                  label={{
                    value: "Retention %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value}%`, "Retention Rate"]}
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#e60a15"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Device Usage & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Usage */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Device Usage</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {deviceUsageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value}%`, "Usage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">
            Geographic Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={geographicDistributionData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#888" />
                <YAxis
                  dataKey="country"
                  type="category"
                  stroke="#888"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Content Performance Radar & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Performance Radar */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">
            Content Performance by Genre
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={contentPerformanceData}
              >
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="name" stroke="#888" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
                <Radar
                  name="Rating (x20)"
                  dataKey="rating"
                  stroke="#e60a15"
                  fill="#e60a15"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Completion Rate"
                  dataKey="completion"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Engagement Score"
                  dataKey="engagement"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(22, 22, 22, 0.9)",
                    borderColor: "#333",
                    color: "#fff",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">System Alerts</h2>
          <div className="space-y-4">
            {systemAlertsData.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center p-4 bg-secondary/30 rounded-lg border-l-4 border-l-red-500"
              >
                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center mr-4">
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        alert.severity === "High"
                          ? "bg-red-500/20 text-red-500"
                          : alert.severity === "Medium"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 text-sm text-center text-muted-foreground hover:text-foreground transition-colors">
              View All Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
            <Film size={24} className="mb-2 text-primary" />
            <span className="text-sm font-medium">Add Content</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
            <Users size={24} className="mb-2 text-blue-500" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
            <TrendingUp size={24} className="mb-2 text-green-500" />
            <span className="text-sm font-medium">View Reports</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
            <Settings size={24} className="mb-2 text-orange-500" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
