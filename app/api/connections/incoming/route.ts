import { NextResponse } from "next/server";

import { createServerSupabase } from "../../../lib/serverSupabase";



export async function GET() {


  try {


    const supabase = await createServerSupabase();



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



    const userId = user.id;




    const {
      data,
      error
    } = await supabase


      .from("connections")


      .select(`

        id,
        status,
        created_at,

        sender:profiles!connections_sender_id_fkey(
          id,
          username,
          avatar_url
        )

      `)


      .eq(
        "receiver_id",
        userId
      )


      .eq(
        "status",
        "pending"
      );





    if(error){


      


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

      requests:data

    });





  } catch(error){


    


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