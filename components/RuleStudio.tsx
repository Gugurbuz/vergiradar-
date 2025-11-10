import React, { useState, useMemo } from 'react';
import { mockRules } from '../services/mockData';
import { Rule } from '../types';
import RuleCard from './RuleCard';
import { ChevronDownIcon } from './icons';

const RuleStudio: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>(mockRules);

    const handleUpdateRule = (updatedRule: Rule) => {
        setRules(currentRules =>
            currentRules.map(rule => (rule.id === updatedRule.id ? updatedRule : rule))
        );
    };

    const rulesByCategory = useMemo(() => {
        return rules.reduce((acc, rule) => {
            const category = rule.category || 'Diğer';
            (acc[category] = acc[category] || []).push(rule);
            return acc;
        }, {} as Record<string, Rule[]>);
    }, [rules]);

    const sortedCategories = useMemo(() => Object.keys(rulesByCategory).sort((a, b) => a.localeCompare(b)), [rulesByCategory]);
    
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
        () => sortedCategories.reduce((acc, category) => {
            acc[category] = true; // Default to all categories being expanded
            return acc;
        }, {} as Record<string, boolean>)
    );

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">AI Denetim Kural Seti</h2>
            <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-md">
                Yeni Kural Ekle
            </button>
        </div>
        <div className="space-y-8 mt-6">
            {sortedCategories.map(category => (
                <div key={category} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
                    <button
                        className="w-full flex justify-between items-center p-4 text-left"
                        onClick={() => toggleCategory(category)}
                        aria-expanded={expandedCategories[category]}
                    >
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{category} ({rulesByCategory[category].length} Kural)</h3>
                        <ChevronDownIcon className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCategories[category] && (
                        <div className="p-6 pt-2 space-y-6 border-t border-gray-200 dark:border-gray-700">
                            {rulesByCategory[category]
                               .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
                               .map(rule => (
                                <RuleCard key={rule.id} rule={rule} onUpdate={handleUpdateRule} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default RuleStudio;