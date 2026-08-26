import { NextResponse } from "next/server"

import { createServerSupabase } from "../../lib/serverSupabase"

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()

    // =========================================================
    // AUTHENTICATE USER
    // =========================================================

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      )
    }

    // =========================================================
    // READ REQUEST
    // =========================================================

    const body = await req.json()

    const { receiver_id } = body

    if (!receiver_id) {
      return NextResponse.json(
        {
          error: "Missing receiver_id",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================================
    // PREVENT SELF-CONNECTION
    // =========================================================

    if (user.id === receiver_id) {
      return NextResponse.json(
        {
          error: "Cannot connect with yourself",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================================
    // FIND EXISTING CONNECTION BETWEEN THESE USERS
    // =========================================================

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("connections")
      .select(
        `
          id,
          status,
          sender_id,
          receiver_id,
          created_at
        `
      )
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

    if (existingError) {
      console.error(
        "EXISTING CONNECTION CHECK ERROR:",
        existingError
      )

      return NextResponse.json(
        {
          error:
            "Unable to check existing connection.",
        },
        {
          status: 500,
        }
      )
    }

    // =========================================================
    // PENDING
    // =========================================================

    if (existing?.status === "pending") {
      return NextResponse.json(
        {
          error:
            "A connection request is already pending.",
          status: "pending",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================================
    // ACCEPTED
    // =========================================================

    if (existing?.status === "accepted") {
      return NextResponse.json(
        {
          error:
            "You are already connected with this person.",
          status: "accepted",
        },
        {
          status: 400,
        }
      )
    }

    // =========================================================
    // REJECTED
    //
    // The database has a unique connection pair.
    //
    // Therefore we REUSE the existing row instead of
    // inserting another row.
    // =========================================================

    if (existing?.status === "rejected") {
      const {
        data,
        error,
      } = await supabase
        .from("connections")
        .update({
          sender_id: user.id,
          receiver_id,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select(
          `
            id,
            status,
            created_at,

            sender:profiles!connections_sender_id_fkey(
              id,
              username,
              avatar_url
            ),

            receiver:profiles!connections_receiver_id_fkey(
              id,
              username,
              avatar_url
            )
          `
        )
        .single()

      if (error) {
        console.error(
          "REJECTED CONNECTION REACTIVATION ERROR:",
          error
        )

        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: 400,
          }
        )
      }

      

      return NextResponse.json({
        success: true,
        connection: data,
      })
    }

    // =========================================================
    // NO EXISTING CONNECTION
    //
    // Create the first request.
    // =========================================================

    const {
      data,
      error,
    } = await supabase
      .from("connections")
      .insert({
        sender_id: user.id,
        receiver_id,
        status: "pending",
      })
      .select(
        `
          id,
          status,
          created_at,

          sender:profiles!connections_sender_id_fkey(
            id,
            username,
            avatar_url
          ),

          receiver:profiles!connections_receiver_id_fkey(
            id,
            username,
            avatar_url
          )
        `
      )
      .single()

    if (error) {
      console.error(
        "CONNECTION INSERT ERROR:",
        error
      )

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      )
    }

    // =========================================================
    // SUCCESS
    // =========================================================

    return NextResponse.json({
      success: true,
      connection: data,
    })
  } catch (error) {
    console.error(
      "Connection error:",
      error
    )

    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    )
  }
}