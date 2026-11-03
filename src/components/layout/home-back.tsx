import Link from 'next/link'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'

const homeClass = 'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600'
const backClass = 'inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50'

export function HomeBack({ backHref, backLabel = 'Back' }: { backHref: string; backLabel?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link href="/" className={homeClass} title="Home" aria-label="Home">
        <HomeIcon className="h-5 w-5" />
      </Link>
      <Link href={backHref} className={backClass} title={backLabel}>
        <ArrowLeftIcon className="h-5 w-5" />
        <span>{backLabel}</span>
      </Link>
    </div>
  )
}
