"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GroupActions from "./components/GroupActions";
import SecurityInfo from "./components/SecurityInfo";
import RoundOverview from "./components/RoundOverview";
import CurrentMember from "./components/CurrentMember";
import MembersList from "./components/MembersList";
import GroupInfo from "./components/GroupInfo";
import GroupHeader from "./components/GroupHeader";
import PaymentSummary from "./components/PaymentSummary";
import { getSupabaseBrowser } from "@/app/lib/supabase-browser";
import YourPayment from "./components/YourPayment";
import GroupState from "./components/GroupState";

type Group = {
  id: string;
  group_number: string;
  name: string;
  organizer_id: string;
  member_limit: number;
  contribution_amount: number;
  frequency: "weekly" | "monthly";
  start_date: string;
  status: string;
  group_code?: string | null;
};

type CurrentRound = {
  id: string;
  round_number: number;
  status: "collecting" | "ready" | "processing" | "paid" | "failed";
  recipient_member_id: string;
  target_amount: number;
  collected_amount: number;
};

type Member = {
  id: string;
  user_id: string;
  member_number: number;
  member_code: string | null;
  payment_code: string | null
  role: "organizer" | "member";
  status: "active" | "left" | "removed";
  display_name: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  joined_at: string;
  mpesa_first_name?: string | null;
  mpesa_middle_name?: string | null;
  mpesa_last_name?: string | null;
};

type PaymentSummary = {
  pool_collected: number;
  paid_members: number;
  my_status: string;
  my_receipt: string | null;
  my_credit: number;
  total_funds_received: number;
};

type MemberPaymentStatus = {
  member_id: string
  member_number: number
  payment_status: string
  amount_paid: number
  mpesa_receipt: string | null
  paid_at: string | null
}

function GroupDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowser();

  const groupIdFromUrl = searchParams.get("groupId");

  const groupNumberFromUrl = searchParams.get("groupNumber");

  const [group, setGroup] = useState<Group | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
