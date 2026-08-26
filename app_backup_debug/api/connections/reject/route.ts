import { NextResponse } from "next/server";

import { createServerSupabase } from "../../../lib/serverSupabase";


export async function POST(
  req: Request
) {


  try {


    const supabase = await createServerSupabase();


    const body = await req.json();


    const {
      connectionId
    } = body;



    if(!connectionId){

      return NextResponse.json(
        {
          error:"Missing connectionId"
        },
        {
          status:400
        }
      );

    }




    const { data, error } = await supabase

      .from("connections")

      .update({

        status:"rejected"

      })

      .eq(
        "id",
        connectionId
      )

      .select()

      .single();





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

      connection:data

    });



  } catch(error){


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