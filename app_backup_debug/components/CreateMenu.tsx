'use client'

import { useEffect, useRef } from 'react'
import { Radio, Sparkles, X } from 'lucide-react'


type CreateMenuProps = {
  onClose: () => void
  onCreateSelect: (mode: 'post' | 'prediction') => void
}



export default function CreateMenu({
  onClose,
  onCreateSelect,
}: CreateMenuProps) {


  const menuRef = useRef<HTMLDivElement>(null)



  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose()
      }

    }


    document.addEventListener(
      'mousedown',
      handleClickOutside
    )


    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )

    }

  }, [onClose])




  return (

    <div
      ref={menuRef}
      className="
        absolute
        bottom-24
        left-1/2
        -translate-x-1/2
        z-50
        animate-in
        fade-in
        slide-in-from-bottom-4
        zoom-in-95
        duration-200
      "
    >



      <div
        className="
          relative
          w-72
          overflow-hidden
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--background)]/95
          backdrop-blur-xl
          shadow-xl
        "
      >




        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            px-4
            pb-2
            pt-4
          "
        >

          <h3
            className="
              text-[15px]
              font-bold
              tracking-wide
              text-[var(--foreground)]
            "
          >
            Create Content
          </h3>



          <button

            onClick={onClose}

            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-[var(--surface)]
              text-[var(--muted)]
              transition-colors
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--foreground)]
            "

          >

            <X size={14}/>

          </button>


        </div>






        {/* LINE */}

        <div
          className="
            mx-4
            h-px
            bg-[var(--border)]
          "
        />






        {/* OPTIONS */}


        <div
          className="
            space-y-1
            p-2
          "
        >




          {/* TRANSMIT */}


          <button

            onClick={() => {
              onClose()
              onCreateSelect('post')
            }}

            className="
              group
              flex
              w-full
              items-center
              gap-3.5
              rounded-xl
              px-3
              py-3
              text-left
              transition-all
              duration-150
              hover:bg-[var(--surface-hover)]
              active:scale-[0.99]
            "

          >


            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-500/10
                ring-1
                ring-blue-500/20
                text-blue-500
                transition-all
                duration-200
                group-hover:bg-blue-500
                group-hover:text-white
              "
            >

              <Radio
                size={18}
                className="
                  transition-transform
                  group-hover:scale-105
                "
              />

            </div>





            <div className="min-w-0 flex-1">

              <p
                className="
                  text-[14px]
                  font-semibold
                  text-[var(--foreground)]
                "
              >
                Transmit Live
              </p>


              <p
                className="
                  mt-0.5
                  truncate
                  text-[11px]
                  font-medium
                  text-[var(--muted)]
                "
              >
                Start a live broadcast to your feed
              </p>


            </div>



          </button>









          {/* PREDICT */}



          <button

            onClick={() => {
              onClose()
              onCreateSelect('prediction')
            }}

            className="
              group
              flex
              w-full
              items-center
              gap-3.5
              rounded-xl
              px-3
              py-3
              text-left
              transition-all
              duration-150
              hover:bg-[var(--surface-hover)]
              active:scale-[0.99]
            "

          >


            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-emerald-500/10
                ring-1
                ring-emerald-500/20
                text-emerald-500
                transition-all
                duration-200
                group-hover:bg-emerald-500
                group-hover:text-white
              "
            >

              <Sparkles
                size={18}
                className="
                  transition-transform
                  group-hover:scale-105
                "
              />

            </div>





            <div className="min-w-0 flex-1">


              <p
                className="
                  text-[14px]
                  font-semibold
                  text-[var(--foreground)]
                "
              >
                Predict Forecast
              </p>



              <p
                className="
                  mt-0.5
                  truncate
                  text-[11px]
                  font-medium
                  text-[var(--muted)]
                "
              >
                Publish a speculative prediction
              </p>


            </div>


          </button>



        </div>


      </div>






      {/* POINTER */}

      <div
        className="
          absolute
          -bottom-1.5
          left-1/2
          h-3
          w-3
          -translate-x-1/2
          rotate-45
          bg-[var(--background)]
          border-r
          border-b
          border-[var(--border)]
        "
      />


    </div>

  )

}