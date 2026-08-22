import { NextResponse } from "next/server";

import { createServerSupabase } from "../../../lib/serverSupabase";


export async function POST(
  req: Request
) {

  try {


    const supabase = await createServerSupabase();



    // Get logged-in user

    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();



    if (!user) {

      return NextResponse.json(

        {
          success: false,
          error: "Not authenticated"
        },

        {
          status: 401
        }

      );

    }




    const body = await req.json();


    const {
      connectionId
    } = body;



    if (!connectionId) {


      return NextResponse.json(

        {
          success: false,
          error: "Missing connectionId"
        },

        {
          status: 400
        }

      );

    }




    // Accept connection

    const {
      data,
      error
    } = await supabase


      .from("connections")


      .update({

        status: "accepted"

      })


      .eq(
        "id",
        connectionId
      )


      .eq(
        "receiver_id",
        user.id
      )


      .select(`

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

      `)


      .single();





    if (error) {


      console.log(
        "ACCEPT ERROR:",
        error
      );


      return NextResponse.json(

        {
          success:false,
          error:error.message
        },

        {
          status:400
        }

      );

    }





    if (!data) {


      return NextResponse.json(

        {
          success:false,
          error:"Connection not found"
        },

        {
          status:404
        }

      );

    }





const connectionData: any = data;


const senderId =
  Array.isArray(connectionData.sender)
    ? connectionData.sender[0]?.id
    : connectionData.sender?.id;



const receiverId =
  Array.isArray(connectionData.receiver)
    ? connectionData.receiver[0]?.id
    : connectionData.receiver?.id;


    if (!senderId || !receiverId) {


      return NextResponse.json(

        {
          success:false,
          error:"Profile relationship missing"
        },

        {
          status:500
        }

      );

    }





    // Find the other user for chat

    const chatUserId =
      user.id === senderId
        ? receiverId
        : senderId;





    return NextResponse.json({

      success:true,

      message:"Connection accepted",

      chatUserId,

      connection:data

    });






  } catch(error) {


    console.log(
      "SERVER ERROR:",
      error
    );


    return NextResponse.json(

      {
        success:false,
        error:"Server error"
      },

      {
        status:500
      }

    );


  }

}