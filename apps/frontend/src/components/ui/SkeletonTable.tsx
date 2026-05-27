interface Props {
  rows?: number;
  columns?: number;
}

export default function SkeletonTable({ rows = 5, columns = 5 }: Props) {
  return (
    <div className="animate-pulse overflow-x-auto">
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-gray-700">
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c} className="p-4">
                  <div className="h-4 bg-gray-700 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
