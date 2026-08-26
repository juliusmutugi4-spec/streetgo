'use client'

import { PlusSquare } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import CreateMenu from './CreateMenu'


type CreateButtonProps = {
  onCreateSelect: (
    mode: 'post' | 'prediction'
  ) => void
}



export default function CreateButton({
  onCreateSelect,
}: CreateButtonProps) {


  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)



  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {

        setShowCreateMenu(false)

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

  }, [])




  return (

    <div
      ref={containerRef}
      className="
        relative
        flex
        flex-col
        items-center
      "
    >



      {
        showCreateMenu && (

          <CreateMenu
            onClose={() => setShowCreateMenu(false)}
            onCreateSelect={onCreateSelect}
          />

        )
      }





      <button

        onClick={() =>
          setShowCreateMenu(!showCreateMenu)
        }

        className="
          group
          flex
          flex-col
          items-center
          text-[var(--accent)]
          transition-all
          duration-200
          hover:opacity-90
          active:scale-95
        "

      >



        <div

          className={`
            flex
            items-center
            justify-center
            transition-all
            duration-300

            ${
              showCreateMenu
              ?
              "rotate-45 scale-110"
              :
              "scale-100 group-hover:scale-110"
            }
          `}

        >

          <PlusSquare
            size={26}
            strokeWidth={2.2}
          />

        </div>




        <span

          className="
            mt-1
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-[var(--muted)]
            group-hover:text-[var(--foreground)]
          "

        >

          {
            showCreateMenu
            ? 'Close'
            : 'Create'
          }

        </span>



      </button>



    </div>

  )

}