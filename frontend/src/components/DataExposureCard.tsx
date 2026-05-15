import type { ReactNode } from 'react'
import { Building, Database, MapPin, Phone, User } from 'lucide-react'
import { ThreatCard } from '~/components/ThreatCard'
import type { ThreatProfile } from '~/data/mockData'

type DataExposureCardProps = {
  data: ThreatProfile['dataExposure']
}

export function DataExposureCard({ data }: DataExposureCardProps) {
  const dataExposure = data

  return (
    <ThreatCard
      title={dataExposure.cardTitle}
      description={dataExposure.cardDescription}
      score={dataExposure.score}
      icon={<Database className="h-4 w-4 text-warning" />}
      aiExplanation={dataExposure.aiExplanation}
    >
      <div className="space-y-2">
        <FieldRow icon={<User className="h-4 w-4 text-text-muted" />} label="Name" value={dataExposure.fields.name} />
        <FieldRow icon={<MapPin className="h-4 w-4 text-text-muted" />} label="Address" value={dataExposure.fields.address} />
        <FieldRow icon={<Phone className="h-4 w-4 text-text-muted" />} label="Phone" value={dataExposure.fields.phone} />
        <FieldRow icon={<Building className="h-4 w-4 text-text-muted" />} label="Employer" value={dataExposure.fields.employer} />
      </div>
      <div className="mt-3 rounded-xl border border-warning-strong/35 bg-warning-strong/20 px-2 py-2 text-xs text-warning">
        This data is legally purchasable by anyone for under $1
      </div>
    </ThreatCard>
  )
}

function FieldRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="text-text-muted">{label}:</span>
      <span className="font-mono text-sm text-text-secondary">{value}</span>
    </div>
  )
}