const [currentRound, setCurrentRound] =
  useState<CurrentRound | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    pool_collected: 0,
    paid_members: 0,
    my_status: "due",
    my_receipt: null,
    my_credit: 0,
    total_funds_received: 0,
  });

  const [memberPaymentStatuses, setMemberPaymentStatuses] = useState<
    MemberPaymentStatus[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadGroup = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * ---------------------------------------------
       * Get logged-in user
       * ---------------------------------------------
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      /*
       * ---------------------------------------------
       * Resolve group
       * ---------------------------------------------
       */

      let resolvedGroupId = groupIdFromUrl;

      /*
       * If group ID was not supplied,
       * find the group using group number.
       */

      if (!resolvedGroupId && groupNumberFromUrl) {
        const { data: groupByNumber, error: groupNumberError } = await supabase
          .from("contribution_groups")
          .select("*")
          .eq("group_number", groupNumberFromUrl)
          .maybeSingle();

        if (groupNumberError) {
          throw groupNumberError;
        }

        if (!groupByNumber) {
          throw new Error("Merry-Go-Round group not found.");
        }

        resolvedGroupId = groupByNumber.id;
      }

      /*
       * ---------------------------------------------
       * If there is still no group ID,
       * try the user's active membership.
       * ---------------------------------------------
       */

      if (!resolvedGroupId) {
        const { data: membership, error: membershipError } = await supabase
          .from("contribution_members")
          .select("group_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("joined_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        if (!membership) {
          throw new Error(
            "No active Merry-Go-Round group was found for your account.",
          );
        }

        resolvedGroupId = membership.group_id;
      }

      /*
       * ---------------------------------------------
       * Load group
       * ---------------------------------------------
       */

      const { data: groupData, error: groupError } = await supabase
        .from("contribution_groups")
        .select("*")
        .eq("id", resolvedGroupId)
        .maybeSingle();

      if (groupError) {
        throw groupError;
      }

      if (!groupData) {
        throw new Error("Merry-Go-Round group not found.");
      }

      /*
       * ---------------------------------------------
       * Load members
       * ---------------------------------------------
       */

      const { data: memberData, error: memberError } = await supabase
        .from("contribution_members")
        .select(
          `
          id,
          user_id,
          member_number,
member_code,
payment_code,
role,
          status,
          display_name,
          phone_number,
          phone_verified,
          joined_at,
          mpesa_first_name,
          mpesa_middle_name,
          mpesa_last_name
        `,
        )
        .eq("group_id", resolvedGroupId)
        .eq("status", "active")
        .order("member_number", {
          ascending: true,
        });

      if (memberError) {
        throw memberError;
      }

      /*
       * ---------------------------------------------
       * Save group/member data
       * ---------------------------------------------
       */

      setGroup(groupData);
      setMembers(memberData || []);
/*
 * ---------------------------------------------
 * Load current Merry-Go-Round round
 * ---------------------------------------------
 */
const { data: roundData, error: roundError } =
  await supabase
    .from("contribution_rounds")
    .select(
      `
        id,
        round_number,
        status,
        recipient_member_id,
        target_amount,
        collected_amount
      `
    )
    .eq("group_id", resolvedGroupId)
    .in("status", [
      "collecting",
      "ready",
      "processing",
    ])
    .order("round_number", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

if (roundError) {
  throw roundError;
}

setCurrentRound(roundData || null);
console.log("CURRENT ROUND:", roundData);
console.log("RECIPIENT MEMBER ID:", roundData?.recipient_member_id);
console.log("ACTIVE MEMBERS:", memberData);
      /*
       * ---------------------------------------------
       * Load secure payment summary
       * ---------------------------------------------
       */

      const { data: summaryData, error: summaryError } = await supabase.rpc(
        "get_merry_go_round_payment_summary",
        {
          p_group_id: resolvedGroupId,
        },
      );

      if (summaryError) {
        throw summaryError;
      }

      if (summaryData && summaryData.length > 0) {
        setPaymentSummary(summaryData[0]);
      } else {
        setPaymentSummary({
          pool_collected: 0,
          paid_members: 0,
          my_status: "due",
          my_receipt: null,
          my_credit: 0,
          total_funds_received: 0,
        });
      }

      /*
       * ---------------------------------------------
       * Load secure per-member payment statuses
       * ---------------------------------------------
       */

      const { data: memberPaymentData, error: memberPaymentError } =
        await supabase.rpc("get_merry_go_round_member_payment_status", {
          p_group_id: resolvedGroupId,
        });

      if (memberPaymentError) {
        throw memberPaymentError;
      }

      setMemberPaymentStatuses(memberPaymentData || []);
    } catch (err: any) {
      console.error("GROUP DASHBOARD ERROR:", err);

      setError(err?.message || "Unable to load Merry-Go-Round group.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * ---------------------------------------------
   * Initial load
   * ---------------------------------------------
   */

  useEffect(() => {
    loadGroup();
  }, [groupIdFromUrl, groupNumberFromUrl]);

  /*
   * ---------------------------------------------
   * Refresh
   * ---------------------------------------------
   */

  const handleRefresh = () => {
    loadGroup(true);
  };

  /*
   * ---------------------------------------------
   * Derived values
   * ---------------------------------------------
   */

  const contributionAmount = Number(group?.contribution_amount || 0);

  const memberLimit = Number(group?.member_limit || 0);

  const paidMembers = Number(paymentSummary.paid_members) || 0;

  const pool = Number(paymentSummary.pool_collected) || 0;

  const targetPool = contributionAmount * memberLimit;

  const remaining = Math.max(targetPool - pool, 0);

  const myPaymentStatus = paymentSummary.my_status || "due";

  const slotsRemaining = Math.max(memberLimit - members.length, 0);

  const progressPercent =
    targetPool > 0 ? Math.min((pool / targetPool) * 100, 100) : 0;

  const myMember = members.find((member) => member.user_id === currentUserId);

const recipientMember = currentRound?.recipient_member_id
  ? members.find(
      (member) =>
        member.id === currentRound.recipient_member_id
    )
  : null;

const recipientName = recipientMember
  ? [
      recipientMember.mpesa_first_name,
      recipientMember.mpesa_middle_name,
      recipientMember.mpesa_last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    recipientMember.display_name ||
    (recipientMember.role === "organizer"
      ? "Organizer"
      : `Member #${recipientMember.member_number}`)
  : "Pending";

const nextRecipientAmount = Number(
  currentRound?.target_amount ||
    contributionAmount * memberLimit
);

  const frequencyLabel = group?.frequency === "weekly" ? "Weekly" : "Monthly";

  const formattedStartDate = group?.start_date
    ? new Date(`${group.start_date}T00:00:00`).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const copyGroupNumber = async () => {
    if (!group?.group_number) {
      return;
    }

    try {
      await navigator.clipboard.writeText(group.group_number);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      console.error("Unable to copy group number");
    }
  };

  const statusLabel =
    myPaymentStatus === "paid"
      ? "PAID"
      : myPaymentStatus === "processing"
        ? "PROCESSING"
        : "DUE";

  const statusClass =
    myPaymentStatus === "paid"
      ? "bg-emerald-950 text-emerald-400"
      : myPaymentStatus === "processing"
        ? "bg-blue-950 text-blue-400"
        : "bg-amber-950 text-amber-400";

  /*
   * ---------------------------------------------
   * Loading / Error
   * ---------------------------------------------
   */

  if (loading) {
    return <GroupState loading={true} error={null} />;
  }

  if (error || !group) {
    return (
      <GroupState
        loading={false}
        error={error || "Merry-Go-Round group not found."}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        {/* ----------------------------------------- */}
        {/* HEADER */}
        {/* ----------------------------------------- */}

        <GroupActions
          refreshing={refreshing}
          onBack={() => router.back()}
          onRefresh={handleRefresh}
        />

        <GroupHeader
          group={group}
          contributionAmount={contributionAmount}
          frequencyLabel={frequencyLabel}
          copied={copied}
          onCopyGroupNumber={copyGroupNumber}
        />
        {/* ----------------------------------------- */}
        {/* PAYMENT SUMMARY */}
        {/* ----------------------------------------- */}

        <PaymentSummary
          paymentSummary={paymentSummary}
          pool={pool}
          targetPool={targetPool}
          progressPercent={progressPercent}
          paidMembers={paidMembers}
          memberLimit={memberLimit}
          slotsRemaining={slotsRemaining}
         
        />
        {/* ----------------------------------------- */}
        {/* YOUR PAYMENT */}
        {/* ----------------------------------------- */}

        <YourPayment
          myPaymentStatus={myPaymentStatus}
          receipt={paymentSummary.my_receipt}
          contributionAmount={contributionAmount}
          groupId={group.id}
        />
        <GroupInfo
          group={group}
          frequencyLabel={frequencyLabel}
          formattedStartDate={formattedStartDate}
        />
<MembersList
  members={members}
  memberPaymentStatuses={memberPaymentStatuses}
  currentUserId={currentUserId}
  memberLimit={group.member_limit}
  slotsRemaining={slotsRemaining}
  contributionAmount={Number(group.contribution_amount || 0)}
  nextRecipient={recipientMember}
  nextRecipientAmount={nextRecipientAmount}
/>

        <CurrentMember member={myMember} />
        <RoundOverview
          targetPool={targetPool}
          pool={pool}
          remaining={remaining}
          recipientName={recipientName}
        />
        <SecurityInfo />
      </div>
    </main>
  );
}

/*
 * ---------------------------------------------
 * LOADING STATE FOR SUSPENSE
 * ---------------------------------------------
 */

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-64 rounded-xl bg-white/10" />
          <div className="h-40 rounded-3xl bg-white/5" />
          <div className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    </main>
  );
}

/*
 * ---------------------------------------------
 * PAGE
 * ---------------------------------------------
 */

export default function GroupDashboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <GroupDashboardContent />
    </Suspense>
  );
}
