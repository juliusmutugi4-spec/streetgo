import Image from "next/image"

import {
  MessageCircle,
  Video,
  MapPinned,
  Users,
  Bell,
  Compass,
  UserPlus,
  PencilLine,
  Camera,
  MessagesSquare
} from "lucide-react"


export default function AboutPage() {

const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",

  "@id": "https://streetgo.app/about#about",

  name: "About StreetGO",

  url: "https://streetgo.app/about",

  description:
    "Learn about StreetGO, Kenya's social platform for communities, messaging, videos, maps, predictions, and local discovery.",

  isPartOf: {
    "@id": "https://streetgo.app/#website",
  },

  about: {
    "@id": "https://streetgo.app/#organization",
  },
}

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(schema),
  }}
/>

<div className="relative w-full h-[450px] rounded-3xl overflow-hidden mb-10 shadow-2xl">
  <Image
    src="/og-image.png"
    alt="StreetGO"
    fill
    priority
    className="object-cover"
  />

  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
    <div className="text-center text-white px-6">
      <h1 className="text-5xl md:text-6xl font-black">
        StreetGO
      </h1>

      <p className="mt-4 text-xl max-w-3xl">
        Kenya's social platform for communities, messaging, videos,
        maps, and local discovery.
      </p>
    </div>
  </div>
</div>



      <h1 className="text-4xl font-bold mb-6">
        About StreetGO
      </h1>

<h2 className="text-2xl font-semibold mt-10 mb-4">
  What is StreetGO?
</h2>

<p className="leading-8">
  StreetGO is a social networking platform developed for Kenya that brings
  together communities, messaging, maps, local discovery, videos, and user
  generated content in one place. The platform is designed to help people
  connect, communicate, share information, and discover opportunities within
  their local communities.
</p>

<h2 className="text-2xl font-semibold mt-10 mb-4">
  Our Mission
</h2>

<p className="leading-8">
  Our mission is to make it easier for people to connect with their
  communities, discover useful local information, and build meaningful
  relationships through technology.
</p>

<h2 className="text-2xl font-semibold mt-10 mb-4">
  What You Can Do on StreetGO
</h2>


<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">

  <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
    <Image
      src="/screenshot-desktop.png"
      alt="StreetGO Desktop"
      width={1600}
      height={900}
      className="w-full h-auto"
    />

    <div className="p-5 bg-zinc-950">
      <h3 className="text-xl font-bold">
        Desktop Experience
      </h3>

      <p className="text-zinc-400 mt-2">
        Browse communities, chat, explore maps, watch videos,
        and discover local content from your desktop.
      </p>
    </div>
  </div>

  <div className="rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
    <Image
      src="/screenshot-mobile.png"
      alt="StreetGO Mobile"
      width={900}
      height={1800}
      className="w-full h-auto"
    />

    <div className="p-5 bg-zinc-950">
      <h3 className="text-xl font-bold">
        Mobile Experience
      </h3>

      <p className="text-zinc-400 mt-2">
        Stay connected wherever you are with the StreetGO mobile experience.
      </p>
    </div>
  </div>

</div>


<ul className="list-disc pl-6 space-y-2 leading-8">



  <li>Share posts and updates.</li>
  <li>Upload and watch videos.</li>
  <li>Chat with other users in real time.</li>
  <li>Create and join communities.</li>
  <li>Discover places using maps.</li>
  <li>Follow creators and friends.</li>
  <li>Receive notifications.</li>
  <li>Explore local services and businesses.</li>
</ul>

<h2 className="text-2xl font-semibold mt-10 mb-4">
  Where StreetGO Operates
</h2>

<p className="leading-8">
  StreetGO is built in Kenya and is designed to serve Kenyan communities while
  being expandable to additional regions in the future.
</p>

<section className="mt-24">

  <div className="text-center mb-14">
    <h2 className="text-5xl font-black">
      StreetGO at a Glance
    </h2>

    <p className="text-zinc-400 mt-4 text-lg max-w-3xl mx-auto">
      Everything you need to connect, discover, and share in one modern platform.
    </p>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">

    <div className="rounded-3xl bg-gradient-to-br from-green-500 to-green-700 text-white p-6 text-center shadow-xl">
      <div className="text-5xl mb-4"><MessageCircle className="w-12 h-12 text-green-400 mx-auto" /></div>
      <h3 className="font-bold text-lg">Messaging</h3>
    </div>

    <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 text-center shadow-xl">
      <div className="text-5xl mb-4"><Video className="w-12 h-12 text-red-400 mx-auto" /></div>
      <h3 className="font-bold text-lg">Videos</h3>
    </div>

    <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 text-center shadow-xl">
      <div className="text-5xl mb-4"><MapPinned className="w-12 h-12 text-blue-400 mx-auto" /></div>
      <h3 className="font-bold text-lg">Maps</h3>
    </div>

    <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 text-center shadow-xl">
      <div className="text-5xl mb-4"><Users className="w-12 h-12 text-purple-400 mx-auto" /></div>
      <h3 className="font-bold text-lg">Communities</h3>
    </div>

    <div className="rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 text-center shadow-xl">
      <div className="text-5xl mb-4">📍</div>
      <h3 className="font-bold text-lg">Discovery</h3>
    </div>

    <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white p-6 text-center shadow-xl">
      <div className="text-5xl mb-4">🚀</div>
      <h3 className="font-bold text-lg">Growing Platform</h3>
    </div>

  </div>

