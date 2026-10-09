export default function StatusBadge({ status }: { status: string }) {
  return <span className={`adm-badge adm-badge-${status}`}>{status.replace("_", " ")}</span>;
}
