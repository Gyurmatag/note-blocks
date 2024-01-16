import Link from "next/link";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full font-mono text-sm lg:flex items-center justify-center">
        <Button>
          <Link href="/new">
            New Note
          </Link>
        </Button>
      </div>
    </main>
  )
}
