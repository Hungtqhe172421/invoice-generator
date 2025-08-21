// components/SkeletonRow.tsx
import React from "react";

interface SkeletonRowProps {
  columns: number;
}

export default function SkeletonRow({ columns }: SkeletonRowProps) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}
