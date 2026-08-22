import { NextResponse } from "next/server";

import { createServerSupabase } from "../../lib/serverSupabase";



export async function POST(
  req: Request
) {


  try {


    const supabase = await createServerSupabase();



    // Get logged-in user

    const {
      data:{
        user
      }
    } = await supabase.auth.getUser();



    if(!user){


      return NextResponse.json(

        {
          error:"Not authenticated"
        },

        {
          status:401
        }

      );

    }




    const body = await req.json();


    const {
      receiver_id
    } = body;




    if(!receiver_id){


      return NextResponse.json(

        {
          error:"Missing receiver_id"
        },

        {
          status:400
        }

      );

    }





    // Prevent self connection

    if(user.id === receiver_id){


      return NextResponse.json(

        {
          error:"Cannot connect with yourself"
        },

        {
          status:400
        }

      );

    }





    // Check existing connection

    const {
      data: existing
    } = await supabase


      .from("connections")


      .select(
        "id,status"
      )


      .or(

        `and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`

      )


      .maybeSingle();





    if(existing){


      return NextResponse.json(

        {

          error:"Connection already exists",

          status:existing.status

        },

        {
          status:400
        }

      );

    }





    // Create new connection

    const {
      data,
      error
    } = await supabase


      .from("connections")


      .insert({

        sender_id:user.id,

        receiver_id,

        status:"pending"

      })


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






    if(error){


      console.log(
        "CONNECTION ERROR:",
        error
      );


      return NextResponse.json(

        {
          error:error.message
        },

        {
          status:400
        }

      );


    }





    return NextResponse.json({

      success:true,

      connection:data

    });





  } catch(error){


    console.error(

      "Connection error:",

      error

    );



    return NextResponse.json(

      {
        error:"Server error"
      },

      {
        status:500
      }

    );


  }


}