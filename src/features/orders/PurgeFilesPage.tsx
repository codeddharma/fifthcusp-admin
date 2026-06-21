import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { OrdersApi } from '@/lib/api/orders.api'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toApiError } from '@/lib/api/errors'

export function PurgeFilesPage() {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [lastPurged, setLastPurged] = useState<number | null>(null)

  async function run() {
    setRunning(true)
    try {
      const result = await OrdersApi.purgeFiles()
      setLastPurged(result.purged)
      toast.success(`Purged ${result.purged} order(s)`)
    } catch (e) {
      toast.error(toApiError(e).message)
    } finally {
      setRunning(false)
      setOpen(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/orders" className="text-sm text-shell-muted hover:text-shell-text">
        ← Orders
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Purge old order files</CardTitle>
        </CardHeader>
        <p className="text-sm text-shell-muted">
          Removes uploaded files from completed orders that have passed the retention window (configured on the
          backend, typically 7 days). The order record itself is kept; only the files on disk and their metadata are
          cleared.
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => setOpen(true)}>
            Run purge now
          </Button>
        </div>
        {lastPurged !== null ? (
          <p className="mt-3 text-sm">Last run purged {lastPurged} order file(s).</p>
        ) : null}
      </Card>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={run}
        title="Purge old order files"
        description="This removes file blobs from disk for completed orders past the retention window. Cannot be undone."
        confirmLabel="Purge"
        variant="danger"
        loading={running}
      />
    </div>
  )
}
