"use client";
import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Eye } from 'lucide-react';
import { ValidationIssue } from '@/hooks/useValidationRules';

interface ValidationIndicatorProps {
  issues: ValidationIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    errors: number;
    warnings: number;
    info: number;
  };
  onOpenPanel: () => void;
  showIssueMarkers?: boolean;
  onToggleMarkers?: () => void;
}

const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  issues,
  summary,
  onOpenPanel,
  showIssueMarkers = true,
  onToggleMarkers
}) => {
  const getStatusColor = () => {
    if (summary.critical > 0) return 'bg-red-600 hover:bg-red-700';
    if (summary.high > 0) return 'bg-red-500 hover:bg-red-600';
    if (summary.medium > 0) return 'bg-yellow-500 hover:bg-yellow-600';
    if (summary.low > 0) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const getStatusIcon = () => {
    if (summary.critical > 0 || summary.high > 0) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (summary.medium > 0) {
      return <AlertCircle className="w-4 h-4" />;
    }
    if (summary.low > 0) {
      return <Info className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (summary.total === 0) return 'All Clear';
    if (summary.critical > 0) return `${summary.critical} Critical`;
    if (summary.high > 0) return `${summary.high} High`;
    if (summary.medium > 0) return `${summary.medium} Medium`;
    return `${summary.low} Low`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-40">
      {/* Main validation status button */}
      <button
        onClick={onOpenPanel}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-white shadow-lg transition-colors ${getStatusColor()}`}
        title={`${summary.total} validation issues found. Click to view details.`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
          {summary.total > 0 && summary.total !== summary.critical && summary.total !== summary.high && summary.total !== summary.medium && summary.total !== summary.low && (
            <span className="ml-1">({summary.total})</span>
          )}
        </span>
      </button>

      {/* Toggle issue markers button */}
      {onToggleMarkers && summary.total > 0 && (
        <button
          onClick={onToggleMarkers}
          className={`p-2 rounded-full text-white shadow-lg transition-colors ${
            showIssueMarkers 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
          title={showIssueMarkers ? 'Hide issue markers' : 'Show issue markers'}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* Quick summary tooltip on hover */}
      {summary.total > 0 && (
        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          <div className="text-center">
            {summary.critical > 0 && <div className="text-red-400">Critical: {summary.critical}</div>}
            {summary.high > 0 && <div className="text-red-300">High: {summary.high}</div>}
            {summary.medium > 0 && <div className="text-yellow-300">Medium: {summary.medium}</div>}
            {summary.low > 0 && <div className="text-blue-300">Low: {summary.low}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationIndicator;