import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/_authenticated/students/$id")({ component: () => <ComingSoon title="سجل الطالب" /> });
