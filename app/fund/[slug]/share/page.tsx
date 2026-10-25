import { redirect } from "next/navigation"

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  redirect(`/fund/${encodeURIComponent(slug)}`)
}