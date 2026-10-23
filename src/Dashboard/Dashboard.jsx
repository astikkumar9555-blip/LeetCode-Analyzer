import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Code2,
  Flame,
  Home,
  LogOut,
  Settings,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import TopicAnalysis from "./TopicAnalysis";
import { getCurrentUser, logout } from "../Components/auth";
import "./Dashboard.css";

const difficultyData = [
  { name: "Easy", value: 92, color: "#4bc99b" },
  { name: "Medium", value: 78, color: "#f2ad42" },
  { name: "Hard", value: 16, color: "#ff6685" },
];

const activityData = [
  { day: "Mon", solved: 3 },
  { day: "Tue", solved: 5 },
  { day: "Wed", solved: 2 },
  { day: "Thu", solved: 6 },
  { day: "Fri", solved: 4 },
  { day: "Sat", solved: 8 },
  { day: "Sun", solved: 3 },
];

function StatCard({ icon: Icon, label, value, detail, color }) {
  return (
    <article className="stat-card">
      <div className={`stat-label ${color}`}>
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function DifficultyChart() {
  const total = difficultyData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="dash-card">
      <div className="dashboard-heading">
        <Code2 size={19} />
        <h2>Problems solved</h2>
      </div>

      <div className="difficulty-layout">
        <div className="difficulty-donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={difficultyData}
                dataKey="value"
                nameKey="name"
                innerRadius="68%"
                outerRadius="92%"
                paddingAngle={3}
                stroke="none"
              >
                {difficultyData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="donut-label">
            <strong>{total}</strong>
            <span>SOLVED</span>
          </div>
        </div>

        <div className="difficulty-bars">
          {difficultyData.map((item) => (
            <div className="difficulty-item" key={item.name}>
              <div className="difficulty-text">
                <strong style={{ color: item.color }}>{item.name}</strong>
                <span>{item.value}</span>
              </div>

              <div className="difficulty-track">
                <div
                  style={{
                    width: `${(item.value / total) * 100}%`,
                    background: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="sample-note">
        Illustrative values · Replace with real statistics later
      </p>
    </section>
  );
}

function ActivityChart() {
  return (
    <section className="dash-card">
      <div className="dashboard-heading">
        <Activity size={19} />
        <h2>Practice activity</h2>
      </div>

      <div className="activity-summary">
        <strong>31</strong>
        <span>problems solved this week</span>
      </div>

      <div className="activity-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activityData}
            margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b7cff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b7cff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#282936"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: "#858797", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#858797", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#151620",
                border: "1px solid #30313d",
                borderRadius: 8,
                color: "#fff",
              }}
            />

            <Area
              type="monotone"
              dataKey="solved"
              stroke="#8b7cff"
              strokeWidth={2.5}
              fill="url(#activityFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="sample-note">
        Example activity data · Not live LeetCode submissions
      </p>
    </section>
  );
}

function ConsistencyCalendar() {
  const cells = Array.from({ length: 364 }, (_, index) => {
    const level = (index * 17 + Math.floor(index / 7) * 13) % 11;

    return {
      id: index,
      level:
        level < 4 ? 0 : level < 7 ? 1 : level < 9 ? 2 : level === 9 ? 3 : 4,
    };
  });

  return (
    <section className="dash-card calendar-card">
      <div className="dashboard-heading">
        <CalendarDays size={19} />
        <h2>Consistency calendar</h2>
      </div>

      <div className="calendar-summary">
        <span>
          <strong>92</strong> active days
        </span>
        <span>Best streak: 8 days</span>
      </div>

      <div className="calendar-months">
        {[
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ].map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>

      <div className="calendar-content">
        <div className="calendar-weekdays">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        <div className="calendar-grid">
          {cells.map((cell) => (
            <div
              key={cell.id}
              className={`activity-cell level-${cell.level}`}
              title="Illustrative activity"
            />
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        Less
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`activity-cell level-${level}`} />
        ))}
        More
      </div>

      <p className="sample-note">
        Decorative sample calendar · Connect actual submission history later
      </p>
    </section>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const initialName = currentUser?.username || "ashutosh_dev";

  const [username, setUsername] = useState(initialName);
  const [displayName, setDisplayName] = useState(initialName);
  const [notice, setNotice] = useState("");

  function handleAnalyze(event) {
    event.preventDefault();

    const cleanName = username.trim().replace(/^@/, "");

    if (!cleanName) {
      setNotice("Please enter a LeetCode username.");
      return;
    }

    setDisplayName(cleanName);
    setNotice(
      `Profile label updated to @${cleanName}. Statistics still use sample data.`
    );
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="leetcode-dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="brand-logo">LL</div>
          <span>
            LEET<span>LENS</span>
          </span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <button
          className="sidebar-link"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Home size={18} /> Overview
        </button>
        <button className="sidebar-link active">
          <BarChart3 size={18} /> Analytics
        </button>
        <button className="sidebar-link" onClick={() => scrollTo("topic-analysis")}>
          <Brain size={18} /> Topic skills
        </button>
        <button className="sidebar-link" onClick={() => scrollTo("practice-plan")}>
          <BookOpen size={18} /> Study plan
        </button>
        <button
          className="sidebar-link"
          onClick={() => setNotice("Achievements will be added in a future version.")}
        >
          <Trophy size={18} /> Achievements
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Target size={19} />
            <strong>Practice with purpose</strong>
            <p>Use your coding patterns to decide what to practise next.</p>
          </div>

          <button
            className="sidebar-link"
            onClick={() => setNotice("Settings will be added in a future version.")}
          >
            <Settings size={18} /> Settings
          </button>

          <button className="sidebar-link logout-link" onClick={handleLogout}>
            <LogOut size={18} /> Log out
          </button>

          <div className="dashboard-profile">
            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>@{displayName}</strong>
              <small>{currentUser?.email || "Frontend prototype"}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <BarChart3 size={20} />
            <strong>Analytics</strong>
            <span className="beta-label">BETA</span>
          </div>
          <span className="prototype-status">
            <i /> Frontend prototype
          </span>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">YOUR CODING JOURNEY</span>
              <h1>
                Performance <span>overview.</span>
              </h1>
              <p>
                Understand your patterns. Find your weak spots. Practise with
                purpose.
              </p>
            </div>

            <form className="username-form" onSubmit={handleAnalyze}>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="LeetCode username"
                aria-label="LeetCode username"
              />
              <button type="submit">Analyze ↗</button>
            </form>
          </section>

          {notice && (
            <div className="dashboard-notice">
              {notice}
              <button onClick={() => setNotice("")}>×</button>
            </div>
          )}

          <section className="stats-grid">
            <StatCard
              icon={Code2}
              label="TOTAL SOLVED"
              value="186"
              detail="Across all difficulties"
              color="purple"
            />
            <StatCard
              icon={Activity}
              label="ACCEPTANCE RATE"
              value="64%"
              detail="Sample submission accuracy"
              color="blue"
            />
            <StatCard
              icon={Flame}
              label="CURRENT STREAK"
              value="8 days"
              detail="Keep your momentum going"
              color="orange"
            />
            <StatCard
              icon={Zap}
              label="ACTIVE DAYS"
              value="92"
              detail="Days with coding activity"
              color="gold"
            />
          </section>

          <section className="dashboard-two-column">
            <DifficultyChart />
            <ActivityChart />
          </section>

          <ConsistencyCalendar />

          <div id="topic-analysis">
            <TopicAnalysis />
          </div>

          <section className="dash-card practice-plan" id="practice-plan">
            <div className="dashboard-heading">
              <Target size={19} />
              <h2>Your next steps</h2>
            </div>

            <div className="practice-step">
              <span>01</span>
              <div>
                <strong>Review your weakest topics</strong>
                <p>Start with Graphs and Dynamic Programming in this sample.</p>
              </div>
            </div>

            <div className="practice-step">
              <span>02</span>
              <div>
                <strong>Practise consistently</strong>
                <p>Choose a manageable daily target and track your progress.</p>
              </div>
            </div>

            <div className="practice-step">
              <span>03</span>
              <div>
                <strong>Revisit previously solved problems</strong>
                <p>Check whether you can explain the solution without hints.</p>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            LEETLENS · FRONTEND PROTOTYPE
            <span>Sample data · Not connected to LeetCode</span>
          </footer>
        </div>
      </main>
    </div>
  );
}