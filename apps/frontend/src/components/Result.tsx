import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Bot, Sparkles, User } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";

function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={cn(
                "animate-shimmer rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.08] via-50% to-white/[0.03] bg-[length:200%_100%]",
                className,
            )}
        />
    );
}

function ResultSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            {/* Score card skeleton */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <div className="flex items-start justify-between gap-6">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-9 w-16" />
                </div>
                <div className="mt-6 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[75%]" />
                    <Skeleton className="h-4 w-[85%]" />
                </div>
            </div>

            {/* Transcript skeleton */}
            <div>
                <Skeleton className="mb-4 h-4 w-28" />
                <div className="flex flex-col gap-4">
                    {/* AI message */}
                    <div className="flex gap-3">
                        <Skeleton className="size-8 shrink-0 rounded-full" />
                        <Skeleton className="h-16 w-[70%] rounded-2xl rounded-tl-sm" />
                    </div>
                    {/* User message */}
                    <div className="flex flex-row-reverse gap-3">
                        <Skeleton className="size-8 shrink-0 rounded-full" />
                        <Skeleton className="h-12 w-[55%] rounded-2xl rounded-tr-sm" />
                    </div>
                    {/* AI message */}
                    <div className="flex gap-3">
                        <Skeleton className="size-8 shrink-0 rounded-full" />
                        <Skeleton className="h-20 w-[65%] rounded-2xl rounded-tl-sm" />
                    </div>
                    {/* User message */}
                    <div className="flex flex-row-reverse gap-3">
                        <Skeleton className="size-8 shrink-0 rounded-full" />
                        <Skeleton className="h-10 w-[45%] rounded-2xl rounded-tr-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ResultData {
    transcript: { type: "Assistant" | "User"; content: string; createdAt: string }[];
    score: number;
    feedback: string;
    status: "Done" | "InProgress" | "Pre";
}

export function Result() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<ResultData>({
        score: 0,
        feedback: "",
        transcript: [],
        status: "Pre",
    });

    useEffect(() => {
        const fetchResult = () =>
            axios.get(`${BACKEND_URL}/api/v1/result/${interviewId}`).then((response) => {
                setResult(response.data);
                return response.data.status as ResultData["status"];
            });

        fetchResult();
        const intervalId = setInterval(async () => {
            const s = await fetchResult();
            if (s === "Done") clearInterval(intervalId);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [interviewId]);

    const ready = result.status === "Done";

    return (
        <main className="min-h-screen">
            <Navbar minimal />
            <div className="mx-auto max-w-3xl px-6 pt-24 pb-12">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Interview Results</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your feedback and full conversation transcript.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="border-white/10 hover:bg-white/5"
                >
                    New interview
                </Button>
            </header>

            {!ready ? (
                <div>
                    <div className="mb-8 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4">
                        <div className="relative flex size-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                            <span className="relative inline-flex size-2.5 rounded-full bg-violet-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Analyzing your interview — this usually takes a few seconds…
                        </p>
                    </div>
                    <ResultSkeleton />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Score + feedback */}
                    <section className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Sparkles className="size-4 text-violet-400" />
                                AI Feedback
                            </div>
                            <div className="flex shrink-0 items-baseline gap-1">
                                <span className="text-3xl font-bold tracking-tight">
                                    {result.score}
                                </span>
                                <span className="text-sm text-muted-foreground">/ 10</span>
                            </div>
                        </div>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                            {result.feedback}
                        </p>
                    </section>

                    {/* Transcript */}
                    <section>
                        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                            Conversation
                        </h2>
                        <div className="flex flex-col gap-4">
                            {result.transcript.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No messages were recorded for this interview.
                                </p>
                            )}
                            {result.transcript.map((m, i) => {
                                const isAi = m.type === "Assistant";
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex gap-3",
                                            isAi ? "justify-start" : "flex-row-reverse",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "grid size-8 shrink-0 place-items-center rounded-full text-white",
                                                isAi
                                                    ? "bg-gradient-to-br from-violet-400 to-indigo-600"
                                                    : "bg-gradient-to-br from-emerald-300 to-teal-600",
                                            )}
                                        >
                                            {isAi ? (
                                                <Bot className="size-4" />
                                            ) : (
                                                <User className="size-4" />
                                            )}
                                        </div>
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                                isAi
                                                    ? "rounded-tl-sm bg-card text-foreground"
                                                    : "rounded-tr-sm bg-primary text-primary-foreground",
                                            )}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}
            </div>
        </main>
    );
}
