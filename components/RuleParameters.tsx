import React from 'react';
import { RuleParameter, ParameterType } from '../types';

interface RuleParametersProps {
    parameters: RuleParameter[];
    onParametersChange: (newParams: RuleParameter[]) => void;
    isEditing: boolean;
}

const RuleParameters: React.FC<RuleParametersProps> = ({ parameters, onParametersChange, isEditing }) => {
    // FIX: Handle controlled number inputs gracefully. When the input is cleared, this logic
    // reverts to the existing value to prevent invalid states (like NaN or an empty string for a number type).
    const handleChange = (id: string, rawValue: string) => {
        const newParams = parameters.map(p => {
            if (p.id !== id) return p;

            if (p.type === ParameterType.Number) {
                // If the input is cleared, revert to the current value. Otherwise, update with the new number.
                return { ...p, value: rawValue === '' ? p.value : Number(rawValue) };
            }
            return { ...p, value: rawValue };
        });
        onParametersChange(newParams);
    };

    const renderInput = (param: RuleParameter) => {
        const commonInputClasses = "w-full bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
        
        switch (param.type) {
            case ParameterType.Number:
                return (
                    <div className="relative">
                        <input
                            type="number"
                            id={param.id}
                            // FIX: Always provide a string to the value prop to avoid React controlled/uncontrolled warnings.
                            value={String(param.value ?? '')}
                            onChange={(e) => handleChange(param.id, e.target.value)}
                            className={`${commonInputClasses} ${param.unit ? 'pr-14' : ''}`}
                            disabled={!isEditing}
                            // UX Improvement: Add step and min attributes for better usability.
                            step="1"
                            min="0"
                        />
                        {param.unit && (
                            // UX Improvement: Prevent clicks on the unit badge.
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 dark:text-gray-400 pointer-events-none">
                                {param.unit}
                            </span>
                        )}
                    </div>
                );
            case ParameterType.Text:
                 return <input type="text" id={param.id} value={param.value as string} onChange={(e) => handleChange(param.id, e.target.value)} className={commonInputClasses} disabled={!isEditing} />;
            default:
                return null;
        }
    };

    return (
        <div className={`p-4 rounded-lg ${isEditing ? 'bg-red-50 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Dinamik Parametreler</h4>
            {isEditing ? (
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Aşağıdaki alanları düzenleyerek kuralın eşik değerlerini değiştirin.</p>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Bu kuralın davranışını aşağıdaki parametreler belirler.</p>
            )}
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {parameters.map(param => (
                    <div key={param.id}>
                        <label htmlFor={param.id} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {param.label}
                        </label>
                        {renderInput(param)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RuleParameters;
