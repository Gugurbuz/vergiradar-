
import React from 'react';
// FIX: Add AnomalyDomain to imports to support domain-specific badges.
import { BulguSeverity, CaseStatus, BulguDomain } from '../../types';

interface BadgeProps {
  // FIX: Add AnomalyDomain to the union type for the 'type' prop to allow domain badges.
  type: BulguSeverity | CaseStatus | BulguDomain;
}

const Badge: React.FC<BadgeProps> = ({ type }) => {
  const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full inline-block';

  const typeStyles: Record<string, string> = {
    [BulguSeverity.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [BulguSeverity.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [BulguSeverity.Low]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [CaseStatus.Open]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [CaseStatus.InProgress]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [CaseStatus.PendingEvidence]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    [CaseStatus.Closed]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    // FIX: Add styles for AnomalyDomain to support rendering domain-specific badges.
    [BulguDomain.VAT]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    [BulguDomain.Invoice]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    [BulguDomain.Payroll]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    [BulguDomain.Bank]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  };

  return (
    <span className={`${baseClasses} ${typeStyles[type]}`}>
      {type}
    </span>
  );
};

export default Badge;