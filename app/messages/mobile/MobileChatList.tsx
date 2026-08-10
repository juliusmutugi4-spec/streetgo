'use client'

type Conversation = {
  userId: string
  username: string
  avatar_url: string | null
  lastMessage: string
  created_at: string
  unreadCount: number
  isOnline: boolean
  lastSeen: string | null
}

type MobileChatListProps = {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conversation: Conversation) => void
}

export default function MobileChatList({
  conversations,
  selectedId,
  onSelect,
}: MobileChatListProps) {

return (
<div className="flex flex-col h-full bg-[#050b12]">


{/* Header */}
<div
className="
h-[72px]
px-5
flex
items-center
justify-between
border-b
border-white/10
bg-[#08131d]
"
>

<div>
<h1 className="text-xl font-bold text-white">
Messages
</h1>

<p className="text-[11px] text-zinc-500">
{conversations.length} conversations
</p>

</div>


<button
className="
w-9
h-9
rounded-full
bg-white/5
flex
items-center
justify-center
text-cyan-400
"
>
🔍
</button>


</div>



{/* Chat List */}

<div className="flex-1 overflow-y-auto">


{conversations.map((conv)=>(


<button
key={conv.userId}
onClick={()=>onSelect(conv)}

className={`
w-full
flex
items-center
gap-3
px-4
py-3.5
border-b
border-white/[0.04]
transition

${
selectedId === conv.userId
?
'bg-cyan-500/10'
:
'hover:bg-white/[0.03]'
}

`}
>


{/* Avatar */}

<div className="relative flex-shrink-0">


{
conv.avatar_url ? (

<img
src={conv.avatar_url}
alt={conv.username}
className="
w-12
h-12
rounded-full
object-cover
border
border-white/10
"
/>

)

:

(

<div
className="
w-12
h-12
rounded-full
bg-gradient-to-br
from-cyan-400
to-emerald-400
text-black
flex
items-center
justify-center
font-bold
"
>
{conv.username.charAt(0).toUpperCase()}
</div>

)

}



{conv.isOnline && (

<span
className="
absolute
bottom-0
right-0
w-3
h-3
rounded-full
bg-emerald-400
border-2
border-[#050b12]
"
/>

)}


</div>



{/* Text */}

<div className="flex-1 min-w-0 text-left">


<div className="flex justify-between">


<h2
className="
font-semibold
text-[14px]
text-zinc-100
truncate
"
>
{conv.username}
</h2>



<span
className="
text-[11px]
text-zinc-500
"
>
{new Date(conv.created_at)
.toLocaleTimeString([],{
hour:'2-digit',
minute:'2-digit'
})}
</span>


</div>



<div className="flex items-center justify-between gap-2">


<p
className="
text-[13px]
text-zinc-400
truncate
"
>
{conv.lastMessage || "Start chatting now"}
</p>



{
conv.unreadCount > 0 && (

<span
className="
min-w-[18px]
h-[18px]
px-1
rounded-full
bg-cyan-400
text-black
text-[10px]
font-bold
flex
items-center
justify-center
"
>
{conv.unreadCount}
</span>

)
}



</div>


</div>



</button>


))}


</div>


</div>
)

}