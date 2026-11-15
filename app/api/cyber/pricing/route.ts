import { NextResponse } from "next/server"
import { createServerSupabase } from "../../../lib/serverSupabase"

export const dynamic = "force-dynamic"

type MerchantResult = { ok: true; merchant: { id: string; status: string } } | { ok: false; error: string; status: number }
async function getMerchant(supabase: Awaited<ReturnType<typeof createServerSupabase>>): Promise<MerchantResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: "Please sign in.", status: 401 }
  }

  const { data: merchant, error } = await supabase
    .from("cyber_merchants")
    .select("id, status")
    .eq("owner_user_id", user.id)
    .maybeSingle()

  if (error || !merchant) {
    return { ok: false, error: "Unable to verify your cyber business.", status: 404 }
  }

  return { ok: true, merchant: { id: merchant.id, status: merchant.status } }
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const result = await getMerchant(supabase)

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    const merchant = result.merchant

    const [branches, computers, branchPricing, computerPricing, packages] =
      await Promise.all([
        supabase
          .from("cyber_branches")
          .select("id, branch_name")
          .eq("merchant_id", merchant.id),

        supabase
          .from("cyber_computers")
          .select("id, computer_name, branch_id")
          .eq("merchant_id", merchant.id),

        supabase
          .from("cyber_branch_pricing")
          .select("*")
          .eq("merchant_id", merchant.id),

        supabase
          .from("cyber_computer_pricing")
          .select("*")
          .eq("merchant_id", merchant.id),

        supabase
          .from("cyber_time_packages")
          .select("*")
          .eq("merchant_id", merchant.id)
          .order("created_at", { ascending: false }),
      ])

    const errors = [
      branches.error,
      computers.error,
      branchPricing.error,
      computerPricing.error,
      packages.error,
    ].filter(Boolean)

    if (errors.length) {
      console.error("CYBER PRICING FETCH ERROR:", errors)
      return NextResponse.json(
        { error: "Unable to load pricing information." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      merchantStatus: merchant.status,
      branches: branches.data ?? [],
      computers: computers.data ?? [],
      branchPricing: branchPricing.data ?? [],
      computerPricing: computerPricing.data ?? [],
      packages: packages.data ?? [],
    })
  } catch (error) {
    console.error("CYBER PRICING GET ERROR:", error)
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const result = await getMerchant(supabase)

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    const merchant = result.merchant

    if (merchant.status !== "active") {
      return NextResponse.json(
        { error: "Your business must be approved before changing prices." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const action = body.action

    if (action === "branch_rate") {
      const branchId = String(body.branch_id ?? "")
      const rate = Number(body.hourly_rate_kes)

      if (!branchId || !Number.isFinite(rate) || rate <= 0 || rate > 100000) {
        return NextResponse.json(
          { error: "Enter a valid branch and hourly rate." },
          { status: 400 }
        )
      }

      const { data: branch } = await supabase
        .from("cyber_branches")
        .select("id")
        .eq("id", branchId)
        .eq("merchant_id", merchant.id)
        .maybeSingle()

      if (!branch) {
        return NextResponse.json(
          { error: "Branch not found." },
          { status: 404 }
        )
      }

      const { data, error } = await supabase
        .from("cyber_branch_pricing")
        .upsert(
          {
            merchant_id: merchant.id,
            branch_id: branchId,
            hourly_rate_kes: rate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "branch_id" }
        )
        .select()
        .single()

      if (error) {
        console.error("CYBER BRANCH RATE ERROR:", error)
        return NextResponse.json(
          { error: "Unable to save branch rate." },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, pricing: data })
    }

    if (action === "computer_rate") {
      const computerId = String(body.computer_id ?? "")
      const rate = Number(body.hourly_rate_kes)

      if (!computerId || !Number.isFinite(rate) || rate <= 0 || rate > 100000) {
        return NextResponse.json(
          { error: "Enter a valid computer and hourly rate." },
          { status: 400 }
        )
      }

      const { data: computer } = await supabase
        .from("cyber_computers")
        .select("id")
        .eq("id", computerId)
        .eq("merchant_id", merchant.id)
        .maybeSingle()

      if (!computer) {
        return NextResponse.json(
          { error: "Computer not found." },
          { status: 404 }
        )
      }

      const { data, error } = await supabase
        .from("cyber_computer_pricing")
        .upsert(
          {
            merchant_id: merchant.id,
            computer_id: computerId,
            hourly_rate_kes: rate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "computer_id" }
        )
        .select()
        .single()

      if (error) {
        console.error("CYBER COMPUTER RATE ERROR:", error)
        return NextResponse.json(
          { error: "Unable to save computer rate." },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, pricing: data })
    }

    if (action === "create_package") {
      const branchId = String(body.branch_id ?? "")
      const computerId = body.computer_id
        ? String(body.computer_id)
        : null
      const packageName = String(body.package_name ?? "").trim()
      const duration = Number(body.duration_minutes)
      const price = Number(body.price_kes)

      if (
        !branchId ||
        packageName.length < 2 ||
        packageName.length > 80 ||
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 1440 ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price > 100000
      ) {
        return NextResponse.json(
          { error: "Please enter valid package details." },
          { status: 400 }
        )
      }

      const { data: branch } = await supabase
        .from("cyber_branches")
        .select("id")
        .eq("id", branchId)
        .eq("merchant_id", merchant.id)
        .maybeSingle()

      if (!branch) {
        return NextResponse.json(
          { error: "Branch not found." },
          { status: 404 }
        )
      }

      if (computerId) {
        const { data: computer } = await supabase
          .from("cyber_computers")
          .select("id")
          .eq("id", computerId)
          .eq("branch_id", branchId)
          .eq("merchant_id", merchant.id)
          .maybeSingle()

        if (!computer) {
          return NextResponse.json(
            { error: "Computer does not belong to this branch." },
            { status: 400 }
          )
        }
      }

      const { data, error } = await supabase
        .from("cyber_time_packages")
        .insert({
          merchant_id: merchant.id,
          branch_id: branchId,
          computer_id: computerId,
          package_name: packageName,
          duration_minutes: duration,
          price_kes: price,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error("CYBER PACKAGE INSERT ERROR:", error)
        return NextResponse.json(
          { error: "Unable to create package." },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: true, package: data },
        { status: 201 }
      )
    }

    if (action === "update_package") {
      const packageId = String(body.package_id ?? "")
      const packageName = String(body.package_name ?? "").trim()
      const duration = Number(body.duration_minutes)
      const price = Number(body.price_kes)
      const isActive = body.is_active

      if (
        !packageId ||
        packageName.length < 2 ||
        packageName.length > 80 ||
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 1440 ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price > 100000 ||
        typeof isActive !== "boolean"
      ) {
        return NextResponse.json(
          { error: "Invalid package details." },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from("cyber_time_packages")
        .update({
          package_name: packageName,
          duration_minutes: duration,
          price_kes: price,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", packageId)
        .eq("merchant_id", merchant.id)
        .select()
        .maybeSingle()

      if (error || !data) {
        return NextResponse.json(
          { error: "Unable to update package." },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, package: data })
    }

    return NextResponse.json(
      { error: "Unknown pricing action." },
      { status: 400 }
    )
  } catch (error) {
    console.error("CYBER PRICING POST ERROR:", error)
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}