</section>
<section className="mt-24">

  <div className="text-center mb-14">
    <h2 className="text-5xl font-black">
      How StreetGO Works
    </h2>

    <p className="text-zinc-400 mt-4 max-w-3xl mx-auto text-lg">
      Get started in just a few simple steps and become part of the StreetGO community.
    </p>
  </div>

  <div className="space-y-8">

    <div className="flex items-start gap-6">
      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl">
        👤
      </div>

      <div>
        <h3 className="text-2xl font-bold">
          1. Create Your Account
        </h3>

        <p className="text-zinc-400 mt-2">
          Sign up and create your StreetGO profile to start exploring.
        </p>
      </div>
    </div>

    <div className="ml-8 h-12 border-l-2 border-zinc-700"></div>

    <div className="flex items-start gap-6">
      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-3xl">
        <PencilLine className="w-8 h-8 text-white" />
      </div>

      <div>
        <h3 className="text-2xl font-bold">
          2. Complete Your Profile
        </h3>

        <p className="text-zinc-400 mt-2">
          Add your photo, bio, and interests to help others connect with you.
        </p>
      </div>
    </div>

    <div className="ml-8 h-12 border-l-2 border-zinc-700"></div>

    <div className="flex items-start gap-6">
      <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-3xl">
        <Camera className="w-8 h-8 text-white" />
      </div>

      <div>
        <h3 className="text-2xl font-bold">
          3. Share & Discover
        </h3>

        <p className="text-zinc-400 mt-2">
          Post updates, upload videos, explore communities, and discover local content.
        </p>
      </div>
    </div>

    <div className="ml-8 h-12 border-l-2 border-zinc-700"></div>

    <div className="flex items-start gap-6">
      <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-3xl">
        <MessagesSquare className="w-8 h-8 text-white" />💬
      </div>

      <div>
        <h3 className="text-2xl font-bold">
          4. Connect
        </h3>

        <p className="text-zinc-400 mt-2">
          Join conversations, build communities, and stay connected with people around you.
        </p>
      </div>
    </div>

  </div>

</section>

<section className="mt-24">

  <h2 className="text-4xl font-black text-center mb-12">
    Why StreetGO?
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

 

  </div>

</section>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

    <div className="rounded-3xl border border-zinc-800 p-8 bg-zinc-950">
      <div className="text-5xl mb-5">💬</div>

      <h3 className="text-2xl font-bold mb-3">
        Real-time Messaging
      </h3>

      <p className="text-zinc-400 leading-7">
        Chat instantly with friends, communities, and people around you.
      </p>
    </div>

    <div className="rounded-3xl border border-zinc-800 p-8 bg-zinc-950">
      <div className="text-5xl mb-5">🎥</div>

      <h3 className="text-2xl font-bold mb-3">
        Share Videos
      </h3>

      <p className="text-zinc-400 leading-7">
        Upload and discover engaging videos from creators and communities.
      </p>
    </div>

    <div className="rounded-3xl border border-zinc-800 p-8 bg-zinc-950">
      <div className="text-5xl mb-5">🗺️</div>

      <h3 className="text-2xl font-bold mb-3">
        Explore Maps
      </h3>

      <p className="text-zinc-400 leading-7">
        Find nearby places, people, and local opportunities across Kenya.
      </p>
    </div>

    <div className="rounded-3xl border border-zinc-800 p-8 bg-zinc-950">
      <div className="text-5xl mb-5">👥</div>

      <h3 className="text-2xl font-bold mb-3">
        Communities
      </h3>

      <p className="text-zinc-400 leading-7">
        Join groups that match your interests and connect with like-minded people.
      </p>
    </div>

    <div className="rounded-3xl border border-zinc-800 p-8 bg-zinc-950">
      <div className="text-5xl mb-5"><Bell className="w-12 h-12 text-yellow-400 mx-auto" /></div>

      <h3 className="text-2xl font-bold mb-3">
        Stay Updated
      </h3>

      <p className="text-zinc-400 leading-7">
        Receive notifications about activity, conversations, and new discoveries.
      </p>
    </div>

    <div className="rounded-3xl border border-zinc-800 p-8 bg-zinc-950">
      <div className="text-5xl mb-5"><Compass className="w-12 h-12 text-cyan-400 mx-auto" /></div>

      <h3 className="text-2xl font-bold mb-3">
        Built for Kenya
      </h3>

      <p className="text-zinc-400 leading-7">
        StreetGO is designed to connect Kenyan communities while supporting future expansion.
      </p>
    </div>

  </div>




    </main>
  )
}