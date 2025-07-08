"use client";
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff,
  Settings,
  Filter,
  Zap,
  Home,
  Users,
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ValidationIssue, ValidationRule } from '@/hooks/useValidationRules';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  validationRules: ValidationRule[];
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
  onClose: () => void;
  onIssueClick: (issue: ValidationIssue) => void;
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
  onAutoFix?: (issue: ValidationIssue) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  validationRules,
  summary,
  onClose,
  onIssueClick,
  onRuleToggle,
  onAutoFix
}) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'rules'>('issues');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['critical', 'high']));

  const getSeverityIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: ValidationIssue['category']) => {
    switch (category) {
      case 'geometry':
        return <Zap className="w-4 h-4" />;
      case 'architecture':
        return <Home className="w-4 h-4" />;
      case 'accessibility':
        return <Users className="w-4 h-4" />;
      case 'building_code':
        return <Shield className="w-4 h-4" />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    return true;
  });

  const groupedIssues = filteredIssues.reduce((groups, issue) => {
    const key = issue.severity;
    if (!groups[key]) groups[key] = [];
    groups[key].push(issue);
    return groups;
  }, {} as Record<string, ValidationIssue[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Validation Results</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-red-600">{summary.critical + summary.high}</div>
              <div className="text-xs text-gray-600">Critical/High</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-yellow-600">{summary.medium}</div>
              <div className="text-xs text-gray-600">Medium</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-blue-600">{summary.low}</div>
              <div className="text-xs text-gray-600">Low</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-2xl font-bold text-green-600">{summary.total === 0 ? '✓' : summary.total}</div>
              <div className="text-xs text-gray-600">Total Issues</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'issues'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Issues ({summary.total})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'rules'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rules ({validationRules.length})
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'issues' ? (
            <div className="p-4">
              {/* Filters */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="geometry">Geometry</option>
                    <option value="architecture">Architecture</option>
                    <option value="accessibility">Accessibility</option>
                    <option value="building_code">Building Code</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Issues List */}
              {summary.total === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
                  <p className="text-gray-500">Your floor plan passes all validation checks!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedIssues)
                    .sort(([a], [b]) => {
                      const order = ['critical', 'high', 'medium', 'low'];
                      return order.indexOf(a) - order.indexOf(b);
                    })
                    .map(([severity, severityIssues]) => (
                      <div key={severity} className={`border rounded-lg ${getSeverityColor(severity)}`}>
                        <button
                          onClick={() => toggleCategory(severity)}
                          className="w-full flex items-center justify-between p-3 text-left"
                        >
                          <div className="flex items-center space-x-2">
                            {getSeverityIcon(severity as ValidationIssue['severity'])}
                            <span className="font-medium capitalize">{severity}</span>
                            <span className="text-sm">({severityIssues.length})</span>
                          </div>
                          {expandedCategories.has(severity) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        
                        {expandedCategories.has(severity) && (
                          <div className="border-t border-current border-opacity-20">
                            {severityIssues.map((issue) => (
                              <div
                                key={issue.id}
                                className="p-3 border-b border-current border-opacity-10 last:border-b-0 hover:bg-white hover:bg-opacity-50 cursor-pointer"
                                onClick={() => onIssueClick(issue)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      {getTypeIcon(issue.type)}
                                      {getCategoryIcon(issue.category)}
                                      <span className="font-medium text-sm">{issue.title}</span>
                                    </div>
                                    <p className="text-sm opacity-90 mb-2">{issue.description}</p>
                                    {issue.suggestion && (
                                      <p className="text-xs opacity-75 italic">💡 {issue.suggestion}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-1 ml-2">
                                    {issue.autoFix && onAutoFix && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onAutoFix(issue);
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        title="Auto-fix this issue"
                                      >
                                        Fix
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {/* Validation Rules */}
              <div className="space-y-3">
                {validationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(rule.category)}
                      <div>
                        <div className="font-medium text-sm">{rule.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{rule.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRuleToggle(rule.id, !rule.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Validation runs automatically as you edit</span>
              <span>{filteredIssues.length} of {issues.length} issues shown</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;