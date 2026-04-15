import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, CheckCircle, XCircle, FileText, IndianRupee, 
  TrendingUp, BarChart3, PieChart, Activity, Briefcase
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    onLeave: 0,
    totalSalary: 0,
    attendanceTrend: [],
    payrollTrend: [],
    deptRanking: [],
    leaveTrend: []
  });
  const [activeTab, setActiveTab] = useState("attendance");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const res = await axios.get(`http://localhost:3001/api/dashboard/stats?date=${today}`);
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const efficiencyScore = data.totalEmployees > 0 
    ? Math.round((data.present / data.totalEmployees) * 100) 
    : 0;

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, Admin 👋</h1>
          <p>Here's what's happening with your workforce today.</p>
        </div>
        <div className="header-actions">
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon employees"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total Employees</h3>
            <p className="stat-value">{data.totalEmployees}</p>
            <span className="stat-label">People count</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon present"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h3>Present Today</h3>
            <p className="stat-value">{data.present}</p>
            <div className="mini-chart">
               <ResponsiveContainer width="100%" height={40}>
                 <AreaChart data={data.attendanceTrend || []}>
                   <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon absent"><XCircle size={24} /></div>
          <div className="stat-info">
            <h3>Absent Today</h3>
            <p className="stat-value">{data.absent}</p>
            <div className="mini-chart">
               <ResponsiveContainer width="100%" height={40}>
                 <BarChart data={(data.attendanceTrend || []).slice(-5)}>
                   <Bar dataKey="count" fill="#ef4444" radius={[2, 2, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon effect"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>Operation Effect</h3>
            <p className="stat-value">{efficiencyScore}%</p>
            <span className="stat-label">Efficiency score</span>
          </div>
        </div>
      </section>

      <main className="dashboard-main">
        <div className="main-content-area">
          <div className="chart-container">
            <div className="chart-tabs">
              <button 
                className={activeTab === "attendance" ? "active" : ""} 
                onClick={() => setActiveTab("attendance")}
              >
                Attendance
              </button>
              <button 
                className={activeTab === "leaves" ? "active" : ""} 
                onClick={() => setActiveTab("leaves")}
              >
                Leaves
              </button>
            </div>
            
            <div className="chart-wrapper">
              <h3>{activeTab === "attendance" ? "Attendance Trend" : "Leave History"}</h3>
              <ResponsiveContainer width="100%" height={300}>
                {activeTab === "attendance" ? (
                  <AreaChart data={data.attendanceTrend || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                ) : (
                  <BarChart data={data.leaveTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <aside className="dashboard-sidebar-widgets">
          <div className="widget payroll-overview">
            <div className="widget-header">
              <h3>Payroll Overview</h3>
              <IndianRupee size={20} className="icon-muted" />
            </div>
            <div className="payroll-stats">
              <div className="payroll-item">
                <span className="label">Total Salary</span>
                <span className="value">₹{data.totalSalary.toLocaleString()}</span>
              </div>
              <div className="payroll-item">
                <span className="label">Total Headcount</span>
                <span className="value">{data.totalEmployees}</span>
              </div>
              <div className="mini-bar-chart">
                <ResponsiveContainer width="100%" height={80}>
                   <BarChart data={data.payrollTrend || []}>
                     <Bar dataKey="total" fill="#6366f1" radius={[2, 2, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="widget dept-ranking">
            <div className="widget-header">
              <h3>Department Ranking</h3>
              <Briefcase size={20} className="icon-muted" />
            </div>
            <div className="dept-list">
              {(data.deptRanking || []).map((dept, index) => (
                <div key={dept.name} className="dept-item">
                  <div className="dept-rank">{index + 1}</div>
                  <div className="dept-info">
                    <span className="dept-name">{dept.name}</span>
                    <span className="dept-count">{dept.count} employees</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;