import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"


export async function GET() {

  try {

    const dataPath = path.join(
      process.cwd(),
      "data"
    )


    const readJSON = (file:string)=>{

      const filePath = path.join(
        dataPath,
        file
      )


      if(!fs.existsSync(filePath)){
        return null
      }


      const content =
        fs.readFileSync(
          filePath,
          "utf-8"
        )


      return JSON.parse(content)

    }



    const monitor =
      readJSON(
        "starlink_direct_cell_monitor.json"
      )


    const history =
      readJSON(
        "direct_cell_history.json"
      )


    const score =
      readJSON(
        "direct_cell_signal_score.json"
      )


    const dashboard =
      readJSON(
        "streetgo_satellite_dashboard.json"
      )


    return NextResponse.json({

      status:"online",

      source:{
        celestrak:true,
        satnogs:true,
        streetgo_lab:true
      },


      opportunity:
        score ??
        dashboard ??
        null,


      starlink:
        monitor ??
        null,


      history:
        history ??
        null,


      updated:
        new Date().toISOString()

    })


  } catch(error){


    return NextResponse.json(
      {
        status:"error",
        message:
          error instanceof Error
          ? error.message
          : "Unknown error"
      },
      {
        status:500
      }
    )

  }

}