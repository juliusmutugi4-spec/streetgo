import ProfileClient from "./ProfileClient"
import ProfileSchema from "../../components/ProfileSchema"

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default async function Page({
  params,
}: PageProps) {
  const { username } = await params

  return (
    <>
      <ProfileSchema
        username={username}
        bio=""
        avatar=""
      />

      <ProfileClient />
    </>
  )
}