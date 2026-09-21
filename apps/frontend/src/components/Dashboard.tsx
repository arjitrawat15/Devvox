import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import {
  FileText,
  TrendingUp,
  Trophy,
  Flame,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "motion/react";

interface DashboardStats {
  total_interviews: number;
  average_score: number;
  best_score: number;
  current_streak: number;
}

interface DashboardInterview {
  id: string;
  date: string;
  score: number;
  status: string;
  feedback: string | null;
  github_metadata: { repos?: string[]; username?: string } | null;
}

interface DashboardData {
  stats: DashboardStats;
  interviews: DashboardInterview[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
    >
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={`size-4 ${color}`} />
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
      </div>
    </motion.div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : score >= 5
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {score}/10
    </span>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-background/95 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <p className="font-medium text-foreground">{data.label}</p>
      <p className="text-muted-foreground">
        Score: <span className="text-violet-400">{data.score}/10</span>
      </p>
      {data.repo && (
        <p className="text-muted-foreground/60 text-xs">{data.repo}</p>
      )}
    </div>
  );
}

export function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }
    axios
      .get(`${BACKEND_URL}/api/v1/dashboard`)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = [...data.interviews]
    .filter((i) => i.status === "Done")
    .reverse()
    .map((i) => {
      const meta = i.github_metadata;
      const repo =
        meta?.repos?.[0] || meta?.username || "Interview";
      return {
        label: new Date(i.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: i.score,
        repo,
      };
    });

  const hasInterviews = data.interviews.length > 0;

  return (
    <main className="min-h-screen">
      <Navbar minimal />
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasInterviews
                ? "Here's how your interview practice is going."
                : "Start your first interview to see your progress here."}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Total Interviews"
              value={String(data.stats.total_interviews)}
              color="text-violet-400"
            />
            <StatCard
              icon={TrendingUp}
              label="Average Score"
              value={String(data.stats.average_score)}
              sub="/ 10"
              color="text-indigo-400"
            />
            <StatCard
              icon={Trophy}
              label="Best Score"
              value={String(data.stats.best_score)}
              sub="/ 10"
              color="text-amber-400"
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={String(data.stats.current_streak)}
              sub={data.stats.current_streak === 1 ? "interview" : "interviews"}
              color="text-emerald-400"
            />
          </div>

          {/* Chart */}
          {chartData.length >= 2 && (
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-6"
            >
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                Score Trend
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgb(139, 92, 246)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(139, 92, 246)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="rgb(139, 92, 246)"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                    dot={{
                      fill: "rgb(139, 92, 246)",
                      stroke: "rgb(30, 30, 40)",
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      fill: "rgb(139, 92, 246)",
                      stroke: "white",
                      strokeWidth: 2,
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Interview History Table */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <div className="border-b border-white/5 px-6 py-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                Interview History
              </h2>
            </div>

            {!hasInterviews ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <FileText className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No interviews yet. Start your first one!
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="mt-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700"
                >
                  Start Interview
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left text-xs text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Project</th>
                      <th className="px-6 py-3 font-medium">Score</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.interviews.map((interview) => {
                      const meta = interview.github_metadata;
                      const project =
                        meta?.repos?.[0] ||
                        meta?.username ||
                        "—";
                      return (
                        <tr
                          key={interview.id}
                          className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4 text-foreground">
                            {new Date(interview.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {project}
                          </td>
                          <td className="px-6 py-4">
                            {interview.status === "Done" ? (
                              <ScoreBadge score={interview.score} />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs ${
                                interview.status === "Done"
                                  ? "text-emerald-400"
                                  : interview.status === "InProgress"
                                    ? "text-amber-400"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {interview.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {interview.status === "Done" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/result/${interview.id}`)
                                }
                                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                              >
                                View
                                <ExternalLink className="size-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
