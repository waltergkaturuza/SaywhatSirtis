import { redirect } from "next/navigation"

export default async function EditAppraisalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/hr/performance/appraisals/create?appraisalId=${id}&edit=true`)
}
