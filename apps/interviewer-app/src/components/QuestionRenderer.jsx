import React from 'react';

function QuestionRenderer({ question, value, onChange, onCheckboxChange, disabled = false }) {
  const { id, label, type, required, options = [] } = question;

  const renderLabel = () => <label htmlFor={id}>{label}{required && ' *'}</label>;

  switch (type) {
    case 'text':
      return (
        <div className="form-group">
          {renderLabel()}
          <input type="text" id={id} name={id} value={value || ''} onChange={onChange} required={!!required} disabled={disabled} />
        </div>
      );
    case 'textarea':
      return (
        <div className="form-group">
          {renderLabel()}
          <textarea id={id} name={id} value={value || ''} onChange={onChange} required={!!required} rows="5" disabled={disabled} />
        </div>
      );
    case 'radio':
      return (
        <div className="form-group">
          {renderLabel()}
          <div className="radio-group">
            {options.map((option, index) => (
              <div key={`${id}-${index}`} className="radio-option">
                <input type="radio" id={`${id}-${option}`} name={id} value={option} checked={value === option} onChange={onChange} required={!!required} disabled={disabled} />
                <label htmlFor={`${id}-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>
      );
    case 'checkbox':
      return (
        <div className="form-group">
          {renderLabel()}
          <div className="checkbox-group">
            {options.map((option, index) => (
              <div key={`${id}-${index}`} className="checkbox-option">
                <input type="checkbox" id={`${id}-${option}`} name={id} value={option} checked={(Array.isArray(value) && value.includes(option))} onChange={onCheckboxChange} disabled={disabled} />
                <label htmlFor={`${id}-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <div className="form-group validation-message error"><p>סוג שאלה לא נתמך: {type}</p></div>;
  }
}
export default QuestionRenderer;
