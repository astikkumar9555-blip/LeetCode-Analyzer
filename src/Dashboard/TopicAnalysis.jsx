import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./TopicAnalysis.css";

const initialTopics = [
  { topic: "Arrays", rate: 82, solved: 32 },
  { topic: "Strings", rate: 76, solved: 24 },
  { topic: "Binary Search", rate: 68, solved: 18 },
  { topic: "Linked List", rate: 61, solved: 15 },
  { topic: "Trees", rate: 52, solved: 12 },
  { topic: "Graphs", rate: 41, solved: 8 },
  { topic: "Dynamic Programming", rate: 34, solved: 6 },
];

export default function TopicAnalysis() {
  const [topics] = useState(initialTopics);

  const weakestTopics = [...topics]
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  const getColor = (rate) => {
    if (rate >= 70) return "#4bc99b";
    if (rate >= 50) return "#f2ad42";
    return "#ff6685";
  };

  return (
    <div className="topic-grid">
      <section className="dash-card topic-chart-card">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">SKILL BREAKDOWN</span>
            <h2>Topic performance</h2>
          </div>
          <span className="chart-tag">Success rate</span>
        </div>

        <div className="topic-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topics}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 8, bottom: 5 }}
            >
              <CartesianGrid
                stroke="#282936"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                stroke="#858797"
                fontSize={10}
              />
              <YAxis
                type="category"
                dataKey="topic"
                width={120}
                stroke="#858797"
                fontSize={10}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Success rate"]}
                contentStyle={{
                  background: "#151620",
                  border: "1px solid #30313d",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="rate" radius={[0, 5, 5, 0]} barSize={14}>
                {topics.map((item) => (
                  <Cell key={item.topic} fill={getColor(item.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="topic-note">
          Green: strong · Orange: developing · Pink: needs practice
        </p>
      </section>

      <section className="dash-card">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">YOUR NEXT MOVE</span>
            <h2>Topics to improve</h2>
          </div>
        </div>

        <p className="topic-description">
          Start with the topics where your sample success rate is lowest.
        </p>

        {weakestTopics.map((item, index) => (
          <div className="weak-topic" key={item.topic}>
            <div className="weak-topic-number">{index + 1}</div>

            <div className="weak-topic-info">
              <div className="weak-topic-title">
                <strong>{item.topic}</strong>
                <span>{item.rate}%</span>
              </div>

              <div className="topic-progress">
                <div
                  style={{
                    width: `${item.rate}%`,
                    background: getColor(item.rate),
                  }}
                />
              </div>

              <small>{item.solved} problems solved · Sample data</small>
            </div>
          </div>
        ))}

        <div className="topic-tip">
          <strong>Practice tip</strong>
          <p>
            Review the concept, solve two easy questions, and then attempt
            one medium question before moving to another topic.
          </p>
        </div>
      </section>
    </div>
  );
}