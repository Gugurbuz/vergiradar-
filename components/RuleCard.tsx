import React, { useState } from 'react';
import { Rule, RuleParameter } from '../types';
import Card from './shared/Card';
import Badge from './shared/Badge';
import { ChevronDown, Pencil, Check, X } from 'lucide-react';
import RuleLogicFlow from './RuleLogicFlow';
import RuleParameters from './RuleParameters';

interface RuleCardProps {
    rule: Rule;
    onUpdate: (updatedRule: Rule) => void;
}

const commonInputClasses = "w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors";

const RuleCard: React.FC<RuleCardProps> = ({ rule, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRule, setEditableRule] = useState<Rule>(rule);

    const handleEditToggle = () => {
        if (!isEditing) {
            // Entering edit mode, make sure card is expanded
            setIsExpanded(true);
            setEditableRule(rule); // Reset to original rule data on new edit session
        }
        setIsEditing(!isEditing);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        // No need to reset editableRule, it will be reset on next edit toggle
    };

    const handleSave = () => {
        onUpdate(editableRule);
        setIsEditing(false);
    };

    const handleInputChange = (field: keyof Rule, value: string) => {
        setEditableRule(prev => ({ ...prev, [field]: value }));
    };

    const handleParametersChange = (newParams: RuleParameter[]) => {
        setEditableRule(prev => ({ ...prev, parameters: newParams }));
    };

    const displayRule = isEditing ? editableRule : rule;

    return (
        <Card>
            <div className="flex justify-between items-start cursor-pointer" onClick={() => !isEditing && setIsExpanded(!isExpanded)}>
                <div className="pr-4 flex-1">
                     {isEditing ? (
                        <input
                            type="text"
                            value={editableRule.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`${commonInputClasses} text-xl font-bold`}
                        />
                    ) : (
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{rule.id}: {rule.description}</h3>
                    )}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
                    {!isEditing ? (
                        <button onClick={handleEditToggle} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <Pencil size={20} className="text-gray-500" />
                        </button>
                    ) : (
                        <>
                        <button onClick={handleSave} className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                            <Check size={20} className="text-green-500" />
                        </button>
                        <button onClick={handleCancel} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors">
                            <X size={20} className="text-red-500" />
                        </button>
                        </>
                    )}
                    <div className="hidden sm:flex items-center space-x-4">
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                           {rule.category}
                        </span>
                        <Badge type={rule.severity} />
                    </div>
                    <ChevronDown className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
             <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px]' : 'max-h-0'}`}>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-6">
                    <RuleLogicFlow rule={displayRule} />
                    
                    {displayRule.parameters && displayRule.parameters.length > 0 && (
                        <RuleParameters 
                            parameters={displayRule.parameters}
                            onParametersChange={handleParametersChange}
                            isEditing={isEditing}
                        />
                    )}

                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Mantık</h4>
                        {isEditing ? (
                            <textarea
                                value={editableRule.logic_text}
                                onChange={(e) => handleInputChange('logic_text', e.target.value)}
                                className={`${commonInputClasses} min-h-[80px] font-sans`}
                                rows={3}
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{rule.logic_text}</p>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Gerekli Veri</h4>
                         {isEditing ? (
                            <input
                                type="text"
                                value={editableRule.required_data}
                                onChange={(e) => handleInputChange('required_data', e.target.value)}
                                className={`${commonInputClasses} font-mono text-sm`}
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 mt-1 font-mono text-sm">{rule.required_data}</p>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Örnek Kod (SQL)</h4>
                        {isEditing ? (
                             <textarea
                                value={editableRule.pseudo_code}
                                onChange={(e) => handleInputChange('pseudo_code', e.target.value)}
                                className={`${commonInputClasses} min-h-[150px] font-mono text-sm`}
                                rows={6}
                            />
                        ) : (
                            <div className="mt-2 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                                    <code>{rule.pseudo_code}</code>
                                </pre>
                            </div>
                            )}
                    </div>
                    { (isEditing || rule.notes) && (
                         <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Notlar</h4>
                             {isEditing ? (
                                <textarea
                                    value={editableRule.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    className={`${commonInputClasses} min-h-[60px] font-sans`}
                                    placeholder="Kural ile ilgili ek notlar..."
                                    rows={2}
                                />
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{rule.notes}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default RuleCard;