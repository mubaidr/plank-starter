"use client";
import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ValidationIssue } from '@/hooks/useValidationRules';

interface ValidationMarkersProps {
  issues: ValidationIssue[];
  visible: boolean;
  onIssueClick: (issue: ValidationIssue) => void;
  zoom: number;
  pan: { x: number; y: number };
}

const ValidationMarkers: React.FC<ValidationMarkersProps> = ({
  issues,
  visible,
  onIssueClick,
  zoom,
  pan
}) => {
  if (!visible || issues.length === 0) return null;

  const getMarkerColor = (issue: ValidationIssue) => {
    switch (issue.severity) {
      case 'critical':
        return '#DC2626'; // red-600
      case 'high':
        return '#EF4444'; // red-500
      case 'medium':
        return '#F59E0B'; // yellow-500
      case 'low':
        return '#3B82F6'; // blue-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  const getMarkerIcon = (issue: ValidationIssue) => {
    switch (issue.severity) {
      case 'critical':
      case 'high':
        return (
          <AlertTriangle 
            className="w-4 h-4" 
            fill="currentColor"
            stroke="white"
            strokeWidth="1"
          />
        );
      case 'medium':
        return (
          <AlertCircle 
            className="w-4 h-4" 
            fill="currentColor"
            stroke="white"
            strokeWidth="1"
          />
        );
      case 'low':
        return (
          <Info 
            className="w-4 h-4" 
            fill="currentColor"
            stroke="white"
            strokeWidth="1"
          />
        );
      default:
        return (
          <AlertCircle 
            className="w-4 h-4" 
            fill="currentColor"
            stroke="white"
            strokeWidth="1"
          />
        );
    }
  };

  const getMarkerSize = (issue: ValidationIssue) => {
    switch (issue.severity) {
      case 'critical':
        return 32;
      case 'high':
        return 28;
      case 'medium':
        return 24;
      case 'low':
        return 20;
      default:
        return 24;
    }
  };

  // Filter issues that have positions
  const positionedIssues = issues.filter(issue => issue.position);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {positionedIssues.map((issue) => {
        if (!issue.position) return null;

        const markerSize = getMarkerSize(issue);
        const markerColor = getMarkerColor(issue);
        
        // Transform position based on zoom and pan
        const x = (issue.position.x * zoom) + pan.x;
        const y = (issue.position.y * zoom) + pan.y;

        return (
          <div
            key={issue.id}
            className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: x,
              top: y,
              width: markerSize,
              height: markerSize,
            }}
            onClick={() => onIssueClick(issue)}
          >
            {/* Marker Icon */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 animate-pulse"
              style={{ 
                backgroundColor: markerColor,
                color: 'white'
              }}
            >
              {getMarkerIcon(issue)}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap max-w-xs">
                <div className="font-medium mb-1">{issue.title}</div>
                <div className="text-gray-300 mb-1">{issue.description}</div>
                {issue.suggestion && (
                  <div className="text-blue-300 text-xs italic">💡 {issue.suggestion}</div>
                )}
                <div className="text-gray-400 text-xs mt-1 capitalize">
                  {issue.severity} • {issue.category}
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>

            {/* Pulsing ring for critical/high issues */}
            {(issue.severity === 'critical' || issue.severity === 'high') && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: markerColor,
                  opacity: 0.3,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Legend for marker types */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 pointer-events-auto">
        <div className="text-xs font-medium text-gray-700 mb-2">Validation Issues</div>
        <div className="space-y-1">
          {[
            { severity: 'critical', label: 'Critical', color: '#DC2626' },
            { severity: 'high', label: 'High', color: '#EF4444' },
            { severity: 'medium', label: 'Medium', color: '#F59E0B' },
            { severity: 'low', label: 'Low', color: '#3B82F6' }
          ].map(({ severity, label, color }) => {
            const count = issues.filter(i => i.severity === severity).length;
            if (count === 0) return null;
            
            return (
              <div key={severity} className="flex items-center space-x-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600">{label} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValidationMarkers;