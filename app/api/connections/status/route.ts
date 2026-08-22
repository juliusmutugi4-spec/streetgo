import { NextResponse } from "next/server";

import { createServerSupabase } from "../../../lib/serverSupabase";


export async function POST(
  req:Request
){


  try{


    const supabase =
      await createServerSupabase();



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



    const {
      otherUserId
    } = await req.json();




    const {
      data
    } = await supabase

      .from("connections")

      .select(
        "status,sender_id,receiver_id"
      )

      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )

      .maybeSingle();





    return NextResponse.json({

      status:
        data?.status || "none"

    });



  }catch(error){


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